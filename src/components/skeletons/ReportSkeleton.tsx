import { Box, Card, Skeleton, Stack, useTheme } from '@mui/material';

export const ReportSkeleton = () => {
  const theme = useTheme();

  return (
    // ★ 修改重點 1：
    // mt: 3 (對齊 ReportLayout 的 margin-top)
    // px: 3 (對齊 ReportLayout 的 padding-x，讓左右留白一致)
    // pb: 4 (對齊 ReportLayout 的 padding-bottom)
    <Box sx={{ width: '100%', mt: 3, px: 3, pb: 4 }}>
      
      {/* 1. 模擬頂部綠色 Banner (Page Header) */}
      <Skeleton
        variant="rectangular"
        height={140}
        sx={{
          borderRadius: 2, // 改為 2 以符合 Paper 的圓角
          mb: 3,           // ★ 修改重點 2：從 2 改為 3 (對齊真實 Header 的 mb)
          // 根據主題切換深淺色背景
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        }}
      />

      {/* 2. 模擬查詢條件區塊 (Filter Card) */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* 模擬 Tab 或上方選項 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width={120} height={36} />
            <Skeleton variant="rounded" width={120} height={36} />
          </Box>
          
          {/* 模擬日期選擇器與查詢按鈕 */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Skeleton variant="rounded" width={240} height={56} />
            <Skeleton variant="rounded" width={100} height={56} />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="rounded" width={120} height={56} /> {/* 匯出按鈕 */}
          </Box>
        </Stack>
      </Card>

      {/* 3. 模擬下方表格內容 (Table Content) */}
      {/* 模擬表頭 */}
      <Skeleton variant="rectangular" height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
      
      {/* 模擬多行數據 */}
      <Stack spacing={1}>
        {[...Array(6)].map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            height={60} 
            sx={{ borderRadius: 1 }} 
          />
        ))}
      </Stack>
      
      {/* 模擬底部加總行 */}
      <Skeleton variant="rectangular" height={60} sx={{ mt: 1, borderRadius: 1 }} />
    </Box>
  );
};