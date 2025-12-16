import { Chip } from "@mui/material";
import { useRecordContext } from "react-admin";

interface ActiveStatusFieldProps {
  source?: string;     // 預設讀取 active 欄位
  label?: string;      // 讓 <ActiveStatusField label="狀態" /> 不會報錯
}

export const ActiveStatusField: React.FC<ActiveStatusFieldProps> = ({
  source = "active",
}) => {
  const record = useRecordContext();
  if (!record) return null;

  const isActive = Boolean(record[source]);

  return (
    <Chip
      size="small"
      label={isActive ? "啟用" : "終止"}
      color={isActive ? "success" : "default"}
      variant="outlined"
    />
  );
};
