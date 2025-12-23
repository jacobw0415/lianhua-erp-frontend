import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { RecordContextProvider } from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";

/* =========================================================
 * 型別定義
 * ========================================================= */

type ReceiptMethod = "CASH" | "TRANSFER" | "CARD" | "CHECK" | "SYSTEM_AUTO";

interface ReceiptDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  receipt?: {
    id: number;
    orderId: number;
    orderNo: string;
    customerName: string;
    receivedDate: string;
    amount: number;
    method: ReceiptMethod;
    note?: string;
  };
}

const methodMap: Record<ReceiptMethod, string> = {
  CASH: "現金",
  TRANSFER: "轉帳",
  CARD: "刷卡",
  CHECK: "支票",
  SYSTEM_AUTO: "系統產生",
};

/* =========================================================
 * Component
 * ========================================================= */

export const ReceiptDetailDrawer: React.FC<ReceiptDetailDrawerProps> = ({
  open,
  onClose,
  receipt,
}) => {
  if (!receipt) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 500 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* 標題 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            收款明細
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 收款資訊 */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "background.default",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            基本資訊
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* 訂單編號 */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                訂單編號
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {receipt.orderNo}
              </Typography>
            </Box>

            {/* 客戶 */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                客戶
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {receipt.customerName}
              </Typography>
            </Box>

            {/* 收款日期 */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                收款日期
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {receipt.receivedDate}
              </Typography>
            </Box>

            {/* 收款金額 */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                收款金額
              </Typography>
              <RecordContextProvider value={receipt}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  <CurrencyField source="amount" />
                </Typography>
              </RecordContextProvider>
            </Box>

            {/* 收款方式 */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                收款方式
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {methodMap[receipt.method] || receipt.method}
              </Typography>
            </Box>

            {/* 備註 */}
            {receipt.note && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  備註
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {receipt.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Drawer>
  );
};
