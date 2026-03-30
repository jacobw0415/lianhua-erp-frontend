import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlainCurrency } from '@/components/money/PlainCurrency';

interface TaskItem {
  type: 'AR_DUE' | string;
  referenceNo: string;
  targetName: string;
  dueDate: string;
  amount: number;
}

interface TaskListSectionProps {
  tasks?: TaskItem[];
}

export const TaskListSection: React.FC<TaskListSectionProps> = ({ tasks }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.shadows[1],
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AssignmentLateIcon color="error" fontSize="small" /> {t('charts.tasks.title')}
        </Typography>
        {tasks && tasks.length > 0 && (
          <Chip label={t('charts.tasks.countBadge', { count: tasks.length })} size="small" color="error" variant={isDark ? 'filled' : 'outlined'} />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {t('charts.tasks.hint')}
      </Typography>
      <Divider sx={{ mb: 1 }} />

      <Box sx={{ flexGrow: 1, minHeight: 260, display: 'flex', flexDirection: 'column' }}>
      {tasks && tasks.length > 0 ? (
        <List
          dense
          sx={{
            flex: 1,
            minHeight: 260,
            maxHeight: 260,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.action.selected,
              borderRadius: 4,
            },
          }}
        >
          {tasks.map((task, index) => (
            <ListItem
              key={`${task.type}-${task.referenceNo}-${task.dueDate}-${index}`}
              divider={index !== tasks.length - 1}
              onClick={() => navigate(task.type === 'AR_DUE' ? '/ar' : '/orders')}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Avatar sx={{ bgcolor: task.type === 'AR_DUE' ? 'error.light' : 'warning.light' }}>
                  {task.type === 'AR_DUE' ? <MoneyOffIcon /> : <ShoppingCartIcon />}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {task.targetName} ({task.referenceNo})
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {t('charts.tasks.orderDate', { date: task.dueDate })}
                  </Typography>
                }
              />
              <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 700 }}>
                  NT$ <PlainCurrency value={task.amount} />
                </Typography>
                <Chip
                  size="small"
                  label={task.type === 'AR_DUE' ? t('charts.tasks.typeAr') : t('charts.tasks.typeOrder')}
                  color={task.type === 'AR_DUE' ? 'error' : 'warning'}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ flex: 1, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
            {t('charts.tasks.empty')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('charts.tasks.emptyHint')}
          </Typography>
        </Box>
      )}
      </Box>
    </Paper>
  );
};

