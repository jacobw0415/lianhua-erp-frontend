import { List, TextField, DateField, FunctionField, useRedirect } from "react-admin";
import { Typography } from "@mui/material";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

export const PaymentList = () => {
  const redirect = useRedirect();

  return (
    <List
      title="付款紀錄"
      actions={false}
      pagination={<CustomPaginationBar showPerPage={true} />}
      perPage={10}
    >
      <StyledListWrapper
        disableCreate={true}
        quickFilters={[
          { type: "text", source: "supplierName", label: "供應商名稱" },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "method",
            label: "付款方式",
            choices: [
              { id: "CASH", name: "現金" },
              { id: "TRANSFER", name: "匯款" },
              { id: "CARD", name: "刷卡" },
              { id: "CHECK", name: "支票" },
            ],
          },
          {
            type: "month",
            source: "accountingPeriod",
            label: "會計期間 (YYYY-MM)",
          },
          { type: "date", source: "fromDate", label: "付款日（起）" },
          { type: "date", source: "toDate", label: "付款日（迄）" },
        ]}
        exportConfig={{
          filename: "payment_export",
          format: "excel",
          columns: [
            { header: "付款日期", key: "payDate", width: 14 },
            { header: "供應商", key: "supplierName", width: 20 },
            { header: "金額", key: "amount", width: 12 },
            { header: "付款方式", key: "method", width: 10 },
            { header: "進貨單號", key: "purchaseId", width: 14 },
            { header: "會計期間", key: "accountingPeriod", width: 10 },
            { header: "備註", key: "note", width: 20 },
          ],
        }}
      >
        <StyledListDatagrid>
          <TextField source="supplierName" label="供應商" />
          <DateField source="payDate" label="付款日期" />
          <CurrencyField source="amount" label="金額" />
          <TextField source="method" label="付款方式" />

          {/* ✅ 與 APAgingDetailDrawer 完全一致的 UI */}
          <FunctionField
            label="進貨單號"
            render={(record: any) =>
              record?.purchaseId ? (
                <Typography
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 防止 rowClick
                    redirect(`/purchases/${record.purchaseId}`);
                  }}
                >
                  #{record.purchaseId}
                </Typography>
              ) : (
                "-"
              )
            }
          />

          <TextField source="accountingPeriod" label="會計期間" />
          <TextField source="note" label="備註" />
        </StyledListDatagrid>
      </StyledListWrapper>
    </List>
  );
};