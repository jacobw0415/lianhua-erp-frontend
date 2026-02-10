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

import { APAgingDetailDrawer } from "./APAgingDetailDrawer";

/* =========================================================
 * 型別定義
 * ========================================================= */

/** Drawer 只需要的供應商基本資料 */
interface SupplierLite {
  supplierId: number;
  supplierName: string;
}

/** AP Aging Summary（List 每一列） */
interface APAgingSummaryRow {
  supplierId: number;
  supplierName: string;

  aging0to30: number;
  aging31to60: number;
  aging60plus: number;

  paidAmount: number;
  balance: number;
  totalAmount: number;
}

/* =========================================================
 * Component
 * ========================================================= */

export const APList = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const [openDrawer, setOpenDrawer] = useState(false);

  /** ⭐ 只存 Drawer 真正需要的型別 */
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierLite | undefined>(undefined);

  const handleOpen = (record: APAgingSummaryRow) => {
    setSelectedSupplier({
      supplierId: record.supplierId,
      supplierName: record.supplierName,
    });
    setOpenDrawer(true);
  };

  return (
    <>
      <List
        resource="ap"
        title="應付帳款總表"
        actions={false}
        empty={false}
        perPage={10}
        sort={{ field: "supplierName", order: "ASC" }}
        pagination={<CustomPaginationBar showPerPage />}
      >
        <StyledListWrapper
          /** AP Aging 為報表頁，不允許新增 */
          disableCreate

          /** ===============================
           *  Quick Filters
           * =============================== */
          quickFilters={[
            {
              type: "text",
              source: "supplierName",
              label: "供應商名稱",
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
              label: "僅顯示未付款",
            },
          ]}

          /** ===============================
           *  匯出設定
           * =============================== */
          exportConfig={{
            filename: "應付帳款總表",
            columns: [
              { header: "供應商", key: "supplierName" },
              { header: "0–30 天", key: "aging0to30" },
              { header: "31–60 天", key: "aging31to60" },
              { header: "60 天以上", key: "aging60plus" },
              { header: "已付款", key: "paidAmount" },
              { header: "未付款", key: "balance" },
              { header: "應付總額", key: "totalAmount" },
            ],
          }}
        >
          <ResponsiveListDatagrid rowClick={false} tabletLayout="card">
            <TextField source="supplierName" label="供應商" />

            <CurrencyField source="aging0to30" label="0–30 天" />
            <CurrencyField source="aging31to60" label="31–60 天" />
            <CurrencyField source="aging60plus" label="60 天以上" />

            <CurrencyField source="paidAmount" label="已付款" />
            <CurrencyField source="balance" label="未付款" />
            <CurrencyField source="totalAmount" label="應付總額" />

            <FunctionField
              label="明細"
              render={(record: APAgingSummaryRow) => (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(record);
                  }}
                  title="查看未付進貨明細"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />
          </ResponsiveListDatagrid>
        </StyledListWrapper>
      </List>

      <APAgingDetailDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        supplier={selectedSupplier}
      />
    </>
  );
};