export const notificationTargetTypeLabels: Record<string, string> = {
  purchases: "進貨單",
  expenses: "支出紀錄",
  orders: "訂單",
  system: "系統",
  user: "使用者",
  role: "角色",
  product: "商品",
  product_category: "商品分類",
  supplier: "供應商",
  order_customer: "客戶",
  order: "訂單",
  payment: "付款",
  receipt: "收款",
  ap: "應付帳款",
  ar: "應收帳款",
  dashboard: "儀表板",
  report: "報表",
  notification: "通知",
  notification_center: "通知中心",
  notification_center_list: "通知中心列表",
};

export function getNotificationTargetTypeLabel(rawType?: string): string {
  if (!rawType) return "-";
  const key = rawType.split(/\s+/)[0]?.toLowerCase();
  return notificationTargetTypeLabels[key] ?? rawType;
}

