import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

export interface OrderItem {
  productId: number;
  qty: number;
}

interface Product {
  id: number;
  name: string;
}

interface OrderProductSelectorProps {
  products: Product[];
  value: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  disabled?: boolean;
  visibleRows?: number;
}

const ROW_HEIGHT = 43;
const DEFAULT_VISIBLE_ROWS = 4;

// chip 尺寸估算（MUI small）
const CHIP_ROW_HEIGHT = 36;
const CHIP_VISIBLE_ROWS = 2;

export const OrderProductSelector: React.FC<OrderProductSelectorProps> = ({
  products,
  value,
  onChange,
  disabled = false,
  visibleRows = DEFAULT_VISIBLE_ROWS,
}) => {
  const findItem = (productId: number) =>
    value.find((i) => i.productId === productId);

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      onChange(value.filter((i) => i.productId !== productId));
      return;
    }

    const exists = findItem(productId);
    if (exists) {
      onChange(
        value.map((i) =>
          i.productId === productId ? { ...i, qty } : i
        )
      );
    } else {
      onChange([...value, { productId, qty }]);
    }
  };

  const selectedItems = value
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, name: product.name } : null;
    })
    .filter(Boolean) as Array<{ productId: number; qty: number; name: string }>;

  return (
    <Box
      sx={(theme) => ({
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: `2px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      })}
    >
      {/* ================= 訂單項目 Header ================= */}
      <Box
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: theme.palette.background.paper,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          📄 訂單項目
        </Typography>
      </Box>

      {/* ================= 商品清單（scroll） ================= */}
      <Box
        sx={{
          px: 2,
          py: 1,
          overflowY: "auto",
          maxHeight: ROW_HEIGHT * visibleRows,
        }}
      >
        <Stack spacing={1}>
          {products.map((product) => {
            const item = findItem(product.id);
            const qty = item?.qty ?? 0;
            const selected = qty > 0;

            return (
              <Box
                key={product.id}
                sx={(theme) => ({
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  p: 1,
                  borderRadius: 1,
                  bgcolor: selected
                    ? theme.palette.action.selected
                    : "transparent",
                })}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: selected ? 600 : 400 }}
                >
                  {product.name}
                </Typography>

                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    disabled={disabled || qty <= 0}
                    onClick={() => updateQty(product.id, qty - 1)}
                  >
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>

                  <Typography sx={{ minWidth: 20, textAlign: "center" }}>
                    {qty}
                  </Typography>

                  <IconButton
                    size="small"
                    disabled={disabled}
                    onClick={() => updateQty(product.id, qty + 1)}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* ================= 已選商品 Header（固定） ================= */}
      <Box
        sx={(theme) => ({
          position: "sticky",
          bottom: CHIP_ROW_HEIGHT * CHIP_VISIBLE_ROWS + 16, // 保證不被 chips 擋住
          zIndex: 2,
          bgcolor: theme.palette.background.paper,
          px: 2,
          py: 0.75,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          已選商品
        </Typography>
      </Box>

      {/* ================= 已選商品 Chips（固定兩排，可捲） ================= */}
      <Box
        sx={{
          px: 3,
          py: 3,
          height: CHIP_ROW_HEIGHT * CHIP_VISIBLE_ROWS + 16, // 固定高度：兩排 chip 高度 + padding (8px * 2)
          overflowY: "auto",
          display: "flex",
          alignItems: selectedItems.length === 0 ? "center" : "flex-start",
        }}
      >
        {selectedItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            尚未選擇商品
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              width: "100%",
            }}
          >
            {selectedItems.map((item) => (
              <Chip
                key={item.productId}
                label={`${item.name} × ${item.qty}`}
                size="small"
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
