/**
 * 使用者上線狀態（WebSocket）— 從全域 Context 讀取
 *
 * 連線在 App 層級（OnlineUsersProvider）建立，路由切換時不重連。
 * 各頁面呼叫 useOnlineUsers() 取得同一份線上列表。
 */
export { useOnlineUsers } from "@/contexts/OnlineUsersContext";
