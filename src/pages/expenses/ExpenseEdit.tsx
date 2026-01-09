import React, { useEffect, useMemo } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  SelectInput,
  useRecordContext,
  useRedirect,
  required,
} from "react-admin";
import { Typography, Box, Alert } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useActiveExpenseCategories } from "@/hooks/useActiveExpenseCategories";
import { useActiveEmployees } from "@/hooks/useActiveEmployees";

/* -------------------------------------------------------
 * 🔐 Expense 型別定義
 * ------------------------------------------------------- */
interface Expense {
  id: number;
  expenseDate: string;
  categoryId?: number; // 改為可選
  amount?: number; // 改為可選
  note?: string;
  employeeId?: number | null;
  status?: 'ACTIVE' | 'VOIDED';
  voidedAt?: string; // yyyy-MM-dd HH:mm:ss
  voidReason?: string;
}

/* -------------------------------------------------------
 * ⭐ 支出紀錄編輯頁面
 * ------------------------------------------------------- */
export const ExpenseEdit: React.FC = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  // 隱藏刪除按鈕（支出紀錄不支持刪除，只支持作廢）
  useEffect(() => {
    const hideDeleteButton = () => {
      const deleteButton = document.querySelector('button[color="error"]');
      if (deleteButton && deleteButton.textContent?.includes('刪除')) {
        (deleteButton as HTMLElement).style.display = 'none';
      }
    };

    // 延遲執行以確保按鈕已渲染
    const timer = setTimeout(hideDeleteButton, 100);
    const observer = new MutationObserver(hideDeleteButton);

    const form = document.querySelector('form');
    if (form) {
      observer.observe(form, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <GenericEditPage
      resource="expenses"
      title="編輯支出紀錄"
      width="700px"
      onSuccess={() => {
        showAlert({
          title: "更新成功",
          message: `已成功更新支出紀錄`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "expenses"));
      }}
      onDeleteSuccess={() => {
        // 阻止刪除操作
        showAlert({
          title: "無法刪除",
          message: "支出紀錄不支持刪除操作，請使用作廢功能。",
          severity: "warning",
          hideCancel: true,
        });
      }}
    >
      <ExpenseFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 支出紀錄欄位
 * ------------------------------------------------------- */
const ExpenseFormFields: React.FC = () => {
  const record = useRecordContext<Expense>();
  const { categories, loading: categoriesLoading } = useActiveExpenseCategories();
  const { employees, loading: employeesLoading } = useActiveEmployees();
  const { showAlert } = useGlobalAlert();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  const isVoided = record.status === 'VOIDED';
  const hasEmployee = !!record.employeeId; // 檢查是否有員工（薪資支出）

  // 如果已作廢，阻止表單提交
  useEffect(() => {
    if (isVoided) {
      const form = document.querySelector('form');
      if (form) {
        const handleSubmit = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          showAlert({
            title: "無法編輯",
            message: "此支出紀錄已作廢，無法編輯。如需更正，請建立新紀錄。",
            severity: "warning",
            hideCancel: true,
          });
        };
        form.addEventListener('submit', handleSubmit);
        return () => {
          form.removeEventListener('submit', handleSubmit);
        };
      }
    }
  }, [isVoided, showAlert]);

  return (
    <>
      <ExpenseFormSync employees={employees} categories={categories} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        💰 支出紀錄資訊
      </Typography>

      {/* 已作廢提示 */}
      {isVoided && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            此支出紀錄已作廢，無法編輯
          </Typography>
          {record.voidedAt && (
            <Typography variant="caption" display="block" color="text.secondary">
              作廢時間：{record.voidedAt}
            </Typography>
          )}
          {record.voidReason && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              作廢原因：{record.voidReason}
            </Typography>
          )}
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            如需更正，請建立新紀錄。
          </Typography>
        </Alert>
      )}

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列：支出日期 + 費用類別（並排） */}
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
          <Box>
            <LhDateInput
              source="expenseDate"
              label="支出日期 *"
              fullWidth
              validate={[required()]}
              disabled
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              支出日期不可修改，若需異動請建立新紀錄
            </Typography>
          </Box>

          <CategoryInput
            categories={categories}
            isLoading={categoriesLoading}
            disabled={isVoided || hasEmployee}
          />
        </Box>

        {/* 第二列：金額 + 員工（並排） */}
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
          <AmountInput disabled={isVoided || hasEmployee} />

          <SelectInput
            source="employeeId"
            label="員工（選填）"
            choices={employees}
            optionText="name"
            optionValue="id"
            fullWidth
            isLoading={employeesLoading}
            disabled={isVoided || hasEmployee}
            helperText={
              hasEmployee
                ? "員工薪資支出不允許修改員工和金額"
                : "選擇員工時會自動選擇薪資類別並填入員工薪資"
            }
          />
        </Box>

        {/* 第三列：備註 */}
        <Box mb={2}>
          <TextInput
            source="note"
            label="備註"
            multiline
            minRows={3}
            fullWidth
            disabled={isVoided}
          />
        </Box>
      </Box>
    </>
  );
};

/* -------------------------------------------------------
 * ⭐ 費用類別輸入組件（根據是否選擇員工過濾選項）
 * ------------------------------------------------------- */
