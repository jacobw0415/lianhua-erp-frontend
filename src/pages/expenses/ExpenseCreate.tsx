import React, { useEffect, useMemo } from "react";
import {
  TextInput,
  SelectInput,
  required,
} from "react-admin";
import { Box, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
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
  categoryName?: string; // 後端返回的類別名稱
  amount?: number; // 改為可選
  note?: string;
  employeeId?: number | null;
  employeeName?: string; // 後端返回的員工名稱
}

interface ExpenseCategory {
  id: number;
  name: string;
  isSalary?: boolean; // ✅ 添加 isSalary 欄位
  active?: boolean;
  frequencyType?: 'MONTHLY' | 'BIWEEKLY' | 'DAILY' | 'UNLIMITED';
}

/* -------------------------------------------------------
 * ⭐ 新增支出紀錄頁面
 * ------------------------------------------------------- */
export const ExpenseCreate: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const { categories, loading: categoriesLoading } = useActiveExpenseCategories();
  const { employees, loading: employeesLoading } = useActiveEmployees();

  return (
    <GenericCreatePage
      resource="expenses"
      title="新增支出紀錄"
      onSuccess={(data) => {
        const expense = data as Expense;

        // 構建成功訊息
        const parts: string[] = [];

        if (expense.categoryName) {
          parts.push(`費用類別「${expense.categoryName}」`);
        }

        if (expense.amount !== undefined && expense.amount !== null) {
          parts.push(`金額 NT$ ${expense.amount.toLocaleString()}`);
        }

        if (expense.employeeName) {
          parts.push(`員工「${expense.employeeName}」`);
        }

        // 構建最終訊息
        let message = "支出紀錄已成功建立";
        if (parts.length > 0) {
          message += `：${parts.join("、")}`;
        }

        showAlert({
          title: "新增成功",
          message: message,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => {
          window.location.href = "#/expenses";
        }, 500);
      }}
    >
      <ExpenseFormSync employees={employees} categories={categories} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        💰 新增支出紀錄資訊
      </Typography>

      {/* 整體固定最大寬度 */}
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
          <LhDateInput
            source="expenseDate"
            label="支出日期 *"
            fullWidth
            validate={[required()]}
          />

          <CategoryInput categories={categories} isLoading={categoriesLoading} />
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
          <AmountInput />

          <SelectInput
            source="employeeId"
            label="員工（選填）"
            choices={employees}
            optionText="name"
            optionValue="id"
            fullWidth
            isLoading={employeesLoading}
            helperText="選擇員工時會自動選擇薪資類別並填入員工薪資"
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
          />
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

/* -------------------------------------------------------
 * ⭐ 費用類別輸入組件（根據是否選擇員工過濾選項）
 * ------------------------------------------------------- */
const CategoryInput: React.FC<{
  categories: ExpenseCategory[];
  isLoading: boolean;
}> = ({ categories, isLoading }) => {
  const employeeId = useWatch({ name: "employeeId" });

  // ✅ 使用 isSalary 欄位過濾薪資類別（而不是名稱）
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
          if (!allValues?.employeeId && !value) {
            return "未選擇員工時，費用類別為必填";
          }
          return undefined;
        },
      ]}
      disabled={!!employeeId} // 選擇員工時禁用，讓後端自動選擇
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
const AmountInput: React.FC = () => {
  const employeeId = useWatch({ name: "employeeId" });
  const isDisabled = !!employeeId; // 如果選擇了員工，則禁用金額欄位

  return (
    <TextInput
      source="amount"
      label={employeeId ? "金額（自動填入）" : "金額 *"}
      type="number"
      inputProps={{ min: 0, step: 0.01 }}
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
        employeeId
          ? "選擇員工時會自動填入員工薪資"
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
  categories: ExpenseCategory[];
}> = ({ employees, categories }) => {
  const { setValue } = useFormContext();
  const employeeId = useWatch({ name: "employeeId" });
  const categoryId = useWatch({ name: "categoryId" });

  // ✅ 使用 isSalary 欄位過濾薪資類別（而不是名稱）
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

