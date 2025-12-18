import {
  List,
  TextField,
  NumberField,
  DateField,
  FunctionField,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";
import { CurrencyField } from "@/components/money/CurrencyField";

/**
 * 銷售紀錄列表
 */
export const SaleList = () => (
  <List
    title="銷售紀錄"
    actions={false}
    empty={false}
    pagination={<CustomPaginationBar showPerPage={true} />}
    perPage={10}
  >
    <StyledListWrapper
      quickFilters={[
        { type: "text", source: "productName", label: "商品名稱" },
      ]}
      advancedFilters={[
        {
          type: "select",
          source: "payMethod",
          label: "付款方式",
          choices: [
            { id: "CASH", name: "現金" },
            { id: "TRANSFER", name: "轉帳" },
            { id: "CARD", name: "刷卡" },
          ],
        },
        {
          type: "date",
          source: "saleDate",
          label: "銷售日期",
        },
      ]}
      exportConfig={{
        filename: "sale_export",
        format: "excel",
        columns: [
          { header: "商品名稱", key: "productName", width: 20 },
          { header: "數量", key: "qty", width: 10 },
          { header: "付款方式", key: "payMethod", width: 12 },
          { header: "總金額", key: "amount", width: 15 },
          { header: "銷售日期", key: "saleDate", width: 15 },
        ],
      }}
    >
      <StyledListDatagrid>
        <TextField source="productName" label="商品" />
        <NumberField source="qty" label="數量" />
        <TextField source="payMethod" label="付款方式" />
        <CurrencyField source="amount" label="總金額" />
        <DateField source="saleDate" label="銷售日期" />

        {/* 操作欄（查看 / 編輯 / 刪除） */}
        <FunctionField
          label="操作"
          source="action"
          className="column-action"
          render={() => <ActionColumns />}
        />
      </StyledListDatagrid>
    </StyledListWrapper>
  </List>
);
