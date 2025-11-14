import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";

import {
  useListFilterContext,
  useCreatePath,
  useResourceContext,
} from "react-admin";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";

import { SearchChipsCompact } from "./SearchChipsCompact";
import { formatFilters } from "@/utils/formatFilters";

/* ----------------------------
   🧩 FilterOption + Props 定義
----------------------------- */
interface FilterOption {
  type: "text" | "select" | "dateRange" | "numberRange";
  source: string;
  label: string;
  choices?: { id: any; name: string }[];
}

interface GenericFilterBarProps {
  quickFilters?: FilterOption[];
  advancedFilters?: FilterOption[];

  enableCreate?: boolean;
  enableExport?: boolean;
  createLabel?: string;
  onExport?: () => void;
}

/* ----------------------------
   🧩 主元件（新版：使用 RA FilterContext）
----------------------------- */
export const GenericFilterBar: React.FC<GenericFilterBarProps> = ({
  quickFilters = [],
  advancedFilters = [],
  enableCreate = true,
  enableExport = false,
  createLabel = "新增資料",
  onExport,
}) => {
  const { filterValues, setFilters } = useListFilterContext();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const resource = useResourceContext();
  const createPath = useCreatePath();

  /* ----------------------------
     🧩 更新 filter 值（直接更新 RA Context）
  ----------------------------- */
  const updateValue = (key: string, value: any) => {
    setFilters({ ...filterValues, [key]: value });
  };

  const applyFilters = () => setAnchor(null);

  const clearFilters = () => {
    setFilters({});
    setAnchor(null);
  };

  /* ----------------------------
     🧩 Filter UI 渲染器
  ----------------------------- */
  const renderFilter = (f: FilterOption) => {
    switch (f.type) {
      case "text":
        return (
          <TextField
            label={f.label}
            fullWidth
            value={filterValues[f.source] ?? ""}
            onChange={(e) => updateValue(f.source, e.target.value)}
          />
        );

      case "select":
        return (
          <TextField
            label={f.label}
            select
            fullWidth
            value={filterValues[f.source] ?? ""}
            onChange={(e) => updateValue(f.source, e.target.value)}
          >
            {f.choices?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        );

      case "dateRange":
        return (
          <Stack direction="row" spacing={1}>
            <TextField
              type="date"
              label="開始"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={filterValues[`${f.source}Start`] || ""}
              onChange={(e) => updateValue(`${f.source}Start`, e.target.value)}
            />
            <TextField
              type="date"
              label="結束"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={filterValues[`${f.source}End`] || ""}
              onChange={(e) => updateValue(`${f.source}End`, e.target.value)}
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  /* ----------------------------
     🧩 Chips（使用 formatter → 正確顯示中文 / 值）
  ----------------------------- */
  const chips = formatFilters(filterValues);

  const removeFilter = (key: string) => {
    const updated = { ...filterValues };

    // 日期區間成對刪除
    if (updated[key + "Start"] || updated[key + "End"]) {
      delete updated[key + "Start"];
      delete updated[key + "End"];
    }

    delete updated[key];
    setFilters(updated);
  };

  /* ----------------------------
     🧩 UI Layout（關鍵修復）
  ----------------------------- */
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid #ddd",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // ⭐避免按鈕被擠壓變形
        gap: 2,
      }}
    >
      {/* 左側：篩選器們 */}
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
        {quickFilters.map((f, idx) => (
          <Box key={idx} sx={{ minWidth: 220 }}>
            {renderFilter(f)}
          </Box>
        ))}

        {advancedFilters.length > 0 && (
          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
           
          >
            <FilterListIcon />
          </IconButton>
        )}

        <Button variant="contained" onClick={applyFilters}>
          搜尋
        </Button>

        <Button variant="outlined" color="error" onClick={clearFilters}>
          清除
        </Button>
      </Stack>

      {/* 右側：Chips + 新增 + 匯出 */}
      <Stack direction="row" spacing={1} alignItems="center">
        <SearchChipsCompact chips={chips} onRemove={removeFilter} />

        {enableCreate && (
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            href={`#${createPath({ resource, type: "create" })}`}
          >
            {createLabel}
          </Button>
        )}

        {enableExport && onExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
          >
            匯出資料
          </Button>
        )}
      </Stack>

      {/* Popover 進階篩選 */}
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            更多篩選條件
          </Typography>

          <Stack spacing={2}>
            {advancedFilters.map((f, idx) => (
              <Box key={idx}>{renderFilter(f)}</Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button fullWidth variant="contained" onClick={applyFilters}>
              套用
            </Button>
            <Button fullWidth variant="outlined" color="error" onClick={clearFilters}>
              清除
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};
