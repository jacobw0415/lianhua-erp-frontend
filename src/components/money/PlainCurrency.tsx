export const PlainCurrency = ({ value }: { value: number | string }) => {
  if (value === null || value === undefined) return <>-</>;

  const num = Number(value);

  return (
    <>
      {num.toLocaleString("zh-TW", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </>
  );
};
