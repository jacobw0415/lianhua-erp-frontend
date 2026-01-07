import { Box, Typography, CircularProgress, keyframes } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";

/**
 * 載入中佔位符組件
 * 顯示動態的「載入中...」效果，取代空畫面狀態
 */
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

export const LoadingPlaceholder = () => {
  const theme = useTheme();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          color: theme.palette.mode === "dark" ? "#66BB6A" : "#4CAF50",
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: "0.9rem",
          fontWeight: 500,
          minWidth: "80px",
          textAlign: "center",
        }}
      >
        載入中{dots}
      </Typography>
    </Box>
  );
};

