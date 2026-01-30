/**
 * 儀表板圖表與字卡共用格式化
 */

/** 金額：NT$ + 千分位，大數可簡寫為 k/M */
export function formatCurrency(
  value: number | string,
  options?: { compact?: boolean; prefix?: string }
): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  const prefix = options?.prefix ?? 'NT$ ';
  if (options?.compact && Math.abs(num) >= 1_000_000) {
    return `${prefix}${(num / 1_000_000).toFixed(1)}M`;
  }
  if (options?.compact && Math.abs(num) >= 1_000) {
    return `${prefix}${(num / 1_000).toFixed(0)}k`;
  }
  return `${prefix}${num.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`;
}

/** 百分比：小數一位，可帶正負號 */
export function formatPercent(value: number | string, options?: { signed?: boolean }): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  const sign = options?.signed !== false && num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}

/** 圖表 X 軸日期：YYYY-MM → 簡短顯示 */
export function formatChartDate(isoDate: string, style: 'month' | 'short' = 'short'): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    if (style === 'month') {
      return d.toLocaleDateString('zh-TW', { month: '2-digit', year: 'numeric' }).replace('/', '/');
    }
    return d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
  } catch {
    return isoDate;
  }
}

/** 圖表 Y 軸刻度：大數用 k/M */
export function formatAxisCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `NT$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `NT$${value >= 0 ? '' : '-'}${(Math.abs(value) / 1_000).toFixed(0)}k`;
  return `NT$${value.toLocaleString()}`;
}
