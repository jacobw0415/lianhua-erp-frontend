import React from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";

/**
 * 表單區塊字卡：用於分組表單欄位，搭配 FormFieldRow 使用
 * 響應式間距，不影響 GenericCreatePage、GenericEditPage 架構
 */
interface FormFieldCardProps {
  title: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const FormFieldCard: React.FC<FormFieldCardProps> = ({
  title,
  children,
  sx,
}) => (
  <Box sx={sx}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Box>
);
