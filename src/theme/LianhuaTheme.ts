// src/theme/LianhuaTheme.ts
import { defaultTheme } from 'react-admin';
import { createTheme } from '@mui/material/styles';

export const LianhuaLightTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50', // 🌿 蓮華綠
    },
    secondary: {
      main: '#81C784', // 較亮的綠色作為輔色
    },
    background: {
      default: '#f9faf9', // 淺米白背景
      paper: '#ffffff',
    },
    text: {
      primary: '#2E2E2E',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // 按鈕不全大寫
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#388E3C', // 深綠 AppBar
          color: '#fff',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.RaMenuItemLink-active': {
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            fontWeight: 600,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

// dark theme
export const LianhuaDarkTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#81C784' }, // 淡綠 accent
    secondary: { main: '#A5D6A7' },
    background: { default: '#1E1E1E', paper: '#2A2A2A' },
    text: { primary: '#E8F5E9', secondary: '#BDBDBD' },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#2E7D32',
          color: '#fff',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.RaMenuItemLink-active': {
            backgroundColor: '#33691E',
            color: '#C8E6C9',
            fontWeight: 600,
          },
        },
      },
    },
  },
});
