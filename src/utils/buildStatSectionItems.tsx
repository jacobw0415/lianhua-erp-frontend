import React from 'react';
import { Box } from '@mui/material';
import { PlainCurrency } from '@/components/money/PlainCurrency';
import { STAT_CARD_COLORS } from '@/constants/chartColors';
import { formatPercent } from '@/utils/dashboardFormatters';
import type { DashboardStats } from '@/hooks/useDashboardStats';
import type { StatCardProps } from '@/components/dashboard/StatCard';
import type { StatSectionConfig, StatSectionItemConfig } from '@/constants/dashboardConstants';

export type StatIconMap = Record<string, React.ReactNode>;
export type StatColorMap = typeof STAT_CARD_COLORS;

function getValueNode(
  item: StatSectionItemConfig,
  stats: DashboardStats,
  loading: boolean
): React.ReactNode {
  if (loading) return null;
  const raw = stats[item.valueKey];
  if (raw == null) return '—';
  if (item.format === 'currency') {
    const value = (
      <>
        NT$ <PlainCurrency value={Number(raw)} />
      </>
    );
    if (item.colorBySign) {
      const num = Number(raw);
      return (
        <Box sx={{ color: num >= 0 ? 'success.main' : 'error.main' }}>
          {value}
        </Box>
      );
    }
    return value;
  }
  if (item.format === 'percent') {
    const num = Number(raw);
    const value = formatPercent(num);
    if (item.colorBySign) {
      return (
        <Box sx={{ color: num >= 0 ? 'success.main' : 'error.main' }}>
          {value}
        </Box>
      );
    }
    return value;
  }
  return String(raw);
}

function getIconColor(
  item: StatSectionItemConfig,
  stats: DashboardStats,
  colorMap: StatColorMap
): string {
  if (!item.colorBySign) return colorMap[item.iconColorKey];
  const raw = stats[item.valueKey];
  const num = Number(raw);
  return num >= 0 ? colorMap.revenue : colorMap.ap;
}

/**
 * 由 STAT_SECTIONS_CONFIG 與 stats 建構 StatCard 的 items 陣列
 */
export function buildStatSectionItems(
  sectionConfig: StatSectionConfig,
  stats: DashboardStats,
  loading: boolean,
  navigate: (path: string) => void,
  iconMap: StatIconMap,
  titleIconMap: StatIconMap,
  colorMap: StatColorMap = STAT_CARD_COLORS
): { title: string; titleIcon: React.ReactNode; items: StatCardProps[] } {
  const items: StatCardProps[] = sectionConfig.items.map((item) => ({
    title: item.title,
    icon: iconMap[item.iconKey] ?? null,
    value: getValueNode(item, stats, loading) ?? '—',
    iconColor: getIconColor(item, stats, colorMap),
    loading,
    onClick: item.path ? () => navigate(item.path!) : undefined,
  }));
  return {
    title: sectionConfig.title,
    titleIcon: titleIconMap[sectionConfig.titleIconKey] ?? null,
    items,
  };
}
