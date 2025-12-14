import { defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";


/**
 *  MUI X Date Pickers Theme Augmentation（一定要 side-effect import）
 */
import "@mui/x-date-pickers/themeAugmentation";


/* =======================================================
 * 共用樣式
 * ======================================================= */

const disableFocusStyles = {
  outline: "none !important",
  boxShadow: "none !important",
};

const disableIconActive = {
  backgroundColor: "transparent !important",
};

/* =======================================================
 * 🌞 Light Theme
 * ======================================================= */

export const LianhuaLightTheme = createTheme({
  ...defaultTheme,

  palette: {
    mode: "light",
    primary: { main: "#4CAF50" },
    secondary: { main: "#81C784" },
    background: {
      default: "#f9faf9",
      paper: "#ffffff",
    },
    text: {
      primary: "#2E2E2E",
      secondary: "#555",
    },
  },

  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    h5: { fontWeight: 600 },
    button: { textTransform: "none" },
  },

  components: {
    /* --------------------------------------------------
     * CssBaseline
     * -------------------------------------------------- */
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          transition: "none !important",
        },
        button: {
          "&:focus, &:focus-visible": disableFocusStyles,
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
     * Date Pickers（正確 v6 元件）
     * -------------------------------------------------- */

    MuiYearCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
          },
          "& button.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "#fff !important",
          },
          "& button:hover": {
            backgroundColor: "#81C784 !important",
          },
        },
      },
    },

    MuiMonthCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
          },
          "& button.Mui-selected": {
            backgroundColor: "#66BB6A !important",
            color: "#fff !important",
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
          },
        },
      },
    },

    MuiPickersDay: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-selected": {
            backgroundColor: "#66BB6A !important",
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

    MuiPickersSlideTransition: {
      styleOverrides: {
        root: disableFocusStyles,
      },
    },

    /* --------------------------------------------------
     * Input / AppBar / Menu / Card / Table
     * -------------------------------------------------- */

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D0D0D0",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B0B0B0",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4CAF50 !important",
            borderWidth: "2px",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#388E3C",
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
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
            fontWeight: 600,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          fontSize: "0.875rem",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        },
      },
    },
  },
});

/* =======================================================
 * 🌑 Dark Theme（修正版）
 * ======================================================= */

export const LianhuaDarkTheme = createTheme({
  ...defaultTheme,

  palette: {
    mode: "dark",
    primary: { main: "#81C784" },
    secondary: { main: "#A5D6A7" },
    background: {
      default: "#1E1E1E",
      paper: "#2A2A2A",
    },
    text: {
      primary: "#E8F5E9",
      secondary: "#BDBDBD",
    },
  },

  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    button: { textTransform: "none" },
  },

  components: {
    /* --------------------------------------------------
     * 🔑 Input（解決搜尋匡看不到文字的關鍵）
     * -------------------------------------------------- */

    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#E8F5E9",               // ✅ 輸入文字顏色
        },
        input: {
          color: "#E8F5E9",
          "&::placeholder": {
            color: "#9E9E9E",
            opacity: 1,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#2A2A2A",    // ✅ 搜尋匡深色背景
          borderRadius: 8,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#555",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#777",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#81C784",
            borderWidth: 2,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& input::placeholder": {
            color: "#9E9E9E",
            opacity: 1,
          },
        },
      },
    },

    /* --------------------------------------------------
     * IconButton（你原本的設定）
     * -------------------------------------------------- */
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
     * Date Pickers（保留你的設定）
     * -------------------------------------------------- */

    MuiPickersDay: {
      styleOverrides: {
        root: {
          ...disableFocusStyles,
          "&.Mui-selected": {
            backgroundColor: "#66BB6A !important",
          },
        },
        today: {
          border: "none !important",
        },
      },
    },

    MuiYearCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
          },
        },
      },
    },

    MuiMonthCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
          },
        },
      },
    },

    MuiDateCalendar: {
      styleOverrides: {
        root: {
          "& button": {
            ...disableFocusStyles,
          },
        },
      },
    },
  },
});
