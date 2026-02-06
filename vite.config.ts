import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // 開放對外：監聽所有介面，同時保留 localhost 存取
    host: true,
    port: 5173,
    // 開發時 API 走同源 /api，由此代理到後端，避免 CORS（本機與區網皆可登入）
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // 區網 (10.18.2.103:5173) 登入時，轉發給後端的 Origin 改為 localhost，
        // 避免後端只允許 localhost 而回 401（前端會顯示「帳號或密碼錯誤」）
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Origin", "http://localhost:5173");
            proxyReq.setHeader("Referer", "http://localhost:5173/");
          });
        },
      },
    },
  },
});
