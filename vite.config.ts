import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy) => {
          // 保持与瀏覽器實際來源一致，避免後端/安全策略因 Origin 不符而拒絕
          proxy.on("proxyReq", (proxyReq, req) => {
            const origin =
              (req?.headers?.origin as string | undefined) ||
              (req?.headers?.Origin as string | undefined);
            const referer =
              (req?.headers?.referer as string | undefined) ||
              (req?.headers?.Referer as string | undefined);

            // 若瀏覽器沒有直接帶 Origin，嘗試從 Referer 解析（同協議/同主機/同 port）
            if (!origin && referer) {
              try {
                const url = new URL(referer);
                proxyReq.setHeader("Origin", url.origin);
              } catch {
                // ignore
              }
            } else if (origin) {
              proxyReq.setHeader("Origin", origin);
            }
            if (referer) proxyReq.setHeader("Referer", referer);
          });
        },
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
        // 強化 WebSocket 代理穩定性
        configure: (proxy) => {
          proxy.on("proxyReqWs", (proxyReq, req) => {
            // 對齊 Origin，防止 Spring Security 因為來源不符斷開連線
            const origin =
              (req?.headers?.origin as string | undefined) ||
              (req?.headers?.Origin as string | undefined);
            if (origin) {
              proxyReq.setHeader("Origin", origin);
              return;
            }

            const referer =
              (req?.headers?.referer as string | undefined) ||
              (req?.headers?.Referer as string | undefined);
            if (referer) {
              try {
                const url = new URL(referer);
                proxyReq.setHeader("Origin", url.origin);
              } catch {
                // ignore
              }
            }
          });

          // 核心修正：處理 Socket 錯誤，防止 ECONNRESET 導致的資源洩漏
          proxy.on("error", (err) => {
            console.warn(`[Vite Proxy Error]: ${err.message}`);
          });

          // 針對 WebSocket 專用的錯誤監聽
          proxy.on("proxyReqWs", (_proxyReq, _req, socket) => {
            socket.on("error", (err) => {
              // 這裡不只是壓制，而是確保 Socket 異常時能被回收
              console.error("[Vite WS Socket Error]:", err.message);
              socket.destroy();
            });
          });
        },
      },
    },
  },
});