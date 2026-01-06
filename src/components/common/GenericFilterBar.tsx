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
  useTheme,
} from "@mui/material";

import {
  useListFilterContext,
  useCreatePath,
  useResourceContext,
} from "react-admin";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { SearchChipsCompact } from "./SearchChipsCompact";
import { formatFilters } from "@/utils/formatFilters";
import { useGlobalAlert } from "@/hooks/useGlobalAlert";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { MonthPicker } from "./MonthPicker";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

interface FilterOption {
  type: "text" | "select" | "dateRange" | "date" | "autocomplete" | "month";
  source: string;
  label: string;
  choices?: { id: string | number; name: string }[];
}

interface GenericFilterBarProps {
  quickFilters?: FilterOption[];
  advancedFilters?: FilterOption[];
  enableCreate?: boolean;
  enableExport?: boolean;
  createLabel?: string;
  onExport?: () => void;
  disableCreate?: boolean;
}

export const GenericFilterBar: React.FC<GenericFilterBarProps> = ({
  quickFilters = [],
  advancedFilters = [],
  enableCreate = true,
  enableExport = false,
  createLabel = "新增資料",
  disableCreate = false,
  onExport,
}) => {
  const { filterValues, setFilters } = useListFilterContext();
  const theme = useTheme();

  const [localInputValues, setLocalInputValues] =
    useState<Record<string, string>>({});
  const [isComposing, setIsComposing] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const resource = useResourceContext();
  const createPath = useCreatePath();

  const alert = useGlobalAlert();

  /** 🔍 搜尋 */
  const handleSearch = () => {
    // 🛡️ 過濾掉空值、undefined、null、純空白字串
    const validFilters: Record<string, string> = {};
    for (const [key, value] of Object.entries(localInputValues)) {
      if (
        value !== undefined &&
        value !== null &&
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        validFilters[key] = value.trim();
      }
    }

    const hasAny = Object.keys(validFilters).length > 0;

    if (!hasAny) {
      alert.trigger("請輸入搜尋條件");
      (document.activeElement as HTMLElement)?.blur();
      return;
    }

    // 只設定有效的篩選值，確保 chips 只顯示使用者實際輸入的內容
    setFilters(validFilters, null, false);
    (document.activeElement as HTMLElement)?.blur();
  };

  /** ❌ 清除 */
  const clearFilters = () => {
    setLocalInputValues({});
    setFilters({}, null, false);
    (document.activeElement as HTMLElement)?.blur();
  };

  /** 🧩 文字輸入 */
  const renderTextInput = (f: FilterOption) => {
    const key = f.source;
    const value = localInputValues[key] ?? "";

    return (
      <TextField
        label={f.label}
        fullWidth
        value={value}
        size="small"
        sx={{
          "& .MuiInputBase-root": {
            height: 40,
            fontSize: "0.85rem",
          },
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false);
          const val = (e.target as HTMLInputElement).value;
          setLocalInputValues(prev => ({ ...prev, [key]: val }));
        }}
        onChange={(e) => {
          const val = e.target.value;
          setLocalInputValues(prev => ({ ...prev, [key]: val }));
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

  /** 🔽 選單 */
  const renderSelectInput = (f: FilterOption) => {
    const key = f.source;

    return (
      <TextField
        select
        label={f.label}
        fullWidth
        value={localInputValues[key] ?? ""}
        size="small"
        sx={{
          "& .MuiInputBase-root": { height: 40 },
          "& .MuiSelect-select": { padding: "10px 14px" },
        }}
        onChange={(e) => {
          setLocalInputValues(prev => ({ ...prev, [key]: e.target.value }));
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

  /** 📅 月份選擇（YYYY-MM） */
  const renderMonthPicker = (f: FilterOption) => {
    const key = f.source;
    const value = localInputValues[key] || null;

    return (
      <MonthPicker
        label={f.label}
        value={value}
        onChange={(newValue) => {
          // 保持 null 值的一致性，空字符串也轉換為 null
          setLocalInputValues(prev => {
            const next = { ...prev };
            if (newValue && newValue.trim()) {
              next[key] = newValue;
            } else {
              delete next[key];
            }
            return next;
          });
        }}
        fullWidth
        size="small"
        format="YYYY-MM"
      />
    );
  };

  /** 📅 單一日期（YYYY-MM-DD） */
  const renderDateInput = (f: FilterOption) => {
    const key = f.source;
    const date = localInputValues[key] ? dayjs(localInputValues[key]) : null;

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={f.label}
          format="YYYY-MM-DD"
          value={date}
          onChange={(newValue) => {
            const formatted = newValue ? newValue.format("YYYY-MM-DD") : "";
            setLocalInputValues(prev => ({ ...prev, [key]: formatted }));
          }}
          slots={{ openPickerIcon: CalendarMonthIcon }}
          slotProps={{
            openPickerIcon: {
              sx: { color: theme.palette.mode === "light" ? "#444" : "#fff" },
            },
            textField: {
              fullWidth: true,
              size: "small",
              sx: { "& .MuiInputBase-root": { height: 40 } },
            },
          }}
        />
      </LocalizationProvider>
    );
  };

  /** 📅 日期區間（YYYY-MM-DD） */
  const renderDateRange = (f: FilterOption) => {
    const startKey = `${f.source}Start`;
    const endKey = `${f.source}End`;

    const startDate = localInputValues[startKey]
      ? dayjs(localInputValues[startKey])
      : null;

    const endDate = localInputValues[endKey]
      ? dayjs(localInputValues[endKey])
      : null;

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={1}>
          <DatePicker
            label="開始"
            format="YYYY-MM-DD"
            value={startDate}
            onChange={(newValue) => {
              const formatted = newValue ? newValue.format("YYYY-MM-DD") : "";
              setLocalInputValues(prev => ({ ...prev, [startKey]: formatted }));
            }}
            slots={{ openPickerIcon: CalendarMonthIcon }}
            slotProps={{
              openPickerIcon: {
                sx: { color: theme.palette.mode === "light" ? "#444" : "#fff" },
              },
              textField: {
                fullWidth: true,
                size: "small",
                sx: { "& .MuiInputBase-root": { height: 40 } },
              },
            }}
          />

          <DatePicker
            label="結束"
            format="YYYY-MM-DD"
            value={endDate}
            onChange={(newValue) => {
              const formatted = newValue ? newValue.format("YYYY-MM-DD") : "";
              setLocalInputValues(prev => ({ ...prev, [endKey]: formatted }));
            }}
            slots={{ openPickerIcon: CalendarMonthIcon }}
            slotProps={{
              openPickerIcon: {
                sx: { color: theme.palette.mode === "light" ? "#444" : "#fff" },
              },
              textField: {
                fullWidth: true,
                size: "small",
                sx: { "& .MuiInputBase-root": { height: 40 } },
              },
            }}
          />
        </Stack>
      </LocalizationProvider>
    );
  };

  /** 🔀 渲染對應欄位 */
  const renderFilter = (f: FilterOption) => {
    switch (f.type) {
      case "text": return renderTextInput(f);
      case "select": return renderSelectInput(f);
      case "date": return renderDateInput(f);
      case "dateRange": return renderDateRange(f);
      case "month": return renderMonthPicker(f);
      case "autocomplete": return renderSelectInput(f);
      default: return null;
    }
  };

  /** 🏷 Chips */
  const chips = formatFilters(filterValues);

  const removeFilter = (key: string) => {
    const updated = { ...filterValues };

    delete updated[key];
    delete updated[key + "Start"];
    delete updated[key + "End"];

    setFilters(updated, null, false);

    setLocalInputValues(prev => {
      const next = { ...prev };
      delete next[key];
      delete next[key + "Start"];
      delete next[key + "End"];
      return next;
    });
  };

  /** ⭐ UI 結構 */
  return (
    <>
      <Box
        sx={{
          p: "6px 10px",
          mb: 1,
          borderRadius: 2,
          border: `1px solid ${theme.palette.action.disabled}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          minHeight: "60px",
        }}
      >
        {/* 左側快速搜尋 */}
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          {quickFilters.map((f, idx) => (
            <Box key={idx} sx={{ minWidth: 220 }}>
              {renderFilter(f)}
            </Box>
          ))}

          {advancedFilters.length > 0 && (
            <IconButton onClick={(e) => {
              setAnchor(e.currentTarget);
              (e.currentTarget as HTMLButtonElement).blur();
            }}>
              <FilterListIcon />
            </IconButton>
          )}

          <Button
            variant="contained"
            size="small"
            sx={{ height: 32 }}
            onClick={handleSearch}
          >
            搜尋
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ height: 32 }}
            onClick={clearFilters}
          >
            清除
          </Button>
        </Stack>

        {/* 右側 Chips + 建立 + 匯出 */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
          <SearchChipsCompact chips={chips} onRemove={removeFilter} />

          {enableCreate && !disableCreate && (
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              href={`#${createPath({ resource, type: "create" })}`}
              sx={{
                height: 32,
                minWidth: 90,
                padding: "0 12px",
                fontSize: "0.85rem",
              }}
            >
              {createLabel}
            </Button>
          )}

          {enableExport && onExport && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ height: 32 }}
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
                }}
              >
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

      {/* 全域提示 */}
      <GlobalAlertDialog
        open={alert.open}
        message={alert.message}
        onClose={alert.close}
      />
    </>
  );
};
