import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  Datagrid,
  TextField,
  FunctionField,
  useDataProvider,
  useNotify,
} from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";
import { getDrawerScrollableStyles } from "@/theme/LianhuaTheme";

/* =========================================================
 * 型別定義
 * ========================================================= */

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

interface PurchaseItemsResponse {
  data: PurchaseItemRow[] | { content: PurchaseItemRow[] };
}

interface PurchaseItemDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  purchaseId?: number;
  purchaseNo?: string;
  supplierName?: string;
}

/* =========================================================
 * Component
 * ========================================================= */

export const PurchaseItemDetailDrawer: React.FC<PurchaseItemDetailDrawerProps> = ({
  open,
  onClose,
  purchaseId,
  purchaseNo,
  supplierName,
}) => {
  const theme = useTheme();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [items, setItems] = useState<PurchaseItemRow[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  /* ================= 進貨項目明細 ================= */
  useEffect(() => {
    if (!open || !purchaseId) return;

    setItemsLoading(true);

    dataProvider
      .get(`purchases/${purchaseId}/items`, { meta: { includeVoided: true } })
      .then((res: PurchaseItemsResponse) => {
        const content = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setItems(content);
      })
      .catch(() => {
        setItems([]);
        notify("載入進貨項目明細失敗", { type: "error" });
      })
      .finally(() => setItemsLoading(false));
  }, [open, purchaseId, dataProvider, notify]);

  const totalQty = items.reduce((sum, d) => sum + (d.qty || 0), 0);
  const totalAmount = Math.round(
    items.reduce((sum, d) => sum + (d.subtotal || 0), 0)
  );

  // 計算是否需要滾動（超過3筆）
  const enableItemsScroll = items.length > 3;
  const itemsWithNotes = items.filter((item) => item.note && item.note.trim());
  const enableNotesScroll = itemsWithNotes.length > 3;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 560 } }}
    >
      <Box p={2}>
        {/* ================= Header ================= */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              📄 進貨項目明細
            </Typography>
            {purchaseNo && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                進貨單號：{purchaseNo}
              </Typography>
            )}
            {supplierName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                供應商：{supplierName}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 3 }}>
          {itemsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : items.length > 0 ? (
            <>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  📄 進貨項目明細
                </Typography>
                <Box
                  sx={getDrawerScrollableStyles(theme, 185, enableItemsScroll)}
                >
                  <Datagrid
                    data={items}
                    bulkActionButtons={false}
                    rowClick={false}
                    sx={{
                      "& th": {
                        textAlign: "left",
                        height: "32px",
                        minHeight: "32px",
                        maxHeight: "32px",
                        padding: "4px 8px",
                        lineHeight: "32px",
                      },
                      "& td": {
                        textAlign: "left",
                        height: "42px",
                        minHeight: "42px",
                        maxHeight: "42px",
                        padding: "0 8px",
                        lineHeight: "42px",
                      },
                      "& .RaDatagrid-row": {
                        height: "42px",
                        minHeight: "42px",
                        maxHeight: "42px",
                      },
                    }}
                  >
                    <TextField source="item" label="品項" />
                    <FunctionField
                      label="數量"
                      render={(record: PurchaseItemRow) => record.qty || 0}
                    />
                    <FunctionField
                      label="單位"
                      render={(record: PurchaseItemRow) => record.unit || "-"}
                    />
                    <CurrencyField source="unitPrice" label="單價" />
                    <CurrencyField source="subtotal" label="小計" />
                  </Datagrid>
                </Box>
              </Paper>

              {/* ================= 備註區域 ================= */}
              {itemsWithNotes.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                    📝 備註
                  </Typography>
                  <Box
                    sx={{
                      ...getDrawerScrollableStyles(theme, 120, enableNotesScroll),
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {itemsWithNotes.map((item, index) => (
                      <Box key={item.id || index}>
                        <Typography variant="body2" component="span" fontWeight={600}>
                          {item.item}：
                        </Typography>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {item.note}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* ================= 摘要 ================= */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.default",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    總數量
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {totalQty}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    明細合計
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    NT${totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                尚無進貨項目
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

