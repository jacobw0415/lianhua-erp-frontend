import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  /** 穩定預打包 MUI／Emotion，減少 dev 時「Outdated Optimize Dep」與單一 icon chunk 不一致 */
  optimizeDeps: {
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
    ],
  },
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true, // 允許透過 IP  訪問前端
    port: 5173,
    proxy: {
      // 0. SSE 長連線：獨立規則，避免被一般 API timeout 中斷
      "/api/session/stream": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        // SSE 可能長時間不關閉，這裡提高 timeout 避免代理提前斷線
        timeout: 0,
        proxyTimeout: 0,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("[Vite Proxy SSE Error]:", err.message);
          });
        },
      },
      // 1. 處理一般 API 與 Stream 請求
      "/api": {
        // 建議改為 127.0.0.1，防止某些系統將 localhost 解析為 ::1 (IPv6) 導致後端拒絕連線
        target: "http://127.0.0.1:8080", 
        changeOrigin: true,
        // 一般 API 仍保留合理超時；SSE 由上方專用規則處理
        timeout: 120000,
        proxyTimeout: 120000,
        configure: (proxy) => {
          // 錯誤監聽：若轉發失敗，會在 Vite 終端機顯示具體原因
          proxy.on("error", (err) => {
            console.error("[Vite Proxy Error]:", err.message);
          });

          proxy.on("proxyReq", (proxyReq, req) => {
            // 保持與瀏覽器實際來源一致，避免 Spring Security 因 Origin 不符而拒絕
            const origin =
              (req?.headers?.origin as string | undefined) ||
              (req?.headers?.Origin as string | undefined);
            const referer =
              (req?.headers?.referer as string | undefined) ||
              (req?.headers?.Referer as string | undefined);

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
      // 2. 處理 WebSocket 請求
      "/ws": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on("proxyReqWs", (proxyReq, req, socket) => {
            // 對齊 Origin，防止 Spring Security 斷開連線
            const origin =
              (req?.headers?.origin as string | undefined) ||
              (req?.headers?.Origin as string | undefined);
            if (origin) {
              proxyReq.setHeader("Origin", origin);
            }

            // 確保 Socket 異常時能被回收，防止記憶體洩漏
            socket.on("error", (err) => {
              console.error("[Vite WS Socket Error]:", err.message);
              socket.destroy();
            });
          });

          proxy.on("error", (err) => {
            console.warn(`[Vite WS Proxy General Error]: ${err.message}`);
          });
        },
      },
    },
  },
});