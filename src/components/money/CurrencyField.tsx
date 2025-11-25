import { NumberField } from "react-admin";

/**
 * 💰 統一台幣格式顯示（無小數）
 */
export const CurrencyField = ({ source, label }: { source: string; label?: string }) => (
  <NumberField
    source={source}
    label={label}
    textAlign="right"
    options={{
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }}
    sx={{
      "& .RaNumberField-root": {
        justifyContent: "flex-end",
        display: "flex",
      },
    }}
  />
);
