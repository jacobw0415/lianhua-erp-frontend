import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';

interface GreetingInfo {
  text: string;
  icon: React.ReactNode;
}

interface WelcomeCardProps {
  isDark: boolean;
  greeting: GreetingInfo;
  formattedDate: string;
  formattedTime: string;
  lastUpdated?: string | null;
}

const getCardBackground = (isDark: boolean) =>
  isDark ? 'rgba(27, 94, 32, 0.85)' : 'rgba(46, 125, 50, 0.85)';

export const getGreeting = (): GreetingInfo => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      text: '早安',
      icon: <WbSunnyIcon sx={{ fontSize: 24, ml: 1, color: '#FFD54F' }} />,
    };
  }
  if (hour < 18) {
    return {
      text: '午安',
      icon: <WbSunnyIcon sx={{ fontSize: 24, ml: 1, color: '#FFA726' }} />,
    };
  }
  return {
    text: '晚安',
    icon: <NightlightIcon sx={{ fontSize: 24, ml: 1, color: '#90CAF9' }} />,
  };
};

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  isDark,
  greeting,
  formattedDate,
  formattedTime,
  lastUpdated,
}) => {
  const cardBackground = getCardBackground(isDark);

  return (
    <Card
      sx={{
        backdropFilter: 'blur(10px)',
        background: cardBackground,
        color: '#fff',
        borderRadius: 3,
        boxShadow: isDark ? 4 : 3,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          opacity: 0.2,
        }}
      />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', letterSpacing: 0.5 }}
              >
                {greeting.text}
              </Typography>
              <Box sx={{ ml: 1.5 }}>{greeting.icon}</Box>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
              歡迎使用蓮華 ERP 管理系統
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                數據最後更新：{new Date(lastUpdated).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              textAlign: { xs: 'left', md: 'right' },
              mt: { xs: 3, md: 0 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2, lineHeight: 1 }}
              >
                {formattedTime}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  gap: 1,
                  mt: 1,
                  opacity: 0.9,
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

