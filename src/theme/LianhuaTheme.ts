import { defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";

/**
 * ❗ MUI X DatePicker 必須先宣告 Types
 */
declare module "@mui/material/styles" {
  interface Components {
    MuiPickersDay?: any;
    MuiPickersYear?: any;
    MuiYearCalendar?: any;
    MuiMonthCalendar?: any;
    MuiDateCalendar?: any;
    MuiPickersSlideTransition?: any;
  }
}

// 共用 focus 禁用設定
const disableFocusStyles = {
  outline: "none !important",
  boxShadow: "none !important",
};

// IconButton active 灰色殘影清除
const disableIconActive = {
  backgroundColor: "transparent !important",
};

/* =======================================================
 * 🌞 亮色主題
 * =======================================================
 */
export const LianhuaLightTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: { main: "#4CAF50" },
    secondary: { main: "#81C784" },
    background: { default: "#f9faf9", paper: "#ffffff" },
    text: { primary: "#2E2E2E", secondary: "#555" },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    h5: { fontWeight: 600 },
    button: { textTransform: "none" },
  },

  components: {
    /* --------------------------------------------------
     * 全域 ButtonBase / IconButton 禁用 focus/active
     * -------------------------------------------------- */
    MuiCssBaseline: {
      styleOverrides: {
        // 移除所有 transition（解決色調延遲）
        '*': {
          transition: 'none !important',
        },

        // 移除按鈕 focus 外框殘影
        button: {
          '&:focus, &:focus-visible': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&:focus": disableFocusStyles,
          "&:focus-visible": disableFocusStyles,
          "&:active": disableIconActive,
        },
      },
    },

    /* --------------------------------------------------
     * DatePicker — Year / Month / Day / Calendar
     * -------------------------------------------------- */
    MuiYearCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
          "& button.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "#fff !important",
            boxShadow: "none !important",
          },
          "& button:hover": {
            backgroundColor: "#81C784 !important",
          },
          /* ---------- 自訂捲動條顏色 ---------- */
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#E0E0E0",   // 淺灰色背景
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",   // 淺灰色滾動條
            borderRadius: "4px",
          },

          /* Firefox */
          scrollbarColor: "#BDBDBD #E0E0E0",
          scrollbarWidth: "thin",
        },
      },
    },

    MuiMonthCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
          "& button.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "#fff !important",
            boxShadow: "none !important",
          },
          "& button:hover": {
            backgroundColor: "#81C784 !important",
          },
        },
      },
    },

    MuiDateCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
        },
      },
    },

    MuiPickersSlideTransition: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
        },
      },
    },

    MuiPickersDay: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "inherit !important",
            boxShadow: "none !important",
          },
          "&:hover": {
            backgroundColor: "#C8E6C9",
          },
        },
        today: {
          border: "none !important",
        },
      },
    },

    MuiPickersYear: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-selected": disableFocusStyles,
        },
      },
    },

    /* --------------------------------------------------
     * Outlined Input（移除 focus 藍框）
     * -------------------------------------------------- */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D0D0D0",   // 預設外框
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B0B0B0",   // hover 時
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4CAF50 !important",  // focus 時 → 蓮華綠
            borderWidth: "2px",
          },
        },
      },
    },

    /* --------------------------------------------------
     * AppBar
     * -------------------------------------------------- */
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#388E3C",
          color: "#fff",
        },
      },
    },

    /* --------------------------------------------------
     * Menu Item
     * -------------------------------------------------- */
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          "&.RaMenuItemLink-active": {
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
            fontWeight: 600,
          },
        },
      },
    },

    /* --------------------------------------------------
     * Card
     * -------------------------------------------------- */
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "0.2s",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
      },
    },

    /* --------------------------------------------------
     * Datagrid Table
     * -------------------------------------------------- */
    MuiTable: {
      styleOverrides: { root: { tableLayout: "fixed", width: "100%" } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          fontSize: "0.875rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          borderBottom: "1px solid rgba(0,0,0,0.12)",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        },
      },
    },

    /* --------------------------------------------------
     * Pagination 移除 focus 殘影
     * -------------------------------------------------- */
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-focusVisible": disableFocusStyles,
          "&:focus": disableFocusStyles,
          "&:focus-visible": disableFocusStyles,

          "& div": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          // 下拉選單 scrollbar
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#E0E0E0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9E9E9E",
          },

          scrollbarWidth: "thin",
          scrollbarColor: "#BDBDBD #E0E0E0",
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          maxHeight: "300px",

          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#E0E0E0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9E9E9E",
          },

          scrollbarWidth: "thin",
          scrollbarColor: "#BDBDBD #E0E0E0",
        },
      },
    },

    /* ==========================================================
    * 🌿 Left Sidebar Menu（改善層次版）
    * ========================================================== */
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          color: "#4A4A4A !important", // 子層：預設灰黑，不是綠
          fontWeight: 400,

          "&:hover": {
            backgroundColor: "rgba(76, 175, 80, 0.08)",
            color: "#2E7D32 !important",
          },

          "&.RaMenuItemLink-active": {
            backgroundColor: "rgba(76, 175, 80, 0.15) !important",
            color: "#2E7D32 !important", // 深綠字
            fontWeight: 700,              // 粗體
            "& .MuiListItemIcon-root": {
              color: "#2E7D32 !important", // 深綠 icon
            },
          },
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 42,
          transition: "padding 0.5s ease",
          color: "#2E3A45 !important",  // 父層：深灰字
          fontWeight: 500,

          "&:hover": {
            backgroundColor: "rgba(76, 175, 80, 0.06)",
            color: "#2E7D32 !important",
          },

          "&.Mui-selected": {
            backgroundColor: "rgba(76, 175, 80, 0.15) !important",
            color: "#2E7D32 !important",
            fontWeight: 700,
            "& .MuiListItemIcon-root": {
              color: "#2E7D32 !important",
            },
          },

          ".RaSidebar-expanded &": {
            paddingLeft: 20,  // 展開時只增加左 padding，不改高度
          }
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36, // 🔥 固定 icon 區域，不因展開縮放
          color: "#555",
          ".RaSidebar-expanded &": {
            color: "#4CAF50", // 展開後 icon 綠色（可選）
          }
        },
      },
    },

  },
});

