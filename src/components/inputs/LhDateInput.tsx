import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useInput } from "react-admin";
import type { UseInputValue } from "react-admin";
import dayjs from "dayjs";

interface LhDateInputProps {
  source: string;
  label?: string;
  fullWidth?: boolean;
  validate?: unknown;
}

export const LhDateInput = ({
  source,
  label,
  fullWidth = true,
  validate,
}: LhDateInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useInput({
    source,
    validate: validate as Parameters<typeof useInput>[0]["validate"],
  }) as UseInputValue;

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

        /**  永遠讓彈窗出現在 icon 的右方 */
        popper: {
          placement: "right-start",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [8, 0], // ➜ 向右偏移 8px，讓位置更漂亮
              },
            },
          ],
        },
      }}
    />
  );
};
