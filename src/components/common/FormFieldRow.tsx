import React from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { FORM_FIELD_ROW_SX } from "@/constants/layoutConstants";

/**
 * 表單欄位列：響應式佈局
 * - xs（手機）：單欄直立排列
 * - sm 以上（電腦）：雙欄橫向排列
 * 用於新增/編輯頁面，不影響 GenericCreatePage、GenericEditPage 架構
 */
interface FormFieldRowProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const FormFieldRow: React.FC<FormFieldRowProps> = ({ children, sx }) => (
  <Box sx={sx ? [FORM_FIELD_ROW_SX, sx] : FORM_FIELD_ROW_SX}>{children}</Box>
);
