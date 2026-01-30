/**
 * 儀表板核心圖表：統一日期處理
 * - 格式 YYYY-MM-DD，避免時區偏移
 * - period 校驗 ^\d{4}-(0[1-9]|1[0-2])$
 * - 最小日期 2024-01-01，區間最大 1 年
 */
import dayjs from 'dayjs';

const MIN_SYSTEM_DATE = '2024-01-01';
const MAX_RANGE_DAYS = 365;

/** period 格式：YYYY-MM */
export const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function formatDateToYYYYMMDD(d: Date): string {
  return dayjs(d).format('YYYY-MM-DD');
}

/** 當前月份 YYYY-MM，不可選未來 */
export function getDefaultPeriod(): string {
  return dayjs().format('YYYY-MM');
}

/** 本月 1 號至今日，用於 Pareto / 採購集中度預設 */
export function getDefaultDateRange(): { start: string; end: string } {
  const start = dayjs().startOf('month').format('YYYY-MM-DD');
  const end = dayjs().format('YYYY-MM-DD');
  return { start, end };
}

/** 近 N 天（今日往前） */
export function getRecentDaysRange(days: number): { start: string; end: string } {
  const end = dayjs().format('YYYY-MM-DD');
  const start = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD');
  return { start, end };
}

/** 現金流預測預設區間：基準日（今日）～ 往後 N 天，用於 API baseDate + days */
export function getDefaultCashflowRange(daysAhead: number = 30): { start: string; end: string } {
  const start = dayjs().format('YYYY-MM-DD');
  const end = dayjs().add(daysAhead, 'day').format('YYYY-MM-DD');
  return { start, end };
}

/** 本季：當季第一天～今日 */
export function getThisQuarterRange(): { start: string; end: string } {
  const start = dayjs().startOf('quarter').format('YYYY-MM-DD');
  const end = dayjs().format('YYYY-MM-DD');
  return { start, end };
}

/** 上半年：1/1～今日（若未到 7 月）或 1/1～6/30 */
export function getFirstHalfRange(): { start: string; end: string } {
  const y = dayjs().year();
  const start = `${y}-01-01`;
  const end = dayjs().isBefore(dayjs(`${y}-07-01`))
    ? dayjs().format('YYYY-MM-DD')
    : `${y}-06-30`;
  return { start, end };
}

export function isValidPeriod(period: string): boolean {
  return PERIOD_REGEX.test(period);
}

export function isDateBeforeMin(dateStr: string): boolean {
  return dayjs(dateStr).isBefore(dayjs(MIN_SYSTEM_DATE), 'day');
}

/** 區間是否超過 1 年 */
export function isRangeOverMaxDays(start: string, end: string): boolean {
  if (!start || !end) return false;
  const days = dayjs(end).diff(dayjs(start), 'day') + 1;
  return Number.isFinite(days) && days > MAX_RANGE_DAYS;
}

/** 限制區間不超過 1 年：若超過則從 end 往前推 MAX_RANGE_DAYS；若 start/end 無效則回傳本月 */
export function clampRangeToMaxDays(start: string, end: string): { start: string; end: string } {
  const def = getDefaultDateRange();
  const s = (start && dayjs(start).isValid()) ? start : def.start;
  const e = (end && dayjs(end).isValid()) ? end : def.end;
  if (!isRangeOverMaxDays(s, e)) return { start: s, end: e };
  const endDate = dayjs(e);
  const startDate = endDate.subtract(MAX_RANGE_DAYS - 1, 'day').format('YYYY-MM-DD');
  return { start: startDate, end: e };
}
