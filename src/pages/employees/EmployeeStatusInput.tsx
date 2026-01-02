import { Switch, Box, Typography } from "@mui/material";
import { useInput } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface EmployeeStatusInputProps {
  source: string;
  label?: string;
}

/* =========================================================
 * Component - 用於表單的狀態輸入（新增頁面）
 * ========================================================= */

export const EmployeeStatusInput: React.FC<EmployeeStatusInputProps> = ({
  source,
  label = "是否啟用",
}) => {
  const {
    field,
    fieldState: { error },
  } = useInput({ source, defaultValue: "ACTIVE" });

  const isActive = field.value === "ACTIVE" || field.value === undefined || field.value === "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(event.target.checked ? "ACTIVE" : "INACTIVE");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mt: 1,
        mb: 1,
        px: 0.5,
      }}
    >
      <Typography sx={{ fontSize: "0.95rem", color: "text.primary" }}>
        {label}
      </Typography>

      <Switch
        checked={isActive}
        onChange={handleChange}
        color="success"
        name={field.name}
        onBlur={field.onBlur}
      />
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {error.message}
        </Typography>
      )}
    </Box>
  );
};

