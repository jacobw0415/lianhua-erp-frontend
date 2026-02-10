import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  NumberInput,
  useRedirect,
  required,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { EmployeeStatusInput } from "./EmployeeStatusInput";
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
 * ⭐ 新增員工頁面
 * ------------------------------------------------------- */
export const EmployeeCreate: React.FC = () => {
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
      resource="employees"
      title="新增員工"
      onSuccess={(data) => {
        const employee = data as Employee;

        showAlert({
          message: `員工「${employee.fullName}」新增成功！`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "employees"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        👤 新增員工資訊
      </Typography>

      {/* 整體固定最大寬度 */}
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
        <FormFieldRow
          sx={{
            mb: 2,
            "& .MuiInputBase-root": { height: "56px" },
            "& .MuiTextField-root .MuiInputBase-root": { height: "56px" },
          }}
        >
          <TextInput source="position" label="職位" fullWidth />
          <NumberInput
            source="salary"
            label="薪資"
            fullWidth
            min={0}
            step={1000}
            format={(value) => {
              if (value === undefined || value === null) return "";
              return typeof value === "number" ? value.toLocaleString() : String(value);
            }}
            parse={(value) => {
              if (!value || value === "") return undefined;
              const num = parseFloat(String(value).replace(/,/g, ""));
              return isNaN(num) ? undefined : num;
            }}
          />
        </FormFieldRow>

        {/* 第三列：聘用日期 / 狀態 */}
        <FormFieldRow sx={{ mb: 2 }}>
          <LhDateInput
            source="hireDate"
            label="聘用日期"
            fullWidth
          />
          <Box>
            <EmployeeStatusInput source="status" label="狀態" />
          </Box>
        </FormFieldRow>
      </Box>
    </GenericCreatePage>
  );
};

