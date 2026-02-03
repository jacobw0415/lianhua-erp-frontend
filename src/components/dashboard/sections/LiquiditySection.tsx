import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
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
}) => (
  <DashboardChartCard
    title={
      <>
        <WaterDropIcon fontSize="small" /> 流動性與短期償債能力指標
      </>
    }
    subtitle={
      <Typography variant="caption" color="text.secondary">
        截至今日 {snapshotLabel}
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
            流動資產
          </Typography>
          <Typography variant="h6">
            NT$ <PlainCurrency value={liquidity.liquidAssets} />
          </Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            流動負債
          </Typography>
          <Typography variant="h6">
            NT$ <PlainCurrency value={liquidity.liquidLiabilities} />
          </Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            速動資產
          </Typography>
          <Typography variant="h6">
            NT$ <PlainCurrency value={liquidity.quickAssets} />
          </Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            流動比率
          </Typography>
          <Typography variant="h6" color="primary">
            {Number(liquidity.currentRatio).toFixed(2)}
          </Typography>
        </Card>
      </Box>
    ) : null}
  </DashboardChartCard>
);

LiquiditySection.displayName = 'LiquiditySection';
