import { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  List,
  TextField,
  FunctionField,
} from "react-admin";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";

import { ARAgingDetailDrawer } from "./ARAgingDetailDrawer";

/* =========================================================
 * 型別定義
 * ========================================================= */

/** Drawer 只需要的客戶基本資料 */
interface CustomerLite {
  customerId: number;
  customerName: string;
}

/** AR Aging Summary（List 每一列） */
interface ARAgingSummaryRow {
  customerId: number;
  customerName: string;

  aging0to30: number;
  aging31to60: number;
  aging60plus: number;

  receivedAmount: number;
  balance: number;
  totalAmount: number;
}

/* =========================================================
 * Component
 * ========================================================= */

export const ARList = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const [openDrawer, setOpenDrawer] = useState(false);

  /** ⭐ 只存 Drawer 真正需要的型別 */
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerLite | undefined>(undefined);

  const handleOpen = (record: ARAgingSummaryRow) => {
    setSelectedCustomer({
      customerId: record.customerId,
      customerName: record.customerName,
    });
    setOpenDrawer(true);
  };

  return (
    <>
      <List
        resource="ar"
        title="應收帳款總表"
        actions={false}
        empty={false}
        perPage={10}
        sort={{ field: "customerName", order: "ASC" }}
        pagination={<CustomPaginationBar showPerPage />}
      >
        <StyledListWrapper
          /** AR Aging 為報表頁，不允許新增 */
          disableCreate

          /** ===============================
           *  Quick Filters
           * =============================== */
          quickFilters={[
            {
              type: "text",
              source: "customerName",
              label: "客戶名稱",
            },
          ]}

          /** ===============================
           *  Advanced Filters
           * =============================== */
          advancedFilters={[
            {
              type: "select",
              source: "agingBucket",
              label: "帳齡區間",
              choices: [
                { id: "ALL", name: "全部" },
                { id: "DAYS_0_30", name: "0–30 天" },
                { id: "DAYS_31_60", name: "31–60 天" },
                { id: "DAYS_60_PLUS", name: "60 天以上" },
              ],
            },
            {
              type: "boolean",
              source: "onlyUnpaid",
              label: "僅顯示未收款",
            },
          ]}

          /** ===============================
           *  匯出設定
           * =============================== */
          exportConfig={{
            filename: "應收帳款總表",
            columns: [
              { header: "客戶", key: "customerName" },
              { header: "0–30 天", key: "aging0to30" },
              { header: "31–60 天", key: "aging31to60" },
              { header: "60 天以上", key: "aging60plus" },
              { header: "已收款", key: "receivedAmount" },
              { header: "未收款", key: "balance" },
              { header: "應收總額", key: "totalAmount" },
            ],
          }}
        >
          <ResponsiveListDatagrid rowClick={false}>
            <TextField source="customerName" label="客戶" />

            <CurrencyField source="aging0to30" label="0–30 天" />
            <CurrencyField source="aging31to60" label="31–60 天" />
            <CurrencyField source="aging60plus" label="60 天以上" />

            <CurrencyField source="receivedAmount" label="已收款" />
            <CurrencyField source="balance" label="未收款" />
            <CurrencyField source="totalAmount" label="應收總額" />

            <FunctionField
              label="明細"
              render={(record: ARAgingSummaryRow) => (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(record);
                  }}
                  title="查看未收訂單明細"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />
          </ResponsiveListDatagrid>
        </StyledListWrapper>
      </List>

      <ARAgingDetailDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        customer={selectedCustomer}
      />
    </>
  );
};

