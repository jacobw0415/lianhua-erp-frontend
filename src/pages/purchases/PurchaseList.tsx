import { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { useState } from "react";
import {
  List,
  TextField,
  DateField,
  FunctionField,
  useRefresh,
} from "react-admin";
import { useTranslation } from "react-i18next";

import { IconButton, Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ListIcon from "@mui/icons-material/List";

import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";
import { ActionColumns } from "@/components/common/ActionColumns";

import { PurchaseDetailDrawer } from "./PurchaseDetailDrawer";
import { PurchaseItemDetailDrawer } from "./PurchaseItemDetailDrawer";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface PaymentRow {
  amount: number;
  payDate: string;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
}

interface PurchaseItemRow {
  id: number;
  purchaseId: number;
  item: string;
  unit: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  note?: string;
}

interface PurchaseListRow {
  id: number;
  purchaseNo: string;
  supplierName: string;
  purchaseDate: string;

  totalAmount: number;
  paidAmount: number;
  balance: number;

  status: "PENDING" | "PARTIAL" | "PAID";
  note?: string;

  payments?: PaymentRow[];
}

/* =========================================================
 * Drawer 資料來源
 * ========================================================= */

type SelectedPurchase = {
  id: number;
  purchaseNo: string;
  supplierName: string;
  purchaseDate: string;
  status: "PENDING" | "PARTIAL" | "PAID";

  totalAmount: number;
  paidAmount: number;
  balance: number;

  recordStatus?: "ACTIVE" | "VOIDED";
  voidedAt?: string;
  voidReason?: string;

  items: PurchaseItemRow[];
  payments: PaymentRow[];
};

/* =========================================================
 * Component
 * ========================================================= */

export const PurchaseList = () => {
  const theme = useTheme();
  const { t } = useTranslation("common");
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [openItemDrawer, setOpenItemDrawer] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<SelectedPurchase | null>(null);
  const refresh = useRefresh();

  const openDetails = (record: PurchaseListRow) => {
    setSelectedPurchase({
      id: record.id,
      purchaseNo: record.purchaseNo,
      supplierName: record.supplierName,
      purchaseDate: record.purchaseDate,
      status: record.status,
      totalAmount: record.totalAmount,
      paidAmount: record.paidAmount,
      balance: record.balance,
      recordStatus: (record as any).recordStatus,
      voidedAt: (record as any).voidedAt,
      voidReason: (record as any).voidReason,
      items: [],                    // 明細由 Drawer 內補
      payments: record.payments ?? [],
    });

    setOpenDetailDrawer(true);
  };

  const openItemDetails = (record: PurchaseListRow) => {
    setSelectedPurchase({
      id: record.id,
      purchaseNo: record.purchaseNo,
      supplierName: record.supplierName,
      purchaseDate: record.purchaseDate,
      status: record.status,
      totalAmount: record.totalAmount,
      paidAmount: record.paidAmount,
      balance: record.balance,
      recordStatus: (record as any).recordStatus,
      voidedAt: (record as any).voidedAt,
      voidReason: (record as any).voidReason,
      items: [],
      payments: record.payments ?? [],
    });
    setOpenItemDrawer(true);
  };

  const handleRefresh = () => {
    refresh();
    // 如果抽屜打開，重新載入選中的進貨單資料
    if (selectedPurchase?.id) {
      // 這裡可以選擇重新打開抽屜或關閉它
      // 為了簡單起見，我們關閉抽屜並刷新列表
      setOpenDetailDrawer(false);
      setOpenItemDrawer(false);
    }
  };

  return (
    <>
      <List
        title="進貨紀錄"
        actions={false}
        empty={false}
        perPage={10}
        pagination={<CustomPaginationBar showPerPage />}
      >
        <StyledListWrapper
          quickFilters={[
            { type: "text", source: "purchaseNo", label: t("filters.purchaseNo") },
            { type: "text", source: "supplierName", label: t("filters.supplierName") },
            { type: "text", source: "item", label: t("filters.itemName") },
          ]}
          advancedFilters={[
            {
              type: "select",
              source: "status",
              label: t("filters.orderStatus"),
              choices: [
                { id: "PENDING", name: t("filters.unpaid") },
                { id: "PARTIAL", name: t("filters.partialPaid") },
                { id: "PAID", name: t("filters.paidAmount") },
              ],
            },
            {
              type: "month",
              source: "accountingPeriod",
              label: t("filters.accountingPeriod"),
            },
            { type: "text", source: "supplierId", label: "供應商ID（精準）" },
            { type: "date", source: "fromDate", label: "進貨日（起）" },
            { type: "date", source: "toDate", label: "進貨日（迄）" },
          ]}
          exportConfig={{
            filename: "purchase_export",
            format: "excel",
            exportPickerTitle: "匯出進貨紀錄",
            exportColumnPicker: false,
            backendExport: {
              resource: "purchases",
              defaultFormat: "xlsx",
              defaultScope: "all",
            },
            backendExportDateFilter: {
              label: "進貨日期（匯出條件）",
              mode: "range",
              // 對應你規格的 fromDate / toDate (YYYY-MM-DD)
              listRangeFilterKeys: {
                from: "fromDate",
                to: "toDate",
              },
            },
            // 由匯出策略統一控制：此 resource 不送 columns query。
            columns: [],
          }}
        >
          <ResponsiveListDatagrid rowClick={false} tabletLayout="card">
            <TextField source="purchaseNo" label={t("filters.purchaseNo")} />
            <TextField source="supplierName" label={t("filters.supplierName")} />
            <DateField source="purchaseDate" label={t("filters.purchaseDate")} />
            <CurrencyField source="totalAmount" label={t("filters.totalAmount")} />
            <CurrencyField source="paidAmount" label={t("filters.paidAmount")} />
            <CurrencyField source="balance" label={t("filters.balance")} />
            <FunctionField
              label={t("filters.orderStatus")}
              render={(record: PurchaseListRow) => {
                const statusMap: Record<string, string> = {
                  PENDING: t("filters.unpaid"),
                  PARTIAL: t("filters.partialPaid"),
                  PAID: t("filters.paidAmount"),
                };
                return statusMap[record.status] || record.status;
              }}
            />

            {/* 📦 明細 */}
            <FunctionField
              label={t("filters.details")}
              render={(record: PurchaseListRow) => (
                <Box display="flex" gap={0.5} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetails(record);
                    }}
                    title={t("filters.viewFullDetails")}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openItemDetails(record);
                    }}
                    title={t("filters.viewPurchaseItemDetails")}
                  >
                    <ListIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            />

            {/* 🛠 操作 */}
            <FunctionField
              label={t("filters.actions")}
              source="action"
              className="column-action"
              render={() => <ActionColumns />}
            />
          </ResponsiveListDatagrid>
        </StyledListWrapper>
      </List>

      <PurchaseDetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        purchase={selectedPurchase ?? undefined}
        onRefresh={handleRefresh}
      />

      <PurchaseItemDetailDrawer
        open={openItemDrawer}
        onClose={() => setOpenItemDrawer(false)}
        purchaseId={selectedPurchase?.id}
        purchaseNo={selectedPurchase?.purchaseNo}
        supplierName={selectedPurchase?.supplierName}
      />
    </>
  );
};
