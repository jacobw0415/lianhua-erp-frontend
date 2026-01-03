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
      PaperProps={{ sx: { width: 560 } }}
    >
      <Box p={2}>
        {/* ================= Header ================= */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            💰 支出紀錄明細
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Box display="flex" gap={1} alignItems="center">
            {status && (
              <ExpenseStatusField
                source="status"
                record={expense}
              />
            )}
          </Box>
          <RecordContextProvider value={expense}>
            <Typography color="success.main" fontWeight={700}>
              金額：<CurrencyField source="amount" />
            </Typography>
          </RecordContextProvider>
        </Box>

        {/* 作廢資訊顯示 */}
        {isVoided && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, width: "100%", alignItems: "stretch" }}>
              {/* 左側：作廢資訊 */}
              <Box sx={{ flex: "0 0 auto", minWidth: 170, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="body2" fontWeight={600}>
                  此支出紀錄已作廢
                </Typography>
                {voidedAt && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
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
                    px: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    overflow: "hidden",
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.secondary" display="block" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                    作廢原因
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.3,
                    }}
                  >
                    {voidReason}
                  </Typography>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ================= 基本資訊 ================= */}
        <Paper
          variant="outlined"
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "background.default",
          }}
        >
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                支出日期
              </Typography>
              <Typography fontWeight={600}>
                {expenseDate}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                費用類別
              </Typography>
              <Typography fontWeight={600}>
                {categoryName}
              </Typography>
            </Box>
          </Box>

          {employeeName && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                員工
              </Typography>
              <Typography fontWeight={600}>
                {employeeName}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ================= 備註 ================= */}
        {note && (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                📝 備註
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  color: "text.secondary",
                }}
              >
                {note}
              </Typography>
            </Paper>
          </>
        )}

        {/* ================= 金額摘要 ================= */}
        <RecordContextProvider value={expense}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                支出金額
              </Typography>
              <Typography
                fontWeight={700}
                fontSize={18}
                color={isVoided ? "text.secondary" : "error.main"}
              >
                <CurrencyField source="amount" />
              </Typography>
            </Box>
          </Paper>
        </RecordContextProvider>
      </Box>
    </Drawer>
  );
};

