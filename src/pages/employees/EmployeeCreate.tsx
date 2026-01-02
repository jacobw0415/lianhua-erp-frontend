import React from "react";
import {
  TextInput,
  NumberInput,
  useRedirect,
  required,
} from "react-admin";
import { Box, Typography } from "@mui/material";

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
        </Box>

        {/* 第三列：聘用日期 / 狀態 */}
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
            <EmployeeStatusInput source="status" label="狀態" />
          </Box>
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

