import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  NumberInput,
  useRecordContext,
  useRedirect,
  required,
} from "react-admin";
import { Typography, Box } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { EmployeeStatusField } from "./EmployeeStatusField";
import { LhDateInput } from "@/components/inputs/LhDateInput";

/* -------------------------------------------------------
 * 🔐 Employee 型別定義
 * ------------------------------------------------------- */
interface Employee {
  id: number;
  fullName: string;
  position?: string;
  salary?: number;
  hireDate?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

/* -------------------------------------------------------
 * ⭐ 員工編輯頁面
 * ------------------------------------------------------- */
export const EmployeeEdit: React.FC = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="employees"
      title="編輯員工"
      width="700px"
      onSuccess={(data) => {
        const employee = data as Employee;

        showAlert({
          title: "更新成功",
          message: `已成功更新「${employee.fullName}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "employees"));
      }}
      onDeleteSuccess={(record) => {
        const employee = record as Employee;

        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${employee.fullName}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "employees"));
      }}
    >
      <EmployeeFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 員工欄位
 * ------------------------------------------------------- */
const EmployeeFormFields: React.FC = () => {
  const record = useRecordContext<Employee>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        👤 基本資訊
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列：姓名 */}
        <Box mb={2}>
          <TextInput
            source="fullName"
            label="員工姓名 *"
            fullWidth
            validate={[required()]}
          />
        </Box>

        {/* 第二列：職位 / 薪資 */}
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
              height: "56px", // 統一高度
            },
            // 確保 NumberInput 和 TextInput 高度一致
            "& .MuiTextField-root": {
              "& .MuiInputBase-root": {
                height: "56px",
              },
            },
          }}
        >
          <TextInput source="position" label="職位" fullWidth />
          <NumberInput
            source="salary"
            label="薪資"
            fullWidth
            min={0}
            step={1000}
          />
        </Box>

        {/* 第三列：聘用日期 / 狀態切換 */}
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
            source="hireDate"
            label="聘用日期"
            fullWidth
          />
          <Box>
            <EmployeeStatusField />
          </Box>
        </Box>
      </Box>
    </>
  );
};