const CategoryInput: React.FC<{
  categories: Array<{ id: number; name: string; isSalary?: boolean }>;
  isLoading: boolean;
  disabled?: boolean;
}> = ({ categories, isLoading, disabled = false }) => {
  const { setValue } = useFormContext();
  const employeeId = useWatch({ name: "employeeId" });
  const categoryId = useWatch({ name: "categoryId" });

  // 過濾薪資類別（使用 isSalary 字段）
  const salaryCategories = useMemo(
    () => categories.filter((cat) => cat.isSalary === true),
    [categories]
  );

  const nonSalaryCategories = useMemo(
    () => categories.filter((cat) => cat.isSalary !== true),
    [categories]
  );

  // 根據是否選擇員工決定顯示的選項
  const availableCategories = employeeId ? salaryCategories : nonSalaryCategories;

  // 當選擇員工時，如果已選擇的類別不是薪資類別，清空它
  useEffect(() => {
    if (employeeId && categoryId) {
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      if (selectedCategory && selectedCategory.isSalary !== true) {
        // 如果已選擇的類別不是薪資類別，清空（讓後端自動選擇）
        setValue("categoryId", undefined, {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    }
  }, [employeeId, categoryId, categories, setValue]);

  return (
    <SelectInput
      source="categoryId"
      label={employeeId ? "費用類別（自動選擇）" : "費用類別 *"}
      choices={availableCategories}
      optionText="name"
      optionValue="id"
      fullWidth
      isLoading={isLoading}
      validate={[
        (value, allValues) => {
          // 如果沒有選擇員工，費用類別為必填
          // 如果選擇了員工，費用類別為可選（後端會自動選擇）
          if (!allValues?.employeeId && !value) {
            return "未選擇員工時，費用類別為必填";
          }
          return undefined;
        },
      ]}
      disabled={disabled || !!employeeId} // 已作廢或選擇員工時禁用
      emptyText={
        availableCategories.length === 0
          ? employeeId
            ? "選擇員工時會自動選擇薪資類別"
            : "無可用費用類別"
          : undefined
      }
      helperText={
        employeeId
          ? "選擇員工時會自動選擇薪資類別"
          : "請選擇費用類別（薪資類別需要選擇員工）"
      }
    />
  );
};

/* -------------------------------------------------------
 * ⭐ 金額輸入組件（根據是否選擇員工決定是否禁用）
 * ------------------------------------------------------- */
const AmountInput: React.FC<{ disabled?: boolean }> = ({ disabled: propDisabled = false }) => {
  const record = useRecordContext<Expense>();
  const employeeId = useWatch({ name: "employeeId" });
  // 檢查記錄中的初始 employeeId 或表單中的 employeeId
  const hasEmployee = !!record?.employeeId || !!employeeId;
  // 優先使用 propDisabled（來自父組件），如果沒有則檢查是否有員工
  const isDisabled = propDisabled || hasEmployee; // 已作廢或選擇了員工時禁用

  return (
    <TextInput
      source="amount"
      label={hasEmployee ? "金額（自動填入）" : "金額 *"}
      type="number"
      inputProps={{ min: 0, step: 0.01, readOnly: isDisabled }}
      fullWidth
      validate={[
        (value, allValues) => {
          // 如果沒有選擇員工，金額為必填
          if (!allValues?.employeeId) {
            if (!value || value === "" || Number(value) <= 0) {
              return "未選擇員工時，金額為必填且必須大於 0";
            }
          }
          return undefined;
        },
      ]}
      disabled={isDisabled}
      helperText={
        hasEmployee
          ? "員工薪資不允許修改"
          : "請輸入金額或選擇員工以自動帶入金額"
      }
    />
  );
};

/* -------------------------------------------------------
 * ⭐ 員工薪資和類別自動同步組件
 * ------------------------------------------------------- */
const ExpenseFormSync: React.FC<{
  employees: Array<{ id: number; name: string; salary?: number }>;
  categories: Array<{ id: number; name: string; isSalary?: boolean }>;
}> = ({ employees, categories }) => {
  const { setValue } = useFormContext();
  const employeeId = useWatch({ name: "employeeId" });
  const categoryId = useWatch({ name: "categoryId" });

  // 過濾薪資類別（使用 isSalary 字段）
  const salaryCategories = useMemo(
    () => categories.filter((cat) => cat.isSalary === true),
    [categories]
  );

  useEffect(() => {
    if (employeeId) {
      const selectedEmployee = employees.find((emp) => emp.id === employeeId);

      if (selectedEmployee) {
        // 自動設置金額為員工薪資
        if (selectedEmployee.salary !== undefined && selectedEmployee.salary > 0) {
          setValue("amount", selectedEmployee.salary, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }

        // 如果沒有選擇類別，自動選擇第一個薪資類別
        if (!categoryId && salaryCategories.length > 0) {
          setValue("categoryId", salaryCategories[0].id, {
            shouldValidate: false,
            shouldDirty: true,
          });
        } else if (categoryId) {
          // 如果已選擇類別，驗證是否為薪資類別
          const selectedCategory = categories.find((cat) => cat.id === categoryId);
          if (selectedCategory && selectedCategory.isSalary !== true) {
            // 如果不是薪資類別，自動切換到第一個薪資類別
            if (salaryCategories.length > 0) {
              setValue("categoryId", salaryCategories[0].id, {
                shouldValidate: false,
                shouldDirty: true,
              });
            }
          }
        }
      }
    } else {
      // 如果沒有選擇員工，清空金額和類別（如果類別是薪資類別）
      if (categoryId) {
        const selectedCategory = categories.find((cat) => cat.id === categoryId);
        if (selectedCategory && selectedCategory.isSalary === true) {
          // 如果當前選擇的是薪資類別，清空它
          setValue("categoryId", undefined, {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      }
      setValue("amount", undefined, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [employeeId, categoryId, employees, categories, salaryCategories, setValue]);

  return null;
};

