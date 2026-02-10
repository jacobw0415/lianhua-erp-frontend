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

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

/* -------------------------------------------------------
 * 🔐 Expense 型別
 * ------------------------------------------------------- */
interface Expense {
  id: number;
  expenseDate: string;
  amount?: number;
  note?: string;
  status?: "ACTIVE" | "VOIDED";
  voidedAt?: string;
  voidReason?: string;
  categoryName?: string;
  employeeName?: string;
}

/* -------------------------------------------------------
 * 🛠️ 自定義 Toolbar
 * ------------------------------------------------------- */
const ExpenseEditToolbar = (props: any) => {
  const record = useRecordContext<Expense>();
  const redirect = useRedirect();
  const isVoided = record?.status === "VOIDED";

  return (
    <Toolbar {...props} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Button
        variant="outlined"
        color="success"
        startIcon={<ArrowBackIcon />}
        onClick={() => redirect("list", "expenses")}
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
 * ⭐ 支出紀錄編輯頁面
 * ------------------------------------------------------- */
export const ExpenseEdit: React.FC = () => {
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  useEffect(() => {
    return applyBodyScrollbarStyles(theme);
  }, [theme]);

  return (
    <GenericEditPage
      resource="expenses"
      title="編輯支出紀錄"
      width="700px"
      toolbar={<ExpenseEditToolbar />}
      onSuccess={() => {
        showAlert({
          title: "更新成功",
          message: "備註已成功更新",
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "expenses"));
      }}
    >
      <ExpenseFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 支出紀錄欄位 (參考進貨單作廢排版樣式)
 * ------------------------------------------------------- */
const ExpenseFormFields: React.FC = () => {
  const record = useRecordContext<Expense>();
  const { showAlert } = useGlobalAlert();

  if (!record) return <Typography sx={{ p: 2 }}>載入中...</Typography>;

  const isVoided = record.status === "VOIDED";

  // 🛡️ 攔截表單提交邏輯
  useEffect(() => {
    if (isVoided) {
      const form = document.querySelector('form');
      if (form) {
        const handleSubmit = (e: Event) => {
          e.preventDefault();
          showAlert({
            title: "無法編輯",
            message: "此支出紀錄已作廢，無法編輯。如需更正，請建立新紀錄。",
            severity: "warning",
            hideCancel: true,
          });
        };
        form.addEventListener('submit', handleSubmit, true);
        return () => form.removeEventListener('submit', handleSubmit, true);
      }
    }
  }, [isVoided, showAlert]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* 🔹 Header Row: 標題與狀態 Chip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: isVoided ? 2 : 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          💰 支出紀錄資訊
        </Typography>
        <Chip
          size="small"
          label={isVoided ? "已作廢" : "有效"}
          color={isVoided ? "error" : "success"}
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      {/* ⚠️ 作廢資訊顯示區 (參考進貨單深色排版) */}
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
            ⚠️ 此支出紀錄已作廢，無法編輯
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 3.5 }}>
            作廢時間：{record.voidedAt || "未紀錄"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 3.5 }}>
            作廢原因：{record.voidReason || "無"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", ml: 3.5, mt: 1 }}>
            如需更正，請建立新紀錄。
          </Typography>
        </Box>
      )}

      {/* 🔹 主要資料區 (響應式：手機單欄、電腦雙欄) */}
      <FormFieldRow sx={{ mb: 2 }}>
        <ReadonlyField label="支出日期" value={record.expenseDate} />
        <ReadonlyField label="費用類別" value={record.categoryName} />
      </FormFieldRow>
      <FormFieldRow sx={{ mb: 2 }}>
        <ReadonlyField
          label="支出金額"
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
        <ReadonlyField label="關聯員工" value={record.employeeName || "無"} />
      </FormFieldRow>

      {/* 備註 (佔滿整行) */}
        <Box sx={{ mt: 1 }}>
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
  );
};

/* -------------------------------------------------------
 * 📝 唯讀欄位 UI
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