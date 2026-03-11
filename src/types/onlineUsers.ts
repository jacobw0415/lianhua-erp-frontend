/**
 * 使用者上線狀態相關 DTO（對齊後端 GET /api/users/online 與 /topic/online-users 事件）
 */

/** GET /api/users/online 回傳的單一線上使用者 */
export interface OnlineUserDto {
  id: number;
  username: string;
  fullName: string;
  onlineAt: string; // ISO 8601，如 "2025-03-11T10:00:00"
}

/** ApiResponseDto<List<OnlineUserDto>> 的 data 陣列型別 */
export type OnlineUserList = OnlineUserDto[];

/** /topic/online-users 訂閱收到的即時事件 */
export interface UserOnlineEventDto {
  eventType: "ONLINE" | "OFFLINE";
  userId: number;
  username: string;
  fullName: string;
  at: string; // ISO 8601，如 "2025-03-11T10:00:00"
}

/** WebSocket 連線狀態，供 UI 顯示即時／斷線／重連中等 */
export type WsConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/** 各連線狀態的顯示文案，供 OnlineUsersPanel、OnlineUsersSection 等共用 */
export const WS_CONNECTION_STATUS_LABEL: Record<WsConnectionStatus, string> = {
  idle: "未連線",
  connecting: "連線中…",
  connected: "即時連線中",
  reconnecting: "重新連線中…",
  error: "連線錯誤",
};
