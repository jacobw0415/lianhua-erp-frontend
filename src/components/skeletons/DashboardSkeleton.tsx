import { Box, Skeleton, useTheme } from '@mui/material';

export const DashboardSkeleton = () => {
  const theme = useTheme();
  // 模擬卡片背景色 (與 Dashboard 真實卡片一致)
  const cardBg = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  // 定義共用的 Grid 樣式 (1欄 -> 2欄 -> 4欄)
  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',           // 手機: 1欄
      sm: 'repeat(2, 1fr)', // 平板: 2欄
      md: 'repeat(4, 1fr)'  // 桌面: 4欄
    },
    gap: 3,
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 1. 模擬歡迎卡片 (Welcome Card) */}
      <Skeleton 
        variant="rectangular" 
        height={220} 
        sx={{ borderRadius: 3, mb: 3, bgcolor: cardBg }} 
      />

      {/* 2. 模擬快捷按鈕列 (Quick Actions) - 使用 Flex */}
      <Box sx={{ mb: 4 }}>
        {/* 模擬標題 */}
        <Skeleton variant="text" width={100} sx={{ mb: 1.5 }} />
        {/* 模擬按鈕群組 */}
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={120}
              height={36}
              sx={{ borderRadius: 4, flexShrink: 0 }}
            />
          ))}
        </Box>
      </Box>

      {/* 3. 模擬第一排統計：營運概況 */}
      <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
      <Box sx={{ ...gridContainerStyle, mb: 5 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            height={110} 
            sx={{ borderRadius: 2, bgcolor: cardBg }} 
          />
        ))}
      </Box>

      {/* 4. 模擬第二排統計：財務指標 */}
      <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
      <Box sx={{ ...gridContainerStyle, mb: 5 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            height={110} 
            sx={{ borderRadius: 2, bgcolor: cardBg }} 
          />
        ))}
      </Box>

      {/* 5. 模擬第三排統計：業務概況 */}
      <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
      <Box sx={gridContainerStyle}>
        {[...Array(4)].map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            height={110} 
            sx={{ borderRadius: 2, bgcolor: cardBg }} 
          />
        ))}
      </Box>
    </Box>
  );
};