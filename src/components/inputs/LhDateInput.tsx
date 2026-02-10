import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useInput } from "react-admin";
import type { UseInputValue } from "react-admin";
import dayjs from "dayjs";

import { useIsSmallScreen } from "@/hooks/useIsMobile";

interface LhDateInputProps {
  source: string;
  label?: string;
  fullWidth?: boolean;
  validate?: unknown;
  disabled?: boolean;
  size?: "small" | "medium";
}

export const LhDateInput = ({
  source,
  label,
  fullWidth = true,
  validate,
  disabled = false,
  size = "medium",
}: LhDateInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useInput({
    source,
    validate: validate as Parameters<typeof useInput>[0]["validate"],
  }) as UseInputValue;

  const isSmallScreen = useIsSmallScreen();

  return (
    <DatePicker
      label={label}
      value={field.value ? dayjs(field.value) : null}
      onChange={(newValue) => {
        const formatted = newValue ? newValue.format("YYYY-MM-DD") : "";
        field.onChange(formatted);
      }}
      disabled={disabled}
      slotProps={{
        textField: {
          fullWidth,
          error: !!error,
          helperText: error?.message,
          disabled,
          size,
        },

        /** RWD：小螢幕時彈窗在欄位正下方，避免超出畫面；桌面版在右方 */
        popper: {
          placement: isSmallScreen ? "bottom-start" : "right-start",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: isSmallScreen ? [0, 8] : [8, 0],
              },
            },
          ],
        },
      }}
    />
  );
};
