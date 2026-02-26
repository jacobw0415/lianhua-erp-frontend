import React from "react";
import { Box } from "@mui/material";
import {
  LIST_WRAPPER_CONTENT_SX,
  LIST_CONTENT_AREA_SX,
} from "@/constants/layoutConstants";

interface SettingsSectionWrapperProps {
  children: React.ReactNode;
}

/**
 * 設定／主檔類頁面用的簡化 Wrapper
 * - 沿用列表頁的白底卡片與 RWD 寬度
 * - 不包含篩選列、匯出、建立按鈕等「報表列表」功能
 */
export const SettingsSectionWrapper: React.FC<SettingsSectionWrapperProps> = ({
  children,
}) => {
  return (
    <Box sx={LIST_WRAPPER_CONTENT_SX}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.75, sm: 1.5, md: 2 },
          paddingX: { xs: 1, sm: 2, md: 2 },
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box sx={LIST_CONTENT_AREA_SX}>{children}</Box>
      </Box>
    </Box>
  );
};

export default SettingsSectionWrapper;

