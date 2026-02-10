import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  BooleanInput,
  SelectInput,
  useRedirect,
  required,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
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
 * ⭐ 新增費用分類頁面
 * ------------------------------------------------------- */
export const ExpenseCategoryCreate: React.FC = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="expense_categories"
      title="新增費用分類"
      onSuccess={(data) => {
        const category = data as ExpenseCategory;

        showAlert({
          message: `費用分類「${category.name}」新增成功！`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "expense_categories"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🗂 新增費用分類資訊
      </Typography>

      {/* 整體固定最大寬度 */}
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列：費用分類名稱 + 費用頻率類型 (響應式：手機單欄、電腦雙欄) */}
        <FormFieldRow sx={{ mb: 2 }}>
          <TextInput
            source="name"
            label="費用分類名稱 *"
            fullWidth
            validate={[required()]}
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
            defaultValue="DAILY"
            fullWidth
            helperText="設定此類別的費用新增頻率限制"
          />
        </FormFieldRow>

        {/* 第二列：說明 */}
        <Box mb={2}>
          <TextInput
            source="description"
            label="說明"
            multiline
            minRows={3}
            fullWidth
          />
        </Box>

        {/* 第三列：啟用狀態 + 是否為薪資類別 (響應式：手機單欄、電腦雙欄) */}
        <FormFieldRow sx={{ mb: 2 }}>
          <BooleanInput
            source="active"
            label="啟用"
            defaultValue={true}
          />
          <BooleanInput
            source="isSalary"
            label="是否為薪資類別"
            defaultValue={false}
            helperText="勾選後，此類別將用於員工薪資支出"
          />
        </FormFieldRow>
      </Box>
    </GenericCreatePage>
  );
};

