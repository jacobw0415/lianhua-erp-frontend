import React from "react";
import {
  List,
  TextField,
  NumberField,
  DateField,
  FunctionField
} from "react-admin";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

export const APList = () => {
  return (
    <List
      title="應付帳齡明細"
      perPage={10}
      actions={false}
      pagination={<CustomPaginationBar showPerPage={true} />}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "supplierName", label: "供應商名稱" },
          { type: "text", source: "period", label: "會計期間 (YYYY-MM)" },
        ]}
        advancedFilters={[
          { type: "number", source: "minOverdue", label: "最小逾期天數" },
        ]}
        exportConfig={{
          filename: "應付帳齡明細",
          columns: [
            { header: "供應商", key: "supplierName" },
            { header: "採購單 ID", key: "purchaseId" },
            { header: "採購日期", key: "purchaseDate" },
            { header: "採購總金額", key: "totalAmount" },
            { header: "已付款金額", key: "paidAmount" },
            { header: "未付款餘額", key: "balance" },
            { header: "帳齡區間", key: "agingBucket" },
            { header: "逾期天數", key: "daysOverdue" }
          ],
        }}
      >
        <StyledListDatagrid>

          <TextField source="supplierName" label="供應商" />

          <FunctionField
            label="採購單"
            render={(record) =>
              record.purchaseId ? `#${record.purchaseId}` : "-"
            }
          />

          <DateField source="purchaseDate" label="採購日期" />

          <CurrencyField source="totalAmount" label="採購總額" />

          <CurrencyField source="paidAmount" label="已付款" />

          <CurrencyField source="balance" label="未付款" />

          <TextField source="agingBucket" label="帳齡區間" />

          <NumberField source="daysOverdue" label="逾期天數" />

        </StyledListDatagrid>
      </StyledListWrapper>
    </List>
  );
};