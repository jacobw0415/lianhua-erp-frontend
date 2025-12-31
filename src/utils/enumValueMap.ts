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
    ACTIVE: "有效",
    VOIDED: "作廢",
    PENDING: "未付款",
    PARTIAL: "部分付款",
    PAID: "已付款",
  },
  // 帳齡區間
  agingBucket: {
    ALL: "全部",
    DAYS_0_30: "0–30 天",
    DAYS_31_60: "31–60 天",
    DAYS_60_PLUS: "60 天以上",
  },
};
