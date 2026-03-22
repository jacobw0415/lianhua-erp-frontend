export const enumValueMap: Record<string, Record<string, string>> = {
  billingCycle: {
    MONTHLY: "每月",
    WEEKLY: "每週",
    BIWEEKLY: "雙週",
    DAILY: "每日",
  },
  // 付款方式
  method: {
    CASH: "現金",
    TRANSFER: "匯款",
    CARD: "刷卡",
    CHECK: "支票",
  },
  // 狀態
  status: {
    ACTIVE: "啟用",
    INACTIVE: "終止",
    VOIDED: "作廢",
    PENDING: "未付款",
    PARTIAL: "部分付款",
    PAID: "已付款",
  },
  // 訂單狀態
  orderStatus: {
    PENDING: "待確認",
    CONFIRMED: "已確認",
    DELIVERED: "已交付",
    CANCELLED: "已取消",
  },
  // 訂單收款狀態（與 OrderPaymentStatusField 一致）
  paymentStatus: {
    UNPAID: "未收款",
    PAID: "已收款",
  },
  // 帳齡區間
  agingBucket: {
    ALL: "全部",
    DAYS_0_30: "0–30 天",
    DAYS_31_60: "31–60 天",
    DAYS_60_PLUS: "60 天以上",
  },
  // 啟用 / 停用類布林欄位（以字串 "true"/"false" 表示）
  active: {
    true: "啟用",
    false: "終止",
  },
  enabled: {
    true: "啟用",
    false: "終止",
  },
};

export const getEnumLabel = (
  key: keyof typeof enumValueMap,
  value?: string | null,
): string => {
  if (!value) return "-";
  const map = enumValueMap[key];
  return map?.[value] ?? value;
};

