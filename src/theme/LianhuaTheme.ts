// src/theme/LianhuaTheme.ts
import { defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";

// ==========================
// 🌞 亮色主題
// ==========================
export const LianhuaLightTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: { main: "#4CAF50" }, // 🌿 蓮華綠
    secondary: { main: "#81C784" }, // 較亮的綠色作為輔色
    background: {
      default: "#f9faf9", // 淺米白背景
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
    // 🌿 AppBar 樣式
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#388E3C",
          color: "#fff",
        },
      },
    },
    // 🌿 側邊選單
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
    // 🌿 卡片
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          transition: "box-shadow 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    // 🌿 表格統一樣式
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: "fixed",
          width: "100%",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          fontSize: "0.875rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "1px solid rgba(0,0,0,0.12)",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(odd)": {
            backgroundColor: "#f5f5f5",
          },
          "&:hover": {
            backgroundColor: "#f1f8e9",
          },
        },
      },
    },
    // 🌿 React Admin Datagrid 調整
    RaDatagrid: {
      styleOverrides: {
        root: {
          "& .RaDatagrid-table": {
            tableLayout: "fixed",
            width: "100%",
          },
          "& .MuiTableCell-root": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 600,
          },
        },
      },
    },
    // 🌿 按鈕
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          outline: "none !important",
          boxShadow: "none !important",

          "&:focus": {
            outline: "none !important",
            boxShadow: "none !important",
          },
          "&.Mui-focusVisible": {
            outline: "none !important",
            boxShadow: "none !important",
          },
          "& button": {
            outline: "none !important",
            boxShadow: "none !important",

            "&:focus": {
              outline: "none !important",
              boxShadow: "none !important",
            },
            "&.Mui-focusVisible": {
              outline: "none !important",
              boxShadow: "none !important",
            }
          }
        }
      }
    },
  },
});

// ==========================
// 🌑 暗色主題
// ==========================
export const LianhuaDarkTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "dark",
    primary: { main: "#81C784" }, // 淡綠 accent
    secondary: { main: "#A5D6A7" },
    background: { default: "#1E1E1E", paper: "#2A2A2A" },
    text: { primary: "#E8F5E9", secondary: "#BDBDBD" },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    button: { textTransform: "none" },
  },
  components: {
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
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: "fixed",
          width: "100%",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          fontSize: "0.875rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#1B5E20",
          color: "#C8E6C9",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(odd)": {
            backgroundColor: "#1B1B1B",
          },
          "&:hover": {
            backgroundColor: "#2E7D32",
          },
        },
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          "& .RaDatagrid-table": {
            tableLayout: "fixed",
            width: "100%",
          },
          "& .MuiTableCell-root": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 600,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          outline: "none !important",
          boxShadow: "none !important",

          "&:focus": {
            outline: "none !important",
            boxShadow: "none !important",
          },
          "&.Mui-focusVisible": {
            outline: "none !important",
            boxShadow: "none !important",
          },
          "& button": {
            outline: "none !important",
            boxShadow: "none !important",

            "&:focus": {
              outline: "none !important",
              boxShadow: "none !important",
            },
            "&.Mui-focusVisible": {
              outline: "none !important",
              boxShadow: "none !important",
            }
          }
        }
      }
    },
  },
});
