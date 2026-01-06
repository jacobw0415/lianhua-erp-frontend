import type { Theme } from "@mui/material";

/**
 * 統一的滾動條樣式配置（與現金流量表一致）
 */
const SCROLLBAR_CONFIG = {
  width: "6px",
  track: {
    dark: "#2A2A2A",
    light: "#f1f1f1",
  },
  thumb: {
    dark: "#555",
    light: "#c1c1c1",
  },
  thumbHover: {
    dark: "#777",
    light: "#a1a1a1",
  },
  borderRadius: "4px",
} as const;

/**
 * 獲取統一的 scrollbar 樣式（與現金流量表一致）
 * @param theme MUI 主題
 * @returns scrollbar 樣式對象
 */
export const getScrollbarStyles = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";

  return {
    "&::-webkit-scrollbar": {
      width: SCROLLBAR_CONFIG.width,
    },
    "&::-webkit-scrollbar-track": {
      background: isDark ? SCROLLBAR_CONFIG.track.dark : SCROLLBAR_CONFIG.track.light,
      borderRadius: SCROLLBAR_CONFIG.borderRadius,
    },
    "&::-webkit-scrollbar-thumb": {
      background: isDark ? SCROLLBAR_CONFIG.thumb.dark : SCROLLBAR_CONFIG.thumb.light,
      borderRadius: SCROLLBAR_CONFIG.borderRadius,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: isDark ? SCROLLBAR_CONFIG.thumbHover.dark : SCROLLBAR_CONFIG.thumbHover.light,
    },
  };
};

/**
 * 為頁面級別滾動條應用統一樣式（用於 body 元素，與現金流量表一致）
 * @param theme MUI 主題
 * @returns 清理函數
 */
export const applyBodyScrollbarStyles = (theme: Theme): (() => void) => {
  const isDark = theme.palette.mode === "dark";
  const styleId = "page-scrollbar-style";

  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  const scrollbarStyles = `
    body::-webkit-scrollbar {
      width: ${SCROLLBAR_CONFIG.width};
    }
    body::-webkit-scrollbar-track {
      background: ${isDark ? SCROLLBAR_CONFIG.track.dark : SCROLLBAR_CONFIG.track.light};
      border-radius: ${SCROLLBAR_CONFIG.borderRadius};
    }
    body::-webkit-scrollbar-thumb {
      background: ${isDark ? SCROLLBAR_CONFIG.thumb.dark : SCROLLBAR_CONFIG.thumb.light};
      border-radius: ${SCROLLBAR_CONFIG.borderRadius};
    }
    body::-webkit-scrollbar-thumb:hover {
      background: ${isDark ? SCROLLBAR_CONFIG.thumbHover.dark : SCROLLBAR_CONFIG.thumbHover.light};
    }
  `;

  styleElement.textContent = scrollbarStyles;

  // 返回清理函數
  return () => {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  };
};

/**
 * 為 MuiPickers 彈窗應用統一的 scrollbar 樣式（與現金流量表一致）
 * @param theme MUI 主題
 * @returns 清理函數
 */
