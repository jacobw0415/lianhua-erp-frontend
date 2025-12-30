import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  Chip,
  TextField,
  Button,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";

export interface PurchaseItem {
  item: string;
  qty: number;
  unitPrice: number;
  unit: string;
  note?: string;
}

interface PurchaseItemSelectorProps {
  value: PurchaseItem[];
  onChange: (items: PurchaseItem[]) => void;
  disabled?: boolean;
  visibleRows?: number;
}

const ROW_HEIGHT = 43;
const DEFAULT_VISIBLE_ROWS = 4;

// chip 尺寸估算（MUI small）
const CHIP_ROW_HEIGHT = 36;
const CHIP_VISIBLE_ROWS = 0.5;

const UNIT_CHOICES = [
  "斤",
  "公斤",
  "箱",
  "盒",
  "包",
  "瓶",
  "顆",
  "本",
];

export const PurchaseItemSelector: React.FC<PurchaseItemSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  visibleRows = DEFAULT_VISIBLE_ROWS,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<PurchaseItem>({
    item: "",
    qty: 0,
    unitPrice: 0,
    unit: "斤",
    note: "",
  });

  const addItem = () => {
    if (newItem.item.trim()) {
      onChange([...value, { ...newItem }]);
      setNewItem({
        item: "",
        qty: 0,
        unitPrice: 0,
        unit: "斤",
        note: "",
      });
    }
  };

  const updateItem = (index: number, updates: Partial<PurchaseItem>) => {
    onChange(
      value.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
  };

  const finishEdit = () => {
    setEditingIndex(null);
  };

  const totalAmount = value.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

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
      {/* ================= 進貨項目 Header ================= */}
      <Box
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: theme.palette.background.paper,
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          📦 進貨項目
        </Typography>
      </Box>

      {/* ================= 新增項目區 ================= */}
      <Box sx={{ px: 2, py: 0.75, borderBottom: `1px solid`, borderColor: "divider" }}>
        <Stack spacing={0.75}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <TextField
              label="項目名稱"
              size="small"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              disabled={disabled}
              placeholder="輸入項目名稱"
            />
            <TextField
              label="備註"
              size="small"
              value={newItem.note}
              onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
              disabled={disabled}
              placeholder="選填"
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
            <TextField
              label="數量"
              type="number"
              size="small"
              value={newItem.qty === 0 ? "" : newItem.qty}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                setNewItem({ ...newItem, qty: Math.max(0, val || 0) });
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const current = newItem.qty || 0;
                  const newVal = e.key === "ArrowUp" ? current + 1 : Math.max(0, current - 1);
                  setNewItem({ ...newItem, qty: newVal });
                }
              }}
              inputProps={{
                min: 0,
                step: 1,
              }}
              disabled={disabled}
            />
            <TextField
              label="單價"
              type="number"
              size="small"
              value={newItem.unitPrice === 0 ? "" : newItem.unitPrice}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                setNewItem({
                  ...newItem,
                  unitPrice: Math.max(0, val || 0),
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const current = newItem.unitPrice || 0;
                  const newVal = e.key === "ArrowUp" ? current + 1 : Math.max(0, current - 1);
                  setNewItem({ ...newItem, unitPrice: newVal });
                }
              }}
              inputProps={{
                min: 0,
                step: 1,
              }}
              disabled={disabled}
            />
            <TextField
              label="單位"
              select
              size="small"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              disabled={disabled}
              SelectProps={{
                native: true,
              }}
            >
              {UNIT_CHOICES.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </TextField>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addItem}
            disabled={disabled || !newItem.item.trim()}
            fullWidth
            size="small"
          >
            新增項目
          </Button>
        </Stack>
      </Box>

      {/* ================= 項目清單（scroll） ================= */}
      <Box
        sx={{
          px: 1,
          py: 1,
          overflowY: "auto",
          flex: "1 1 auto",
          minHeight: ROW_HEIGHT * visibleRows,
          maxHeight: ROW_HEIGHT * visibleRows,
        }}
      >
        <Stack spacing={0.75}>
          {value.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              尚未新增項目
            </Typography>
          ) : (
            value.map((item, index) => (
              <Box
                key={index}
                sx={(theme) => ({
                  p: 0.2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.default,
                })}
              >
                {editingIndex === index ? (
                  <Stack spacing={0.5}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                      }}
                    >
                      <TextField
                        label="項目名稱"
                        size="small"
                        value={item.item}
                        onChange={(e) =>
                          updateItem(index, { item: e.target.value })
                        }
                        disabled={disabled}
                      />
                      <TextField
                        label="備註"
                        size="small"
                        value={item.note || ""}
                        onChange={(e) =>
                          updateItem(index, { note: e.target.value })
                        }
                        disabled={disabled}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 1,
                      }}
                    >
                      <TextField
                        label="數量"
                        type="number"
                        size="small"
                        value={item.qty === 0 ? "" : item.qty}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          updateItem(index, { qty: Math.max(0, val || 0) });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                            const current = item.qty || 0;
                            const newVal = e.key === "ArrowUp" ? current + 1 : Math.max(0, current - 1);
                            updateItem(index, { qty: newVal });
                          }
                        }}
                        inputProps={{
                          min: 0,
                          step: 1,
                        }}
                        disabled={disabled}
                      />
                      <TextField
                        label="單價"
                        type="number"
                        size="small"
                        value={item.unitPrice === 0 ? "" : item.unitPrice}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          updateItem(index, {
                            unitPrice: Math.max(0, val || 0),
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                            const current = item.unitPrice || 0;
                            const newVal = e.key === "ArrowUp" ? current + 1 : Math.max(0, current - 1);
                            updateItem(index, { unitPrice: newVal });
                          }
                        }}
                        inputProps={{
                          min: 0,
                          step: 1,
                        }}
                        disabled={disabled}
                      />
                      <TextField
                        label="單位"
                        select
                        size="small"
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(index, { unit: e.target.value })
                        }
                        disabled={disabled}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        {UNIT_CHOICES.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={finishEdit}
                        fullWidth
                      >
                        完成
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeItem(index)}
                        disabled={disabled}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Stack>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
                          {item.item}
                        </Typography>
                        {item.note && (
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            備註：{item.note}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          數量：{item.qty} {item.unit} × 單價：{item.unitPrice.toLocaleString("zh-TW")} = {(item.qty * item.unitPrice).toLocaleString("zh-TW")}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          onClick={() => startEdit(index)}
                          disabled={disabled}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={disabled}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            ))
          )}
        </Stack>
      </Box>

      <Divider />

      {/* ================= 已選項目 Header（固定） ================= */}
      <Box
        sx={(theme) => ({
          position: "sticky",
          bottom: CHIP_ROW_HEIGHT * CHIP_VISIBLE_ROWS + 32, // 保證不被 chips 擋住
          zIndex: 2,
          bgcolor: theme.palette.background.paper,
          px: 2,
          py: 0.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            已選項目
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            總金額：{totalAmount.toLocaleString("zh-TW")}
          </Typography>
        </Box>
      </Box>

      {/* ================= 已選項目 Chips（固定一排，可捲） ================= */}
      <Box
        sx={{
          px: 2,
          py: 2,
          height: CHIP_ROW_HEIGHT * CHIP_VISIBLE_ROWS + 32, // 固定高度：一排 chip 高度 + padding (16px * 2)
          overflowY: "auto",
          display: "flex",
          alignItems: value.length === 0 ? "center" : "flex-start",
        }}
      >
        {value.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            尚未新增項目
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
            {value.map((item, index) => (
              <Chip
                key={index}
                label={`${item.item} × ${item.qty} ${item.unit}`}
                size="small"
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

