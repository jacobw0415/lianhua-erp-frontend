import { type ReactNode } from 'react';
import { Box, Paper, Typography, Breadcrumbs, Fade, type SxProps, type Theme } from '@mui/material'; // ★ 1. 新增 SxProps, Theme 引用
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { ReportSkeleton } from '@/components/skeletons/ReportSkeleton';

interface ReportLayoutProps {
  /** 報表標題 (例如：資產負債表) */
  title: string;
  /** 報表副標題或說明 */
  subtitle?: string;
  /** 是否正在首次載入 (決定是否顯示骨架屏) */
  isLoading: boolean;
  /** 是否已有資料 (用於 keepPreviousData 模式，如果有舊資料就不顯示骨架屏) */
  hasData?: boolean;
  /** 右上角額外操作按鈕 (例如：設定、說明) */
  actions?: ReactNode;
  /** 自定義 Header 樣式 (例如：改背景色) */
  headerSx?: SxProps<Theme>; // ★ 2. 新增此屬性定義
  /** 頁面主要內容 (通常是 Filter 和 Table) */
  children: ReactNode;
}

export const ReportLayout = ({
  title,
  subtitle,
  isLoading,
  hasData = false,
  actions,
  headerSx, // ★ 3. 解構取出 headerSx
  children,
}: ReportLayoutProps) => {
  

  // 核心邏輯：只有在「正在讀取」且「完全沒有舊資料」時，才顯示骨架屏
  // 這能解決切換月份時的畫面閃爍問題
  const showSkeleton = isLoading && !hasData;

  if (showSkeleton) {
    return <ReportSkeleton />;
  }

  return (
    <Fade in={!showSkeleton} timeout={500}>
      <Box sx={{ width: '100%', pb: 4 }}>
        
        {/* --- 綠色 Banner (Page Header) --- */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#1b5e20', // 預設值 (深綠色)
            color: '#fff',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            ...headerSx // ★ 4. 關鍵：讓外部傳入的樣式 (紅色) 覆蓋預設值
          }}
        >
          {/* 背景裝飾 (選用，增加質感) */}
          <Box
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* 麵包屑導航 (Breadcrumbs) */}
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />} 
              aria-label="breadcrumb"
              sx={{ mb: 1, '& .MuiBreadcrumbs-li': { color: 'rgba(255,255,255,0.7)' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
                <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                財務報表
              </Box>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>{title}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    {subtitle}
                  </Typography>
                )}
                {/* 顯示最後更新時間 (模擬) */}
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.6)' }}>
                  最後更新：{new Date().toISOString().split('T')[0]}
                </Typography>
              </Box>
              
              {/* 右上角 Actions 區域 */}
              {actions && <Box>{actions}</Box>}
            </Box>
          </Box>
        </Paper>

        {/* --- 主要內容區域 (Filter + Table) --- */}
        <Box>
          {children}
        </Box>
      </Box>
    </Fade>
  );
};