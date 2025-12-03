import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useInput } from "react-admin";
import type { UseInputValue } from "react-admin";
import dayjs from "dayjs";

interface LhDateInputProps {
  source: string;
  label?: string;
  fullWidth?: boolean;
}

export const LhDateInput = ({
  source,
  label,
  fullWidth = true,
}: LhDateInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useInput({ source }) as UseInputValue;   // ★ 不加 <string>

  return (
    <DatePicker
      label={label}
      value={field.value ? dayjs(field.value) : null}
      onChange={(newValue) => {
        const formatted = newValue ? newValue.format("YYYY-MM-DD") : "";
        field.onChange(formatted);
      }}
      slotProps={{
        textField: {
          fullWidth,
          error: !!error,
          helperText: error?.message,
        },
      }}
    />
  );
};
