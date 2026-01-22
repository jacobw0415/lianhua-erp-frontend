import React, { useEffect } from "react";
import { useTheme, Typography, Box, Chip, Button } from "@mui/material";
import {
  TextInput,
  useRecordContext,
  useRedirect,
  Toolbar,
  SaveButton,
} from "react-admin";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import type { ReceiptListRow } from "./ReceiptList"; // 引用您之前的型別定義

/* -------------------------------------------------------
 * 🛠️ 自定義 Toolbar
 * ------------------------------------------------------- */
const ReceiptEditToolbar = (props: any) => {
  const record = useRecordContext<ReceiptListRow>();
  const redirect = useRedirect();
  const isVoided = record?.status === "VOIDED";

  return (
    <Toolbar {...props} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Button
        variant="outlined"
        color="success"
        startIcon={<ArrowBackIcon />}
        onClick={() => redirect("list", "receipts")}
      >
        返回列表
      </Button>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isVoided ? (
          <Box sx={{ display: "flex", alignItems: "center", color: "error.main" }}>
            <LockIcon sx={{ fontSize: 18, mr: 1 }} />
            <Typography variant="body2" fontWeight={600}>
              此單據已作廢，功能已鎖定
            </Typography>
          </Box>
        ) : (
          <SaveButton label="儲存變更" color="success" />
        )}
      </Box>
    </Toolbar>
  );
};

/* -------------------------------------------------------
 * ⭐ 收款紀錄編輯頁面
 * ------------------------------------------------------- */
export const ReceiptEdit: React.FC = () => {
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  useEffect(() => {
    return applyBodyScrollbarStyles(theme);
  }, [theme]);

  return (
    <GenericEditPage
      resource="receipts"
      title="編輯收款紀錄"
      width="700px"
      toolbar={<ReceiptEditToolbar />}
      onSuccess={() => {
        showAlert({
          title: "更新成功",
          message: "收款紀錄備註已成功更新",
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "receipts"), 500);
      }}
    >
      <ReceiptFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 收款紀錄欄位排版
 * ------------------------------------------------------- */
const ReceiptFormFields: React.FC = () => {
  const record = useRecordContext<ReceiptListRow & { voidedAt?: string; voidReason?: string }>();
  const { showAlert } = useGlobalAlert();

  if (!record) return <Typography sx={{ p: 2 }}>載入中...</Typography>;

  const isVoided = record.status === "VOIDED";

  // 🛡️ 攔截作廢單據提交
  useEffect(() => {
    if (isVoided) {
      const form = document.querySelector('form');
      if (form) {
        const handleSubmit = (e: Event) => {
          e.preventDefault();
          showAlert({
            title: "無法編輯",
            message: "此收款紀錄已作廢，無法進行任何修改。",
            severity: "warning",
            hideCancel: true,
          });
        };
        form.addEventListener('submit', handleSubmit, true);
        return () => form.removeEventListener('submit', handleSubmit, true);
      }
    }
  }, [isVoided, showAlert]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 2.5,
    mb: 2,
    width: "100%",
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* 🔹 Header: 標題與狀態 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: isVoided ? 2 : 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📄 收款明細資訊
        </Typography>
        <Chip
          size="small"
          label={isVoided ? "已作廢" : "有效"}
          color={isVoided ? "error" : "success"}
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      {/* ⚠️ 作廢資訊區 (深色排版樣式) */}
      {isVoided && (
        <Box
          sx={{
            gridColumn: "1 / -1",
            mb: 3,
            p: 2,
            borderRadius: "8px",
            bgcolor: "rgba(33, 22, 10, 0.8)", 
            border: "1px solid rgba(255, 165, 0, 0.4)",
          }}
        >
          <Typography sx={{ color: "#FFB74D", fontWeight: "bold", mb: 0.5 }}>
            ⚠️ 此收款紀錄已作廢，無法編輯
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 3.5 }}>
            作廢時間：{record.voidedAt || "未紀錄"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 3.5 }}>
            作廢原因：{record.voidReason || "無"}
          </Typography>
        </Box>
      )}

      {/* 🔹 主要資料區 */}
      <Box sx={gridStyle}>
        {/* 第一列 */}
        <ReadonlyField label="收款日期" value={record.receivedDate} />
        <ReadonlyField label="訂單編號" value={record.orderNo} />

        {/* 第二列 */}
        <ReadonlyField label="客戶名稱" value={record.customerName} />
        <ReadonlyField
          label="收款金額"
          value={
            record.amount != null
              ? record.amount.toLocaleString("zh-TW", {
                  style: "currency",
                  currency: "TWD",
                  minimumFractionDigits: 0,
                })
              : "—"
          }
        />

        {/* 第三列 */}
        <ReadonlyField 
           label="收款方式" 
           value={
             record.method === "CASH" ? "現金" : 
             record.method === "TRANSFER" ? "轉帳" : 
             record.method === "CARD" ? "刷卡" : 
             record.method === "CHECK" ? "支票" : record.method
           } 
        />
        <ReadonlyField label="會計期間" value={(record as any).accountingPeriod || "—"} />

        {/* 第四列：備註 (唯一可修改) */}
        <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
          <TextInput
            source="note"
            label="備註 (可修改)"
            multiline
            minRows={3}
            fullWidth
            disabled={isVoided}
            helperText={isVoided ? "紀錄已作廢，無法修改備註" : "僅備註欄位可供修改"}
          />
        </Box>
      </Box>
    </Box>
  );
};

/* -------------------------------------------------------
 * 📝 唯讀欄位 UI 組件
 * ------------------------------------------------------- */
const ReadonlyField: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      pb: 1,
      pt: 0.5,
    }}
  >
    <Typography
      variant="caption"
      sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5 }}
    >
      {label}
    </Typography>
    <Typography sx={{ color: "text.primary", fontSize: "1rem" }}>
      {value || "—"}
    </Typography>
  </Box>
);