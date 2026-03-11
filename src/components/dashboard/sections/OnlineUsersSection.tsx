import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { SectionHeader } from '../SectionHeader';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { WS_CONNECTION_STATUS_LABEL } from '@/types/onlineUsers';
import dayjs from 'dayjs';

/** 儀表板「線上使用者」區塊：即時顯示目前線上使用者列表與 WebSocket 連線狀態 */
export const OnlineUsersSection: React.FC = () => {
  const { onlineUsers, loading, error, connectionStatus } = useOnlineUsers();

  const statusColor =
    connectionStatus === 'connected'
      ? 'success.main'
      : connectionStatus === 'error'
        ? 'error.main'
        : 'warning.main';

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader
        title="線上使用者"
        subtitle="Currently Online"
        icon={<PeopleIcon color="primary" />}
      />
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {connectionStatus !== 'idle' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: statusColor,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {WS_CONNECTION_STATUS_LABEL[connectionStatus]}
              </Typography>
            </Box>
          )}
          {connectionStatus === 'reconnecting' && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
              連線中斷，正在自動重連…
            </Typography>
          )}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error.message}
            </Typography>
          )}
          {!loading && !error && onlineUsers.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              目前無線上使用者
            </Typography>
          )}
          {!loading && onlineUsers.length > 0 && (
            <List dense disablePadding sx={{ maxHeight: 240, overflow: 'auto' }}>
              {onlineUsers.map((u) => (
                <ListItem key={u.id} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={u.fullName || u.username}
                    secondary={`${u.username} · ${dayjs(u.onlineAt).format('HH:mm')}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

OnlineUsersSection.displayName = 'OnlineUsersSection';
