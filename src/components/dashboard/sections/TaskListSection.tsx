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
} from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
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

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: isDark ? 3 : 1,
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
          <AssignmentLateIcon color="error" fontSize="small" /> 待辦任務與即期預警
        </Typography>
        {tasks && tasks.length > 0 && (
          <Chip label={`共 ${tasks.length} 筆`} size="small" color="error" variant={isDark ? 'filled' : 'outlined'} />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        點擊任一列可快速前往對應列表進行處理。
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
              backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
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
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
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
                    訂單日期：{task.dueDate}
                  </Typography>
                }
              />
              <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 700 }}>
                  NT$ <PlainCurrency value={task.amount} />
                </Typography>
                <Chip
                  size="small"
                  label={task.type === 'AR_DUE' ? '帳款催收' : '訂單處理'}
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
            目前無緊急待辦事項
          </Typography>
          <Typography variant="caption" color="text.secondary">
            帳款到期或訂單異常時，會自動在此顯示提醒。
          </Typography>
        </Box>
      )}
      </Box>
    </Paper>
  );
};

