import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/**
 * Polyfill for crypto.randomUUID
 * 解決某些瀏覽器或環境不支持 crypto.randomUUID 的問題
 * 這主要用於兼容第三方庫（如 Grammarly、Cursor 等）的需求
 */
if (typeof crypto !== "undefined" && !crypto.randomUUID) {
  crypto.randomUUID = function () {
    // 使用標準的 UUID v4 生成算法
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
