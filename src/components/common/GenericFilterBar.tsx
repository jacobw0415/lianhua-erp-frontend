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
  useMediaQuery,
} from "@mui/material";

import {
  useListFilterContext,
  useCreatePath,
  useResourceContext,
  useRedirect,
} from "react-admin";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
  disableButton?: boolean;
}

export const GenericFilterBar: React.FC<GenericFilterBarProps> = ({
  quickFilters = [],
  advancedFilters = [],
  enableCreate = true,
  enableExport = false,
  createLabel = "新增資料",
  disableCreate = false,
  disableButton = false,
  onExport,
}) => {
  const { filterValues, setFilters } = useListFilterContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [localInputValues, setLocalInputValues] = useState<
    Record<string, string>
  >({});
  const [isComposing, setIsComposing] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const resource = useResourceContext();
  const createPath = useCreatePath();
  const redirect = useRedirect();

  const alert = useGlobalAlert();

  /** 🔍 搜尋 */
  const handleSearch = () => {
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
          setLocalInputValues((prev) => ({ ...prev, [key]: val }));
        }}
        onChange={(e) => {
          const val = e.target.value;
          setLocalInputValues((prev) => ({ ...prev, [key]: val }));
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
          setLocalInputValues((prev) => ({ ...prev, [key]: e.target.value }));
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
          setLocalInputValues((prev) => {
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
            setLocalInputValues((prev) => ({ ...prev, [key]: formatted }));
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
              setLocalInputValues((prev) => ({
                ...prev,
                [startKey]: formatted,
              }));
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
              setLocalInputValues((prev) => ({ ...prev, [endKey]: formatted }));
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
      case "text":
        return renderTextInput(f);
      case "select":
        return renderSelectInput(f);
      case "date":
        return renderDateInput(f);
      case "dateRange":
        return renderDateRange(f);
      case "month":
        return renderMonthPicker(f);
      case "autocomplete":
        return renderSelectInput(f);
      default:
        return null;
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
    setLocalInputValues((prev) => {
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
          p: { xs: 1.5, md: "6px 10px" },
          mb: 1,
          borderRadius: 2,
          border: `1px solid ${theme.palette.action.disabled}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 1.5,
          minHeight: "60px",
        }}
      >
        {/* 左側快速搜尋區塊 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          flexWrap="wrap"
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ flex: 1 }}
        >
          {quickFilters.map((f, idx) => (
            <Box
              key={idx}
              sx={{
                minWidth: { xs: "100%", sm: 220 },
                flex: { xs: 1, sm: "none" },
              }}
            >
              {renderFilter(f)}
            </Box>
          ))}

          {/* 按鈕群組：進階(左)、搜尋(中)、清除(右) */}
          <Stack direction="row" spacing={1} alignItems="center">
            {advancedFilters.length > 0 && !disableButton && (
              <IconButton
                onClick={(e) => {
                  setAnchor(e.currentTarget);
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            )}

            {!disableButton && (  // 搜尋按鈕
              <Button
                variant="contained"
              size="small"
              startIcon={isMobile ? <SearchIcon /> : null}
              sx={{ height: 32, flex: isMobile ? 1 : "none" }}
              onClick={handleSearch}
                >
                搜尋
              </Button>
            )}

            {!disableButton && (  // 清除按鈕
              <Button
                variant="outlined"
              color="error"
              size="small"
              startIcon={isMobile ? <DeleteOutlineIcon /> : null}
              sx={{ height: 32, flex: isMobile ? 1 : "none" }}
              onClick={clearFilters}
                >
                清除
              </Button>
            )}
          </Stack>
        </Stack>

        {/* 右側 Chips + 功能按鈕區塊 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="flex-end"
        >
          {chips.length > 0 && (
            <Box sx={{ overflowX: "auto", py: { xs: 0.5, md: 0 } }}>
              <SearchChipsCompact chips={chips} onRemove={removeFilter} />
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {enableCreate && !disableCreate && (
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  (e.currentTarget as HTMLButtonElement).blur();
                  redirect(createPath({ resource, type: "create" }));
                }}
                sx={{
                  height: 32,
                  minWidth: { xs: "auto", sm: 90 },
                  flex: { xs: 1, sm: "none" },
                  whiteSpace: "nowrap",
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
                sx={{
                  height: 32,
                  flex: { xs: 1, sm: "none" },
                  whiteSpace: "nowrap",
                }}
                onClick={onExport}
              >
                匯出
              </Button>
            )}
          </Stack>
        </Stack>

        <Popover
          open={Boolean(anchor)}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          PaperProps={{
            sx: { width: { xs: "90%", sm: 350 }, maxWidth: 350 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              更多篩選條件
            </Typography>

            <Stack spacing={2}>
              {advancedFilters.map((f, idx) => (
                <Box key={idx}>{renderFilter(f)}</Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={(e) => {
                  (e.currentTarget as HTMLButtonElement).blur();
                  handleSearch();
                  setAnchor(null);
                }}
              >
                套用
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => {
                  clearFilters();
                  setAnchor(null);
                }}
              >
                清除
              </Button>
            </Stack>
          </Box>
        </Popover>
      </Box>

      <GlobalAlertDialog
        open={alert.open}
        message={alert.message}
        onClose={alert.close}
      />
    </>
  );
};