export const applyMuiPickersScrollbarStyles = (theme: Theme): (() => void) => {
  const isDark = theme.palette.mode === "dark";
  const styleId = "mui-pickers-scrollbar-style";

  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  const scrollbarStyles = `
    /* MuiPickers 彈窗滾動條樣式 - 與 dashboard lianhuatheme 一致 */
    /* 使用更通用的選擇器確保覆蓋所有可能的滾動容器 */
    .MuiPickersPopper-root *::-webkit-scrollbar,
    .MuiPickersPopper-root::-webkit-scrollbar {
      width: ${SCROLLBAR_CONFIG.width} !important;
    }
    .MuiPickersPopper-root *::-webkit-scrollbar-track,
    .MuiPickersPopper-root::-webkit-scrollbar-track {
      background: ${isDark ? SCROLLBAR_CONFIG.track.dark : SCROLLBAR_CONFIG.track.light} !important;
      border-radius: ${SCROLLBAR_CONFIG.borderRadius} !important;
    }
    .MuiPickersPopper-root *::-webkit-scrollbar-thumb,
    .MuiPickersPopper-root::-webkit-scrollbar-thumb {
      background: ${isDark ? SCROLLBAR_CONFIG.thumb.dark : SCROLLBAR_CONFIG.thumb.light} !important;
      border-radius: ${SCROLLBAR_CONFIG.borderRadius} !important;
    }
    .MuiPickersPopper-root *::-webkit-scrollbar-thumb:hover,
    .MuiPickersPopper-root::-webkit-scrollbar-thumb:hover {
      background: ${isDark ? SCROLLBAR_CONFIG.thumbHover.dark : SCROLLBAR_CONFIG.thumbHover.light} !important;
    }
    /* 針對特定組件的額外選擇器 */
    .MuiPickersPopper-root .MuiPaper-root::-webkit-scrollbar,
    .MuiPickersPopper-root .MuiPickersCalendar-root::-webkit-scrollbar,
    .MuiPickersPopper-root .MuiYearCalendar-root::-webkit-scrollbar,
    .MuiPickersPopper-root .MuiMonthCalendar-root::-webkit-scrollbar,
    .MuiPickersPopper-root .MuiPickersYear-root::-webkit-scrollbar,
    .MuiPickersPopper-root .MuiPickersMonth-root::-webkit-scrollbar {
      width: ${SCROLLBAR_CONFIG.width} !important;
    }
    .MuiPickersPopper-root .MuiPaper-root::-webkit-scrollbar-track,
    .MuiPickersPopper-root .MuiPickersCalendar-root::-webkit-scrollbar-track,
    .MuiPickersPopper-root .MuiYearCalendar-root::-webkit-scrollbar-track,
    .MuiPickersPopper-root .MuiMonthCalendar-root::-webkit-scrollbar-track,
    .MuiPickersPopper-root .MuiPickersYear-root::-webkit-scrollbar-track,
    .MuiPickersPopper-root .MuiPickersMonth-root::-webkit-scrollbar-track {
      background: ${isDark ? SCROLLBAR_CONFIG.track.dark : SCROLLBAR_CONFIG.track.light} !important;
      border-radius: ${SCROLLBAR_CONFIG.borderRadius} !important;
    }
    .MuiPickersPopper-root .MuiPaper-root::-webkit-scrollbar-thumb,
    .MuiPickersPopper-root .MuiPickersCalendar-root::-webkit-scrollbar-thumb,
    .MuiPickersPopper-root .MuiYearCalendar-root::-webkit-scrollbar-thumb,
    .MuiPickersPopper-root .MuiMonthCalendar-root::-webkit-scrollbar-thumb,
    .MuiPickersPopper-root .MuiPickersYear-root::-webkit-scrollbar-thumb,
    .MuiPickersPopper-root .MuiPickersMonth-root::-webkit-scrollbar-thumb {
      background: ${isDark ? SCROLLBAR_CONFIG.thumb.dark : SCROLLBAR_CONFIG.thumb.light} !important;
      border-radius: ${SCROLLBAR_CONFIG.borderRadius} !important;
    }
    .MuiPickersPopper-root .MuiPaper-root::-webkit-scrollbar-thumb:hover,
    .MuiPickersPopper-root .MuiPickersCalendar-root::-webkit-scrollbar-thumb:hover,
    .MuiPickersPopper-root .MuiYearCalendar-root::-webkit-scrollbar-thumb:hover,
    .MuiPickersPopper-root .MuiMonthCalendar-root::-webkit-scrollbar-thumb:hover,
    .MuiPickersPopper-root .MuiPickersYear-root::-webkit-scrollbar-thumb:hover,
    .MuiPickersPopper-root .MuiPickersMonth-root::-webkit-scrollbar-thumb:hover {
      background: ${isDark ? SCROLLBAR_CONFIG.thumbHover.dark : SCROLLBAR_CONFIG.thumbHover.light} !important;
    }
  `;

  styleElement.textContent = scrollbarStyles;

  // 返回清理函數
  return () => {
    // 不移除樣式，因為可能有多個組件使用
  };
};
