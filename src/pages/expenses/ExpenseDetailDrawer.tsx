import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { RecordContextProvider } from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";
import { ExpenseStatusField } from "@/components/common/ExpenseStatusField";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTheme } from "@mui/material";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface ExpenseDetail {
  id: number;
  expenseDate: string;
  categoryName: string;
  amount: number;
  note?: string;
  employeeName?: string;
  status?: 'ACTIVE' | 'VOIDED';
  voidedAt?: string;
  voidReason?: string;
}

interface ExpenseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  expense?: ExpenseDetail;
}

/* =========================================================
 * Component
 * ========================================================= */

export const ExpenseDetailDrawer: React.FC<ExpenseDetailDrawerProps> = ({
  open,
  onClose,
  expense,
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  if (!expense) return null;

  const {
    expenseDate,
    categoryName,
    note,
    employeeName,
    status,
    voidedAt,
    voidReason,
  } = expense;

  const isVoided = status === 'VOIDED';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560 },
          maxWidth: { xs: "100%", sm: 560 },
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ================= Header ================= */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                fontWeight: 600,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              💰 支出紀錄明細
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ flexShrink: 0 }}
          >
            <CloseIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            {status && (
              <ExpenseStatusField
                source="status"
                record={expense}
              />
            )}
          </Box>
          <RecordContextProvider value={expense}>
            <Typography
              color="success.main"
              fontWeight={700}
              sx={{
                fontSize: { xs: "0.9rem", sm: "1rem" },
                mt: { xs: 0.5, sm: 0 },
              }}
            >
              金額：<CurrencyField source="amount" />
            </Typography>
          </RecordContextProvider>
        </Box>

        {/* 作廢資訊顯示 */}
        {isVoided && (
          <Alert
            severity="error"
            sx={{
              mt: { xs: 1.5, sm: 2 },
              mb: { xs: 1.5, sm: 2 },
              flexShrink: 0,
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                width: "100%",
                alignItems: { xs: "flex-start", sm: "stretch" },
              }}
            >
              {/* 左側：作廢資訊 */}
              <Box
                sx={{
                  flex: { xs: "none", sm: "0 0 auto" },
                  minWidth: { xs: "100%", sm: 170 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                >
                  此支出紀錄已作廢
                </Typography>
                {voidedAt && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    作廢時間：{voidedAt}
                  </Typography>
                )}
              </Box>
              {/* 右側：作廢原因 */}
              {voidReason && (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    py: 0,
                    px: { xs: 0, sm: 1 },
                    borderLeft: { xs: "none", sm: `1px solid ${theme.palette.divider}` },
                    borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: "none" },
                    pt: { xs: 1, sm: 0 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    display="block"
                    sx={{
                      lineHeight: 1.3,
                      mb: 0.5,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    }}
                  >
                    作廢原因
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.3,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    {voidReason}
                  </Typography>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        <Divider sx={{ my: { xs: 1.5, sm: 2 }, flexShrink: 0 }} />

        {/* ================= Content Area (Scrollable) ================= */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pr: { xs: 0.5, sm: 0 },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.action.disabled,
            },
          }}
        >
          {/* ================= 基本資訊 ================= */}
          <Paper
            variant="outlined"
            sx={{
              mb: { xs: 1.5, sm: 2 },
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap={{ xs: 1.5, sm: 2 }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  支出日期
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {expenseDate}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  費用類別
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {categoryName}
                </Typography>
              </Box>
            </Box>

            {employeeName && (
              <Box mt={{ xs: 1.5, sm: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  員工
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {employeeName}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* ================= 備註 ================= */}
          {note && (
            <Paper
              variant="outlined"
              sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  fontSize: { xs: "0.85rem", sm: "0.875rem" },
                  fontWeight: 600,
                }}
              >
                📝 備註
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  color: "text.secondary",
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {note}
              </Typography>
            </Paper>
          )}

          {/* ================= 金額摘要 ================= */}
          <RecordContextProvider value={expense}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  支出金額
                </Typography>
                <Typography
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: "1rem", sm: "18px" },
                    color: isVoided ? "text.secondary" : "error.main",
                  }}
                >
                  <CurrencyField source="amount" />
                </Typography>
              </Box>
            </Paper>
          </RecordContextProvider>
        </Box>
      </Box>
    </Drawer>
  );
};
