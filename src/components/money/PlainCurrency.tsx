export const PlainCurrency = ({
  value,
  showDecimal = false, // ⭐ 新增控制參數
}: {
  value: number | string;
  showDecimal?: boolean;
}) => {
  if (value === null || value === undefined) return <>-</>;

  const num = Number(value);

  if (Number.isNaN(num)) return <>-</>;

  return (
    <>
      {num.toLocaleString("zh-TW", {
        minimumFractionDigits: showDecimal ? 2 : 0,
        maximumFractionDigits: showDecimal ? 2 : 0,
      })}
    </>
  );
};