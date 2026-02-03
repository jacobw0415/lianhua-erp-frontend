import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  getDefaultPeriod,
  getDefaultDateRange,
  clampRangeToMaxDays,
  getDefaultCashflowRange,
} from '@/utils/dashboardDateUtils';

export interface DashboardFiltersState {
  trendDays: number;
  setTrendDays: (v: number) => void;
  profitLossMonths: number;
  setProfitLossMonths: (v: number) => void;
  orderFunnelMetric: 'amount' | 'count';
  setOrderFunnelMetric: (v: 'amount' | 'count') => void;
  breakEvenPeriod: string;
  setBreakEvenPeriod: (v: string) => void;
  retentionDormantOnly: boolean;
  setRetentionDormantOnly: (v: boolean) => void;
  cashflowStart: string;
  setCashflowStart: (v: string) => void;
  cashflowEnd: string;
  setCashflowEnd: (v: string) => void;
  customerConcentrationStart: string;
  setCustomerConcentrationStart: (v: string) => void;
  customerConcentrationEnd: string;
  setCustomerConcentrationEnd: (v: string) => void;
  clampedRange: { start: string; end: string };
  clampedCashflowRange: { start: string; end: string };
  clampedCustomerConcentrationRange: { start: string; end: string };
  breakEvenMonthOptions: { value: string; label: string }[];
  defaultCashflow: { start: string; end: string };
  defaultCustomerConcentrationRange: { start: string; end: string };
}

export function useDashboardFilters(): DashboardFiltersState {
  const [trendDays, setTrendDays] = useState(7);
  const [profitLossMonths, setProfitLossMonths] = useState(6);
  const [orderFunnelMetric, setOrderFunnelMetric] = useState<'amount' | 'count'>('amount');
  const [breakEvenPeriod, setBreakEvenPeriod] = useState(() => getDefaultPeriod());
  const [retentionDormantOnly, setRetentionDormantOnly] = useState(false);

  const defaultCashflow = useMemo(() => getDefaultCashflowRange(30), []);
  const [cashflowStart, setCashflowStart] = useState(defaultCashflow.start);
  const [cashflowEnd, setCashflowEnd] = useState(defaultCashflow.end);

  const defaultCustomerConcentrationRange = useMemo(() => getDefaultDateRange(), []);
  const [customerConcentrationStart, setCustomerConcentrationStart] = useState(
    defaultCustomerConcentrationRange.start
  );
  const [customerConcentrationEnd, setCustomerConcentrationEnd] = useState(
    defaultCustomerConcentrationRange.end
  );

  const clampedRange = useMemo(() => {
    const def = getDefaultDateRange();
    return clampRangeToMaxDays(def.start, def.end);
  }, []);

  const clampedCashflowRange = useMemo(
    () => clampRangeToMaxDays(cashflowStart, cashflowEnd),
    [cashflowStart, cashflowEnd]
  );

  const clampedCustomerConcentrationRange = useMemo(
    () => clampRangeToMaxDays(customerConcentrationStart, customerConcentrationEnd),
    [customerConcentrationStart, customerConcentrationEnd]
  );

  const breakEvenMonthOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const now = dayjs();
    for (let i = 0; i < 12; i++) {
      const d = now.subtract(i, 'month');
      list.push({ value: d.format('YYYY-MM'), label: d.format('YYYY年MM月') });
    }
    return list;
  }, []);

  return {
    trendDays,
    setTrendDays,
    profitLossMonths,
    setProfitLossMonths,
    orderFunnelMetric,
    setOrderFunnelMetric,
    breakEvenPeriod,
    setBreakEvenPeriod,
    retentionDormantOnly,
    setRetentionDormantOnly,
    cashflowStart,
    setCashflowStart,
    cashflowEnd,
    setCashflowEnd,
    customerConcentrationStart,
    setCustomerConcentrationStart,
    customerConcentrationEnd,
    setCustomerConcentrationEnd,
    clampedRange,
    clampedCashflowRange,
    clampedCustomerConcentrationRange,
    breakEvenMonthOptions,
    defaultCashflow,
    defaultCustomerConcentrationRange,
  };
}
