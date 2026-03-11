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
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Origin", "http://localhost:5173");
            proxyReq.setHeader("Referer", "http://localhost:5173/");
          });
        },
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
        // 強化 WebSocket 代理穩定性
        configure: (proxy) => {
          proxy.on("proxyReqWs", (proxyReq) => {
            // 對齊 Origin，防止 Spring Security 因為來源不符斷開連線
            proxyReq.setHeader("Origin", "http://localhost:5173");
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