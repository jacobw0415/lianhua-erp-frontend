import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

/**
 * 列表卡片中的字段项
 */
interface CardFieldItem {
  label: string;
  value: React.ReactNode;
  source?: string;
  isAction?: boolean;
  isDetail?: boolean;
  /** 字段类型，用于视觉突出 */
  fieldType?: "currency" | "date" | "text";
}

interface ListCardProps {
  fields: CardFieldItem[];
  onClick?: () => void;
  sx?: any;
}

/**
 * 检测字段类型
 */
const detectFieldType = (label: string, source?: string, value?: any): "currency" | "date" | "text" => {
  const lowerLabel = label.toLowerCase();
  const lowerSource = source?.toLowerCase() || "";

  // 检测金额字段
  if (
    lowerLabel.includes("金額") ||
    lowerLabel.includes("金额") ||
    lowerLabel.includes("amount") ||
    lowerLabel.includes("price") ||
    lowerLabel.includes("total") ||
    lowerLabel.includes("paid") ||
    lowerLabel.includes("balance") ||
    lowerSource.includes("amount") ||
    lowerSource.includes("price") ||
    lowerSource.includes("total") ||
    (typeof value === "string" && value.includes("$") || value.includes("NT$"))
  ) {
    return "currency";
  }

  // 检测日期字段
  if (
    lowerLabel.includes("日期") ||
    lowerLabel.includes("date") ||
    lowerLabel.includes("時間") ||
    lowerLabel.includes("时间") ||
    lowerSource.includes("date") ||
    lowerSource.includes("time")
  ) {
    return "date";
  }

  return "text";
};

/**
 * 格式化金额显示
 */
const formatCurrency = (value: any): string => {
  if (typeof value === "number") {
    return value.toLocaleString("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  if (typeof value === "string") {
    // 如果已经是格式化字符串，直接返回
    if (value.includes("$") || value.includes("NT$")) {
      return value;
    }
    // 尝试解析数字
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (!isNaN(num)) {
      return num.toLocaleString("zh-TW", {
        style: "currency",
        currency: "TWD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
  }
  return String(value || "-");
};

/**
 * 通用的列表卡片组件（优化版）
 * 用于在移动端显示列表数据
 * 
 * 优化特点：
 * 1. 统一垂直布局，提升可读性
 * 2. 重要信息视觉突出（金额等）
 * 3. 清晰的视觉分组
 * 4. 统一的间距和对齐
 */
export const ListCard: React.FC<ListCardProps> = ({ fields, onClick, sx }) => {
  const theme = useTheme();

  // 分离不同类型的字段
  const regularFields = fields.filter(
    (f) => !f.isAction && !f.isDetail && f.source !== "action"
  );
  const detailFields = fields.filter((f) => f.isDetail);
  const actionFields = fields.filter((f) => f.isAction || f.source === "action");

  // 获取第一个字段作为主要信息（通常是最重要的）
  const primaryField = regularFields[0];
  const secondaryFields = regularFields.slice(1);

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1.5, sm: 2 },
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.2s ease",
        boxShadow: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        "&:hover": {
          boxShadow: { xs: 2, sm: theme.shadows[4] },
          transform: { xs: "none", sm: "translateY(-2px)" },
          borderColor: theme.palette.primary.main,
        },
        cursor: onClick ? "pointer" : "default",
        width: "100%",
        maxWidth: "100%",
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* 主要信息区域（第一个字段，如果有重要信息则突出显示） */}
        {primaryField && (
          <Box
            sx={{
              mb: { xs: 1.5, sm: 2 },
              pb: { xs: 1.5, sm: 2 },
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {(() => {
              const fieldType = primaryField.fieldType || detectFieldType(
                primaryField.label,
                primaryField.source,
                primaryField.value
              );
              const isCurrency = fieldType === "currency";

              return (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      flexShrink: 0,
                    }}
                  >
                    {primaryField.label}
                  </Typography>
                  <Typography
                    component="div"
                    variant="caption"
                    sx={{
                      fontWeight: isCurrency ? 600 : 500,
                      color: isCurrency ? "primary.main" : "text.primary",
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      textAlign: "right",
                    }}
                  >
                    {isCurrency && typeof primaryField.value !== "object"
                      ? formatCurrency(primaryField.value)
                      : React.isValidElement(primaryField.value)
                      ? primaryField.value
                      : String(primaryField.value || "-")}
                  </Typography>
                </Box>
              );
            })()}
          </Box>
        )}

        {/* 次要信息区域（其他字段，统一垂直布局） */}
        {secondaryFields.length > 0 && (
          <Stack
            spacing={{ xs: 1.25, sm: 1.5 }}
            sx={{
              mb: detailFields.length > 0 || actionFields.length > 0 ? { xs: 1.5, sm: 2 } : 0,
            }}
          >
            {secondaryFields.map((field, index) => {
              const fieldType = field.fieldType || detectFieldType(
                field.label,
                field.source,
                field.value
              );
              const isCurrency = fieldType === "currency";
              const isDate = fieldType === "date";

              return (
                <Box
                  key={field.source || index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 0.75 } }}>
                    {isDate && (
                      <CalendarTodayIcon
                        sx={{
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          color: "text.secondary",
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        flexShrink: 0,
                      }}
                    >
                      {field.label}:
                    </Typography>
                  </Box>
                  <Typography
                    component="div"
                    variant="caption"
                    sx={{
                      fontWeight: isCurrency ? 600 : 500,
                      color: isCurrency ? "primary.main" : "text.primary",
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      textAlign: "right",
                    }}
                  >
                    {isCurrency && typeof field.value !== "object"
                      ? formatCurrency(field.value)
                      : React.isValidElement(field.value)
                      ? field.value
                      : String(field.value || "-")}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}

        {/* 明细按钮区域 */}
        {detailFields.length > 0 && (
          <>
            <Divider sx={{ my: { xs: 1.25, sm: 1.5 } }} />
            <Box
              sx={{
                display: "flex",
                gap: { xs: 0.75, sm: 1 },
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              {detailFields.map((field, index) => (
                <Box key={index}>{field.value}</Box>
              ))}
            </Box>
          </>
        )}

        {/* 操作按钮区域 */}
        {actionFields.length > 0 && (
          <>
            <Divider sx={{ my: { xs: 1.25, sm: 1.5 } }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: { xs: 0.75, sm: 1 },
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {actionFields.map((field, index) => (
                <Box
                  key={field.source || index}
                  sx={{
                    flex: { xs: "0 0 auto", sm: "none" },
                    minWidth: 0,
                    maxWidth: "100%",
                  }}
                >
                  {field.value}
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

ListCard.displayName = "ListCard";
