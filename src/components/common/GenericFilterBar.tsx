import React, { useState, useEffect} from "react";
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Popover,
  Drawer,
  Typography,
  useTheme,
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
import { useIsMobile, useIsSmallScreen, useIsLargeScreen, useIsTablet } from "@/hooks/useIsMobile";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";
import { getStoredAuthRoles, hasStoredAuthority, hasRoleAdmin } from "@/utils/authStorage";
import {
  CREATE_PERMISSION_BY_RESOURCE,
  EXPORT_PERMISSION_BY_RESOURCE,
} from "@/constants/permissionConfig";

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
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();
  const isLargeScreen = useIsLargeScreen();
  const isTablet = useIsTablet();
  const useCompactFilterLayout = !isLargeScreen;
  const useTabletSemiCompact = useCompactFilterLayout && isTablet;

  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>(
    {},
  );
  const [isComposing, setIsComposing] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const resource = useResourceContext() ?? "";
  const createPath = useCreatePath();
  const redirect = useRedirect();

  const alert = useGlobalAlert();

  /** RBAC：新增 / 匯出按鈕權限 */
  const storedRoles = getStoredAuthRoles();
  const isAdmin = hasRoleAdmin(storedRoles);
  const requiredCreateAuth =
    resource && CREATE_PERMISSION_BY_RESOURCE[resource]
      ? CREATE_PERMISSION_BY_RESOURCE[resource]
      : "";
  const canCreate =
    isAdmin ||
    (requiredCreateAuth
      ? hasStoredAuthority(storedRoles, requiredCreateAuth)
      : false);

  const requiredExportAuth =
    resource && EXPORT_PERMISSION_BY_RESOURCE[resource]
      ? EXPORT_PERMISSION_BY_RESOURCE[resource]
      : "";
  const canExport =
    isAdmin ||
    (requiredExportAuth
      ? hasStoredAuthority(storedRoles, requiredExportAuth)
      : false);

  // 當 isSmallScreen 改變時，清除 anchor 以避免 anchorEl 無效錯誤
  useEffect(() => {
    // 當從 Popover 切換到 Drawer 或反之時，清除 anchor
    if (anchor) {
      // 檢查 anchor 元素是否仍在 DOM 中且可見
      const isValid = anchor.offsetParent !== null || document.body.contains(anchor);
      if (!isValid) {
        setAnchor(null);
      }
    }
  }, [isSmallScreen]);

  // 當 anchor 改變時，驗證其有效性
  useEffect(() => {
    if (anchor && !isSmallScreen) {
      // 對於 Popover，確保 anchor 有效
      const isValid = anchor.offsetParent !== null || document.body.contains(anchor);
      if (!isValid) {
        setAnchor(null);
      }
    }
  }, [anchor, isSmallScreen]);

  /** 🔍 建立有效搜尋條件物件（去除空值） */
  const buildValidFilters = () => {
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
    return validFilters;
  };

  /** 🔍 搜尋 */
  const handleSearch = () => {
    const validFilters = buildValidFilters();

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
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          "& .MuiInputLabel-root": {
            lineHeight: 1.5,
            "&.MuiInputLabel-shrink": { lineHeight: 1.4 },
          },
          "& .MuiInputBase-root": {
            height: 40,
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            width: "100%",
            maxWidth: "100%",
          },
          "& .MuiInputBase-input": {
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            width: "100%",
            maxWidth: "100%",
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
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          "& .MuiInputLabel-root": {
            lineHeight: 1.5,
            "&.MuiInputLabel-shrink": { lineHeight: 1.4 },
          },
          "& .MuiInputBase-root": { 
            height: 40,
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            width: "100%",
            maxWidth: "100%",
          },
          "& .MuiSelect-select": { 
            padding: { xs: "8px 12px", sm: "10px 14px" },
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            width: "100%",
            maxWidth: "100%",
          },
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
      <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
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
      </Box>
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
                sx: { color: theme.palette.text.primary },
              },
              textField: {
                fullWidth: true,
                size: "small",
                sx: { 
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  "& .MuiInputLabel-root": {
                    lineHeight: 1.5,
                    "&.MuiInputLabel-shrink": { lineHeight: 1.4 },
                  },
                  "& .MuiInputBase-root": { 
                    height: 40,
                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                    width: "100%",
                    maxWidth: "100%",
                  },
                },
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
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={1}
          sx={{ 
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
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
                sx: { color: theme.palette.text.primary },
              },
              textField: {
                fullWidth: true,
                size: "small",
                sx: { 
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  "& .MuiInputLabel-root": {
                    lineHeight: 1.5,
                    "&.MuiInputLabel-shrink": { lineHeight: 1.4 },
                  },
                  "& .MuiInputBase-root": { 
                    height: 40,
                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                    width: "100%",
                    maxWidth: "100%",
                  },
                },
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
                sx: { color: theme.palette.text.primary },
              },
              textField: {
                fullWidth: true,
                size: "small",
                sx: { 
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  "& .MuiInputLabel-root": {
                    lineHeight: 1.5,
                    "&.MuiInputLabel-shrink": { lineHeight: 1.4 },
                  },
                  "& .MuiInputBase-root": { 
                    height: 40,
                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                    width: "100%",
                    maxWidth: "100%",
                  },
                },
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
          p: { xs: 0.75, sm: 1.25, md: "6px 10px" },
          mb: { xs: 0.75, sm: 1 },
          borderRadius: 2,
          border: `1px solid ${theme.palette.action.disabled}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 0.75, sm: 1.25, md: 1.5 },
          minHeight: "60px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflow: "visible",
          ...(useCompactFilterLayout && {
            // 手機與平板統一採用直向排列，避免按鈕在平板寬度下溢出
            flexDirection: "column",
            flexWrap: "nowrap",
            p: 1,
            gap: 1.5,
            alignItems: "stretch",
          }),
        }}
      >
        {/* 左側快速搜尋區塊 */}
        <Stack
          direction={useCompactFilterLayout ? "column" : { xs: "column", sm: "row" }}
          spacing={{ xs: 0.75, sm: 1.25, md: 1.5 }}
          flexWrap="wrap"
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ 
            flex: 1,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "visible",
            ...(useCompactFilterLayout && {
              // 手機與平板統一直向堆疊搜尋欄位
              direction: "column",
              spacing: 1.5,
            }),
          }}
        >
          {quickFilters.map((f, idx) => (
            <Box
              key={idx}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: 0, sm: 200, md: 220 },
                maxWidth: { xs: "100%", sm: "none" },
                flex: { xs: "1 1 100%", sm: "0 1 auto" },
                // 手機與平板：前幾個搜尋欄位統一全寬、上下保留間距
                ...(useCompactFilterLayout && { width: "100%", minWidth: 0, flex: "1 1 100%" }),
              }}
            >
              {renderFilter(f)}
            </Box>
          ))}

          {/* 按鈕群組：進階(左)、搜尋(中)、清除(右) */}
          <Stack 
            direction={{ xs: "row", sm: "row" }} 
            spacing={{ xs: 0.75, sm: 1 }} 
            alignItems="center"
            sx={{
              width: { xs: "100%", sm: "auto" },
              maxWidth: { xs: "100%", sm: "none" },
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            {advancedFilters.length > 0 && !disableButton && (
              <IconButton
                onClick={(e) => {
                  const target = e.currentTarget;
                  // 確保元素在 DOM 中
                  if (target && target.offsetParent !== null) {
                    setAnchor(target);
                  }
                  (target as HTMLButtonElement).blur();
                }}
                sx={{
                  flexShrink: 0,
                  padding: { xs: 0.5, sm: 1 },
                }}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            )}

            {!disableButton && (  // 搜尋按鈕
              <Button
                variant="contained"
                size="small"
                startIcon={isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? <SearchIcon /> : null}
                sx={{ 
                  height: 32, 
                  flex: isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? "1 1 0" : "none",
                  minWidth: isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? 0 : "auto",
                  maxWidth: isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? "100%" : "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "4px 8px", sm: "6px 16px" },
                  whiteSpace: "nowrap",
                }}
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
                startIcon={isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? <DeleteOutlineIcon /> : null}
                sx={{ 
                  height: 32, 
                  flex: isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? "1 1 0" : "none",
                  minWidth: isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? 0 : "auto",
                  maxWidth: isMobile || (useCompactFilterLayout && !useTabletSemiCompact) ? "100%" : "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "4px 8px", sm: "6px 16px" },
                  whiteSpace: "nowrap",
                }}
                onClick={clearFilters}
              >
                清除
              </Button>
            )}
          </Stack>
        </Stack>

        {/* 右側 Chips + 功能按鈕區塊 */}
        <Stack
          // 手機／平板：Chips 與按鈕群組上下排列；桌面維持原本左右排列
          direction={useCompactFilterLayout ? "column" : { xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="flex-end"
          sx={{
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
            ...(useCompactFilterLayout && {
              // 手機／平板：Chips + 功能按鈕統一直向、全寬，預留一整排給 Chips
              direction: "column",
              spacing: 1.5,
              width: "100%",
              alignItems: "stretch",
            }),
          }}
        >
          {chips.length > 0 && (
            <Box 
              sx={{ 
                overflowX: "auto", 
                py: { xs: 0.5, md: 0 },
                // 手機／平板：Chips 佔滿一整行，與搜尋欄對齊
                width: useCompactFilterLayout ? "100%" : { xs: "100%", sm: "auto" },
                maxWidth: useCompactFilterLayout ? "100%" : { xs: "100%", sm: "none" },
              }}
            >
              <SearchChipsCompact chips={chips} onRemove={removeFilter} />
            </Box>
          )}

        <Stack 
          direction={useCompactFilterLayout ? "column" : { xs: "column", sm: "row" }} 
            spacing={{ xs: 0.75, sm: 1 }} 
            justifyContent="flex-end"
            sx={{
              width: { xs: "100%", sm: "auto" },
              maxWidth: { xs: "100%", sm: "none" },
              minWidth: 0,
            // 手機與平板：功能按鈕群組改為直向、全寬，避免平板寬度下超出表框
            ...(useCompactFilterLayout && { direction: "column", width: "100%" }),
            }}
          >
            {enableCreate && !disableCreate && canCreate && (
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
                  // 手機與平板：按鈕改為全寬堆疊，桌面維持原本尺寸
                  minWidth: useCompactFilterLayout ? 0 : { xs: 0, sm: 90 },
                  width: useCompactFilterLayout ? "100%" : { xs: "100%", sm: "auto" },
                  maxWidth: useCompactFilterLayout ? "100%" : { xs: "100%", sm: "none" },
                  flex: { xs: "none", sm: "none" },
                  whiteSpace: "nowrap",
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  padding: { xs: "4px 8px", sm: "6px 16px" },
                }}
              >
                {createLabel}
              </Button>
            )}

            {enableExport && onExport && canExport && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  height: 32,
                  // 手機與平板：匯出按鈕也全寬，並排在新增資料下方
                  width: useCompactFilterLayout ? "100%" : { xs: "100%", sm: "auto" },
                  maxWidth: useCompactFilterLayout ? "100%" : { xs: "100%", sm: "none" },
                  flex: { xs: "none", sm: "none" },
                  whiteSpace: "nowrap",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "4px 8px", sm: "6px 16px" },
                }}
                onClick={onExport}
              >
                匯出
              </Button>
            )}
          </Stack>
        </Stack>

        {/* 進階篩選：小螢幕使用 Drawer，桌面版使用 Popover */}
        {isSmallScreen ? (
          <Drawer
            anchor="bottom"
            open={Boolean(anchor)}
            onClose={() => {
              // 修復 aria-hidden 警告：在關閉 Drawer 前先移除所有焦點
              // 這確保在 Drawer 設置 aria-hidden 之前，焦點已經被移除
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              setAnchor(null);
            }}
            ModalProps={{
              // 禁用自動焦點管理，避免與 aria-hidden 衝突
              disableAutoFocus: true,
              disableEnforceFocus: true,
              disableRestoreFocus: true,
            }}
            PaperProps={{
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: "80vh",
              },
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
                    // 先移除焦點，避免 aria-hidden 警告
                    (e.currentTarget as HTMLButtonElement).blur();
                    handleSearch();
                    // 延遲關閉，確保焦點已移除
                    setTimeout(() => {
                      setAnchor(null);
                    }, 0);
                  }}
                >
                  套用
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    // 先移除焦點，避免 aria-hidden 警告
                    (e.currentTarget as HTMLButtonElement).blur();
                    clearFilters();
                    // 延遲關閉，確保焦點已移除
                    setTimeout(() => {
                      setAnchor(null);
                    }, 0);
                  }}
                >
                  清除
                </Button>
              </Stack>
            </Box>
          </Drawer>
        ) : (
          <Popover
            open={Boolean(anchor) && anchor !== null}
            anchorEl={anchor}
            onClose={() => {
              // 關閉前先移除目前的焦點，避免 aria-hidden 與保留焦點衝突
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              setAnchor(null);
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            PaperProps={{
              sx: { width: 350, maxWidth: 350 },
            }}
            // 直接在 Popover 上關閉焦點管理，避免 aria-hidden 警告
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            // 確保 anchorEl 有效
            disablePortal={false}
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
        )}
      </Box>

      <GlobalAlertDialog
        open={alert.open}
        title={alert.title}
        message={alert.message}
        severity={alert.severity}
        confirmLabel={alert.confirmText}
        cancelLabel={alert.cancelText}
        hideCancel={!alert.cancelText}
        onClose={alert.close}
        onConfirm={alert.onConfirm}
      />
    </>
  );
};