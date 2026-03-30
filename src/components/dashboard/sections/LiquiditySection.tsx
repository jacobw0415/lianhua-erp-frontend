import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { useTranslation } from 'react-i18next';
import { PlainCurrency } from '@/components/money/PlainCurrency';
import { DashboardChartCard } from '../DashboardChartCard';
import type { LiquiditySnapshot } from '@/hooks/useDashboardAnalytics';

export interface LiquiditySectionProps {
  liquidity: LiquiditySnapshot | null;
  isLoading: boolean;
  snapshotLabel: string;
}

export const LiquiditySection: React.FC<LiquiditySectionProps> = ({
  liquidity,
  isLoading,
  snapshotLabel,
}) => {
  const { t } = useTranslation('dashboard');
  return (
    <DashboardChartCard
      title={
        <>
          <WaterDropIcon fontSize="small" /> {t('charts.liquidity.title')}
        </>
      }
      subtitle={
        <Typography variant="caption" color="text.secondary">
          {t('charts.liquidity.asOf', { date: snapshotLabel })}
        </Typography>
      }
      loading={isLoading}
      hasData={!!liquidity}
      height={260}
    >
      {liquidity ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('charts.liquidity.currentAssets')}
            </Typography>
            <Typography variant="h6">
              NT$ <PlainCurrency value={liquidity.liquidAssets} />
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('charts.liquidity.currentLiabilities')}
            </Typography>
            <Typography variant="h6">
              NT$ <PlainCurrency value={liquidity.liquidLiabilities} />
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('charts.liquidity.quickAssets')}
            </Typography>
            <Typography variant="h6">
              NT$ <PlainCurrency value={liquidity.quickAssets} />
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('charts.liquidity.currentRatio')}
            </Typography>
            <Typography variant="h6" color="primary">
              {Number(liquidity.currentRatio).toFixed(2)}
            </Typography>
          </Card>
        </Box>
      ) : null}
    </DashboardChartCard>
  );
};

LiquiditySection.displayName = 'LiquiditySection';
