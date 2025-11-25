import { NumberField } from "react-admin";

export const CurrencyStatusField = ({ source, label }: { source: string; label?: string }) => (
  <NumberField
    source={source}
    label={label}
    options={{
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }}
    sx={{
      color: (record: any) =>
        record[source] < 0 ? "error.main" : record[source] > 0 ? "success.main" : "text.primary",
      fontWeight: 600,
      textAlign: "right",
      display: "block",
    }}
  />
);
