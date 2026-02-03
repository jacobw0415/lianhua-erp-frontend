import React from 'react';
import {
  Paper,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { ChartEmptyState } from '../ChartEmptyState';
import { getScrollbarStyles } from '@/utils/scrollbarStyles';
import { useTheme } from '@mui/material/styles';
import type { CustomerRetentionPoint } from '@/hooks/useDashboardAnalytics';

export interface CustomerRetentionSectionProps {
  data: CustomerRetentionPoint[];
  isLoading: boolean;
  dormantOnly: boolean;
  onDormantOnlyChange: (v: boolean) => void;
}

export const CustomerRetentionSection: React.FC<CustomerRetentionSectionProps> = ({
  data,
  isLoading,
  dormantOnly,
  onDormantOnlyChange,
}) => {
  const theme = useTheme();
  const scrollbarStyles = getScrollbarStyles(theme);
  const displayList = data.slice(0, 8);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <PersonSearchIcon fontSize="small" /> 客戶留存與回購風險分析
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={dormantOnly ? 'dormant' : 'all'}
          exclusive
          onChange={(_, v) => onDormantOnlyChange(v === 'dormant')}
          sx={{ height: 28 }}
        >
          <ToggleButton value="all">全部</ToggleButton>
          <ToggleButton value="dormant">沉睡風險 (&gt;60天)</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 260,
          maxHeight: 260,
          overflowY: 'auto',
          pr: 1,
          ...scrollbarStyles,
        }}
      >
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : data.length > 0 ? (
          <List dense sx={{ py: 0 }}>
            {displayList.map((row, i) => (
              <ListItem
                key={`${row.customerName}-${row.lastOrderDate}-${i}`}
                divider
                sx={{ py: 0.5 }}
              >
                <ListItemText
                  primary={row.customerName}
                  secondary={`最後訂單 ${row.lastOrderDate} · ${row.daysSinceLastOrder} 天前`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label={row.status}
                  color={row.status.includes('沉睡') ? 'warning' : 'default'}
                  variant="outlined"
                />
              </ListItem>
            ))}
            {data.length > 8 && (
              <ListItem>
                <ListItemText secondary={`共 ${data.length} 筆，僅顯示前 8 筆`} />
              </ListItem>
            )}
          </List>
        ) : (
          <ChartEmptyState message="暫無數據" height={260} />
        )}
      </Box>
    </Paper>
  );
};

CustomerRetentionSection.displayName = 'CustomerRetentionSection';
