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
import { useGlobalAlert } from "@/hooks/useGlobalAlert";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

interface FilterOption {
  type: "text" | "select" | "dateRange";
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

export const GenericFilterBar: React.FC<GenericFilterBarProps> = ({
  quickFilters = [],
  advancedFilters = [],
  enableCreate = true,
  enableExport = false,
  createLabel = "新增資料",
  onExport,
}) => {
  const { filterValues, setFilters } = useListFilterContext();

  const [localInputValues, setLocalInputValues] =
    useState<Record<string, string>>({});
  const [isComposing, setIsComposing] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const resource = useResourceContext();
  const createPath = useCreatePath();

  /** ⭐ 全域彈窗 */
  const alert = useGlobalAlert();

  /* ------------------------------------------------------------
     ⭐ 安全搜尋 → 不覆蓋使用者輸入、不清空輸入框
  ------------------------------------------------------------ */
  const handleSearch = () => {
    const hasAny = Object.values(localInputValues)
      .some(v => v !== undefined && v !== null && v.toString().trim() !== "");

    if (!hasAny) {
      alert.trigger("請輸入搜尋條件");
      return;
    }

    setFilters({ ...localInputValues }, null, false);
  };

  /* ------------------------------------------------------------
     ⭐ 安全清除
  ------------------------------------------------------------ */
  const clearFilters = () => {
    setLocalInputValues({});
    setFilters({}, null, false);
  };

  /* ------------------------------------------------------------
     ⭐ 安全取得 event.value（避免 null / div.target）
  ------------------------------------------------------------ */
  const safeGetValue = (e: any): string | undefined => {
    const target = e.target as HTMLInputElement | null;
    if (!target) return undefined;
    if (typeof target.value !== "string") return undefined;
    return target.value;
  };

  /* ------------------------------------------------------------
     ⭐ Text Input（支援中文 & Enter）
  ------------------------------------------------------------ */
  const renderTextInput = (f: FilterOption) => {
    const key = f.source;
    const value = localInputValues[key] ?? "";

    return (
      <TextField
        label={f.label}
        fullWidth
        value={value}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false);

          const val = safeGetValue(e);
          if (val === undefined) return;

          setLocalInputValues((prev) => ({
            ...prev,
            [key]: val,
          }));
        }}
        onChange={(e) => {
          const val = safeGetValue(e);
          if (val === undefined) return;

          setLocalInputValues((prev) => ({
            ...prev,
            [key]: val,
          }));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isComposing) {
            e.preventDefault();
            e.stopPropagation();
            handleSearch();
          }
        }}
      />
    );
  };

  /* ------------------------------------------------------------
     ⭐ Select Input
  ------------------------------------------------------------ */
  const renderSelectInput = (f: FilterOption) => {
    const key = f.source;
    const value = localInputValues[key] ?? "";

    return (
      <TextField
        select
        label={f.label}
        fullWidth
        value={value}
        onChange={(e) => {
          const val = safeGetValue(e);
          if (val === undefined) return;

          setLocalInputValues((prev) => ({
            ...prev,
            [key]: val,
          }));
        }}
      >
        {f.choices?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  /* ------------------------------------------------------------
     ⭐ 日期區間
  ------------------------------------------------------------ */
  const renderDateRange = (f: FilterOption) => {
    const startKey = `${f.source}Start`;
    const endKey = `${f.source}End`;

    return (
      <Stack direction="row" spacing={1}>
        <TextField
          type="date"
          label="開始"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={localInputValues[startKey] ?? ""}
          onChange={(e) => {
            const val = safeGetValue(e);
            if (val === undefined) return;
            setLocalInputValues((prev) => ({ ...prev, [startKey]: val }));
          }}
        />
        <TextField
          type="date"
          label="結束"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={localInputValues[endKey] ?? ""}
          onChange={(e) => {
            const val = safeGetValue(e);
            if (val === undefined) return;
            setLocalInputValues((prev) => ({ ...prev, [endKey]: val }));
          }}
        />
      </Stack>
    );
  };

  /* ------------------------------------------------------------
     ⭐ 判斷並渲染欄位
  ------------------------------------------------------------ */
  const renderFilter = (f: FilterOption) => {
    switch (f.type) {
      case "text":
        return renderTextInput(f);
      case "select":
        return renderSelectInput(f);
      case "dateRange":
        return renderDateRange(f);
      default:
        return null;
    }
  };

  /* ------------------------------------------------------------
     ⭐ Chips（安全同步 state）
  ------------------------------------------------------------ */
  const chips = formatFilters(filterValues);

  const removeFilter = (key: string) => {
    const updated = { ...filterValues };

    delete updated[key];
    delete updated[key + "Start"];
    delete updated[key + "End"];

    setFilters(updated, null, false);

    setLocalInputValues((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next[key + "Start"];
      delete next[key + "End"];
      return next;
    });
  };

  /* ------------------------------------------------------------
     ⭐ UI Layout
  ------------------------------------------------------------ */
  return (
    <>
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* 左側的搜尋區 */}
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          {quickFilters.map((f, idx) => (
            <Box key={idx} sx={{ minWidth: 220 }}>
              {renderFilter(f)}
            </Box>
          ))}

          {advancedFilters.length > 0 && (
            <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
              <FilterListIcon />
            </IconButton>
          )}

          <Button variant="contained" onClick={handleSearch}>
            搜尋
          </Button>

          <Button variant="outlined" color="error" onClick={clearFilters}>
            清除
          </Button>
        </Stack>

        {/* 右側區塊：Chips、建立、匯出 */}
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

        {/* 進階搜尋 Popover */}
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
              <Button 
                fullWidth 
                variant="contained" 
                onClick={(e) => {
                  (e.currentTarget as HTMLButtonElement).blur(); 
                  handleSearch();
                }}>
                套用
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={clearFilters}
              >
                清除
              </Button>
            </Stack>
          </Box>
        </Popover>
      </Box>

      {/* ⭐ 全域搜尋提示 */}
      <GlobalAlertDialog
        open={alert.open}
        message={alert.message}
        onClose={alert.close}
      />
    </>
  );
};
