import { useState } from "react";
import {
  List,
  TextField,
  DateField,
  FunctionField,
} from "react-admin";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";
import { ExpenseStatusField } from "@/components/common/ExpenseStatusField";
import { ExpenseActionColumns } from "./ExpenseActionColumns";
import { ExpenseDetailDrawer, type ExpenseDetail } from "./ExpenseDetailDrawer";

/* =========================================================
 * 型別定義（對齊 ExpenseDto）
 * ========================================================= */

export interface ExpenseListRow {
  id: number;
  expenseDate: string; // YYYY-MM-DD
  categoryName: string;
  amount: number;
  note?: string;
  employeeName?: string;
  status?: 'ACTIVE' | 'VOIDED';
  voidedAt?: string; // yyyy-MM-dd HH:mm:ss
  voidReason?: string;
}

/* =========================================================
 * Component
 * ========================================================= */

export const ExpenseList = () => {
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDetail | null>(null);

  const openDetails = (record: ExpenseListRow) => {
    setSelectedExpense({
      id: record.id,
      expenseDate: record.expenseDate,
      categoryName: record.categoryName,
      amount: record.amount,
      note: record.note,
      employeeName: record.employeeName,
      status: record.status,
      voidedAt: record.voidedAt,
      voidReason: record.voidReason,
    });
    setOpenDetailDrawer(true);
  };

  return (
    <>
    <List
      title="支出紀錄"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage />}
      perPage={10}
      sort={{ field: "expenseDate", order: "DESC" }}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "categoryName", label: "費用類別名稱" },
          { type: "text", source: "employeeName", label: "員工名稱" },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "status",
            label: "狀態",
            choices: [
              { id: "ACTIVE", name: "有效" },
              { id: "VOIDED", name: "作廢" },
            ],
          },
          {
            type: "month",
            source: "accountingPeriod",
            label: "會計期間 (YYYY-MM)",
          },
          {
            type: "date",
            source: "fromDate",
            label: "支出日期（起）",
          },
          {
            type: "date",
            source: "toDate",
            label: "支出日期（迄）",
          },
          {
            type: "text",
            source: "note",
            label: "備註",
          },
        ]}
        exportConfig={{
          filename: "expense_export",
          format: "excel",
          columns: [
            { header: "支出日期", key: "expenseDate", width: 15 },
            { header: "費用類別", key: "categoryName", width: 25 },
            { header: "金額", key: "amount", width: 18 },
            { header: "狀態", key: "status", width: 12 },
            { header: "作廢原因", key: "voidReason", width: 30 },
            { header: "員工", key: "employeeName", width: 20 },
            { header: "備註", key: "note", width: 40 },
          ],
        }}
      >
        <StyledListDatagrid>
          <DateField source="expenseDate" label="支出日期" />
          <TextField source="categoryName" label="費用類別" />
          <CurrencyField source="amount" label="金額" />
          <FunctionField
            label="狀態"
            render={(record: ExpenseListRow) => {
              // 調試：在開發環境下輸出記錄數據
              if (import.meta.env.DEV && record) {
                console.log('[ExpenseList] 記錄數據:', {
                  id: record.id,
                  status: record.status,
                  statusType: typeof record.status,
                  allKeys: Object.keys(record),
                });
              }
              return (
                <ExpenseStatusField
                  source="status"
                  record={record}
                />
              );
            }}
          />
          <TextField source="employeeName" label="員工" />
          <FunctionField
            label="明細"
            render={(record: ExpenseListRow) => (
              <IconButton
                size="small"
                onClick={() => openDetails(record)}
                title="查看完整明細"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            )}
          />
          <FunctionField
            label="操作"
            source="action"
            className="column-action"
            render={() => <ExpenseActionColumns />}
          />
        </StyledListDatagrid>
      </StyledListWrapper>
    </List>

    <ExpenseDetailDrawer
      open={openDetailDrawer}
      onClose={() => setOpenDetailDrawer(false)}
      expense={selectedExpense ?? undefined}
    />
    </>
  );
};

