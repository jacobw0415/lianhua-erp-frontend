import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  path: string;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface AlertItem {
  label: string;
  path: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface QuickActionsSectionProps {
  quickActions: QuickAction[];
  alerts: AlertItem[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  quickActions,
  alerts,
  onRefresh,
  isRefreshing = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (quickActions.length === 0 && alerts.length === 0 && !onRefresh) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: theme.palette.action.hover,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
          >
            <PendingActionsIcon fontSize="small" /> 快速操作
            {onRefresh && (
              <Button
                size="small"
                variant="outlined"
                startIcon={isRefreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={onRefresh}
                disabled={isRefreshing}
                sx={{ ml: 1 }}
              >
                {isRefreshing ? '更新中…' : '重新整理'}
              </Button>
            )}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outlined"
                size="small"
                color={action.color}
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{ whiteSpace: 'nowrap', borderRadius: 4 }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Box>
        {alerts.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            <Box
              sx={{
                minWidth: { md: 300 },
                maxWidth: { md: 400 },
                maxHeight: 100,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.action.selected,
                  borderRadius: '4px',
                },
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  position: 'sticky',
                  top: 0,
                  bgcolor: theme.palette.background.paper,
                  zIndex: 1,
                  mb: 1,
                  pb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <WarningIcon fontSize="small" color="warning" /> 待辦事項
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {alerts.map((alert) => (
                  <Chip
                    key={alert.label}
                    label={alert.label}
                    color={alert.color}
                    size="small"
                    onClick={() => navigate(alert.path)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

