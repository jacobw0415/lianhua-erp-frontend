import { LinearProgress, useTheme } from "@mui/material";
import { useLoadingProgress } from "@/contexts/LoadingProgressContext";

/* ============================================================
 * 全局進度條組件（固定在頁面頂部，類似 YouTube）
 * ============================================================ */
export const GlobalLoadingProgress = () => {
  const { isLoading } = useLoadingProgress();
  const theme = useTheme();

  if (!isLoading) return null;

  return (
    <LinearProgress
      variant="indeterminate"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300, // 高於 AppBar (1100) 和 Drawer (1200)
        height: 3,
        backgroundColor: "transparent",
        "& .MuiLinearProgress-bar": {
          backgroundColor: theme.palette.mode === "dark" ? "#66BB6A" : "#4CAF50",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        "& .MuiLinearProgress-root": {
          backgroundColor: "transparent",
        },
        // 確保進度條不會影響頁面佈局
        pointerEvents: "none",
      }}
    />
  );
};