/* =======================================================
 * 🌑 暗色主題
 * =======================================================
 */
export const LianhuaDarkTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "dark",
    primary: { main: "#81C784" },
    secondary: { main: "#A5D6A7" },
    background: { default: "#1E1E1E", paper: "#2A2A2A" },
    text: { primary: "#E8F5E9", secondary: "#BDBDBD" },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    button: { textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
      button:focus,
      button:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }
    `,
    },


    MuiIconButton: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&:focus": disableFocusStyles,
          "&:focus-visible": disableFocusStyles,
          "&:active": disableIconActive,
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#263238",
          borderRadius: 6,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.3)",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.5)",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#81C784 !important",
            borderWidth: "2px",
          },
        },

        input: {
          color: "#E8F5E9",
        },
      },
    },

    MuiPickersDay: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "inherit !important",
            boxShadow: "none !important",
          },
          "&:hover": {
            backgroundColor: "#1B5E20",
          },
        },
        today: {
          border: "none !important",
        },
      },
    },

    MuiPickersYear: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-selected": disableFocusStyles,
        },
      },
    },

    MuiYearCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
          "& button.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "#fff !important",
            boxShadow: "none !important",
          },
          "& button:hover": {
            backgroundColor: "#81C784 !important",
          },
          /* ---------- 自訂捲動條顏色 ---------- */
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#E0E0E0",   // 淺灰色背景
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",   // 淺灰色滾動條
            borderRadius: "4px",
          },

          /* Firefox */
          scrollbarColor: "#BDBDBD #E0E0E0",
          scrollbarWidth: "thin",
        },
      },
    },

    MuiMonthCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
          "& button.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "#fff !important",
            boxShadow: "none !important",
          },
          "& button:hover": {
            backgroundColor: "#81C784 !important",
          },
        },
      },
    },

    MuiDateCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
        },
      },
    },

    MuiPickersSlideTransition: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#2E7D32",
          color: "#fff",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          "&.RaMenuItemLink-active": {
            backgroundColor: "#33691E",
            color: "#C8E6C9",
            fontWeight: 600,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#263238",
          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          fontSize: "0.875rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#1B5E20",
          color: "#C8E6C9",
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-focusVisible": disableFocusStyles,
          "&:focus": disableFocusStyles,
          "&:focus-visible": disableFocusStyles,

          "& div": {
            ...disableFocusStyles,
            "&:focus": disableFocusStyles,
            "&.Mui-focusVisible": disableFocusStyles,
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          // 下拉選單 scrollbar
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#E0E0E0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9E9E9E",
          },

          scrollbarWidth: "thin",
          scrollbarColor: "#BDBDBD #E0E0E0",
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          maxHeight: "300px",

          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#E0E0E0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9E9E9E",
          },

          scrollbarWidth: "thin",
          scrollbarColor: "#BDBDBD #E0E0E0",
        },
      },
    },

  },
});
