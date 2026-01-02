import React from "react";
import {
  TextInput,
  BooleanInput,
  SelectInput,
  useRecordContext,
  useRedirect,
  required,
} from "react-admin";
import { Typography, Box } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
/* -------------------------------------------------------
 * 🔐 ExpenseCategory 型別定義
 * ------------------------------------------------------- */
interface ExpenseCategory {
  id: number;
  name: string;
  accountCode?: string;
  description?: string;
  active?: boolean;
  isSalary?: boolean;
  frequencyType?: 'MONTHLY' | 'BIWEEKLY' | 'DAILY' | 'UNLIMITED';
}

/* -------------------------------------------------------
 * ⭐ 費用分類編輯頁面
 * ------------------------------------------------------- */
export const ExpenseCategoryEdit: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="expense_categories"
      title="編輯費用分類"
      width="700px"
      onSuccess={(data) => {
        const category = data as ExpenseCategory;

        showAlert({
          title: "更新成功",
          message: `已成功更新「${category.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "expense_categories"));
      }}
      onDeleteSuccess={(record) => {
        const category = record as ExpenseCategory;

        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${category.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "expense_categories"));
      }}
    >
      <ExpenseCategoryFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 費用分類欄位
 * ------------------------------------------------------- */
const ExpenseCategoryFormFields: React.FC = () => {
  const record = useRecordContext<ExpenseCategory>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🗂️ 基本資訊
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列：會計科目代碼 + 費用分類名稱（並排） */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
            alignItems: "start",
          }}
        >
          <TextInput
            source="accountCode"
            label="會計科目代碼"
            fullWidth
            disabled
            helperText="系統自動生成，無法修改"
          />

          <TextInput
            source="name"
            label="費用分類名稱 *"
            fullWidth
            validate={[required()]}
          />
        </Box>

        {/* 第二列：說明 + 費用頻率類型（並排） */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
            alignItems: "start",
            // 統一兩個輸入框的對齊方式
            "& .RaInput-input, & .MuiFormControl-root": {
              marginTop: 0,
              marginBottom: 0,
            },
            // 確保標籤在同一水平線
            "& .MuiInputLabel-root": {
              top: 0,
              transformOrigin: "top left",
            },
            // 統一輸入框高度
            "& .MuiInputBase-root": {
              marginTop: 0,
            },
          }}
        >
          <TextInput
            source="description"
            label="說明"
            multiline
            minRows={3}
            fullWidth
          />
          <SelectInput
            source="frequencyType"
            label="費用頻率類型"
            choices={[
              { id: 'MONTHLY', name: '每月一次' },
              { id: 'BIWEEKLY', name: '每兩週一次' },
              { id: 'DAILY', name: '每日一次' },
              { id: 'UNLIMITED', name: '無限制' },
            ]}
            fullWidth
            helperText="設定此類別的費用新增頻率限制"
          />
        </Box>

        {/* 第三列：啟用狀態 + 是否為薪資類別（並排） */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
            alignItems: "start",
          }}
        >
          <BooleanInput
            source="active"
            label="啟用"
          />
          <BooleanInput
            source="isSalary"
            label="是否為薪資類別"
            helperText="勾選後，此類別將用於員工薪資支出"
          />
        </Box>
      </Box>
    </>
  );
};

