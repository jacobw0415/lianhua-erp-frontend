import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";

import type { ExportEnumMapKey } from "@/utils/exportCellValue";
import { parseYmdLocal } from "@/utils/localYmd";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

export interface ExportPickerColumn {
  header: string;
  key: string;
  width?: number;
  /** 與列表 FunctionField 一致，匯出 enum 中文 */
  enumKey?: ExportEnumMapKey;
}

/** 匯出前依列表資料上的日期欄位篩選（僅作用於目前已載入的列） */
export interface ExportDateFilterConfig {
  /** 後端／列上的欄位名，例如 createdAt、saleDate
   * - `mode="client"` 時會用到（前端依此欄位做篩選）。
   * - `mode="backend"` 時可以只提供 `listRangeFilterKeys` 來覆寫查詢條件，`source` 可不必填。
   */
  source?: string;
  label?: string;
  /** `range`：起迄日；`single`：單一日 */
  mode?: "range" | "single";
  /**
   * 與進階篩選 `dateRange` 一致時，開啟匯出對話框會帶入目前列表 filter 的起迄，
   * 與畫面上搜尋條件對齊（避免重選日期與列表不一致）。
   */
  listRangeFilterKeys?: { from: string; to: string };
}

export interface ExportOptionsConfirm {
  columns: ExportPickerColumn[];
  /** YYYY-MM-DD，未選則不套用日期篩選 */
  dateFrom?: string;
  dateTo?: string;
  /** 前端匯出格式 */
  format?: "excel" | "csv";
  /** 後端匯出：與列表搜尋相同 query，另帶 format、scope；可選日期覆寫列表篩選 */
  backend?: {
    scope: "page" | "all";
    format: string;
    dateFrom?: string;
    dateTo?: string;
    /** 勾選要匯出的欄位 key，送 `GET .../export?columns=...` */
    columnKeys?: string[];
  };
}

export interface ExportColumnPickerDialogProps {
  open: boolean;
  title?: string;
  columns: ExportPickerColumn[];
  /** `client`：前端組檔；`backend`：GET `/{resource}/export` */
  mode?: "client" | "backend";
  /** 後端匯出預設檔案格式（query: format） */
  defaultBackendFormat?: string;
  /** 後端匯出預設範圍（query: scope） */
  defaultBackendScope?: "page" | "all";
  /** 前端匯出預設檔案格式 */
  defaultClientFormat?: "excel" | "csv";
  dateFilter?: ExportDateFilterConfig;
  /**
   * 後端匯出專用：對話框內可選日期區間，會合併進匯出 query（與 `listRangeFilterKeys` 對應之 filter 鍵）。
   */
  backendDateFilter?: ExportDateFilterConfig;
  /** 由列表目前 filter 帶入的起迄（YYYY-MM-DD） */
  listDatePrefill?: { from?: string; to?: string };
  /**
   * 後端 API 不支援「本頁／全部」scope 時隱藏「匯出範圍」（例如全系統活動稽核 export）。
   */
  backendHideScope?: boolean;
  onClose: () => void;
  onConfirm: (payload: ExportOptionsConfirm) => void;
}

export const ExportColumnPickerDialog: React.FC<ExportColumnPickerDialogProps> = ({
  open,
  title = "匯出選項",
  columns,
  mode = "client",
  defaultBackendFormat = "xlsx",
  defaultBackendScope = "page",
  defaultClientFormat = "excel",
  dateFilter,
  backendDateFilter,
  listDatePrefill,
  backendHideScope = false,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme();
  const scrollbarStyles = getScrollbarStyles(theme);

  const [fromDay, setFromDay] = useState<Dayjs | null>(null);
  const [toDay, setToDay] = useState<Dayjs | null>(null);
  const [exportScope, setExportScope] = useState<"page" | "all">(defaultBackendScope);
  const [backendFormat, setBackendFormat] = useState(defaultBackendFormat);
  const [clientFormat, setClientFormat] = useState<"excel" | "csv">(defaultClientFormat);
  const [guardOpen, setGuardOpen] = useState(false);
  const [guardMessage, setGuardMessage] = useState("");

  const activeDateFilter =
    mode === "backend" ? backendDateFilter : dateFilter;
  const dateMode = activeDateFilter?.mode ?? "range";

  useEffect(() => {
    if (!open) return;
    if (mode === "backend") {
      setExportScope(defaultBackendScope);
      setBackendFormat(defaultBackendFormat);
    } else {
      setClientFormat(defaultClientFormat);
    }
  }, [mode, open, defaultBackendFormat, defaultBackendScope, defaultClientFormat]);

  useEffect(() => {
    if (!open || (mode === "client" && columns.length === 0)) return;
    if (!activeDateFilter) return;
    if (dateMode === "single") {
      setFromDay(
        listDatePrefill?.from
          ? parseYmdLocal(listDatePrefill.from) ??
            dayjs(listDatePrefill.from)
          : null
      );
      setToDay(null);
      return;
    }
    setFromDay(
      listDatePrefill?.from
        ? parseYmdLocal(listDatePrefill.from) ?? dayjs(listDatePrefill.from)
        : null
    );
    setToDay(
      listDatePrefill?.to
        ? parseYmdLocal(listDatePrefill.to) ?? dayjs(listDatePrefill.to)
        : null
    );
  }, [
    open,
    columns,
    dateMode,
    listDatePrefill?.from,
    listDatePrefill?.to,
    mode,
    activeDateFilter,
  ]);

  const rangeInvalid = useMemo(() => {
    if (!activeDateFilter || dateMode !== "range") return false;
    if (!fromDay || !toDay) return false;
    return fromDay.startOf("day").isAfter(toDay.startOf("day"));
  }, [activeDateFilter, dateMode, fromDay, toDay]);

  const handleConfirm = () => {
    if (mode === "backend") {
      // 防呆：range 只能填完整起迄
      if (
        backendDateFilter &&
        dateMode === "range" &&
        ((fromDay && !toDay) || (!fromDay && toDay))
      ) {
        setGuardMessage("請完整填寫起始日與結束日後再匯出。");
        setGuardOpen(true);
        return;
      }

      let dateFrom: string | undefined;
      let dateTo: string | undefined;
      if (backendDateFilter) {
        if (dateMode === "single") {
          if (fromDay) {
            const d = fromDay.format("YYYY-MM-DD");
            dateFrom = d;
            dateTo = d;
          }
        } else {
          if (fromDay) dateFrom = fromDay.format("YYYY-MM-DD");
          if (toDay) dateTo = toDay.format("YYYY-MM-DD");
        }
      }
      onConfirm({
        columns,
        backend: {
          scope: exportScope,
          format: backendFormat,
          dateFrom,
          dateTo,
          // 後端匯出模式固定使用頁面定義欄位，不顯示勾選 UI
          columnKeys: columns.map((c) => c.key),
        },
      });
      onClose();
      return;
    }

    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    if (activeDateFilter) {
      if (dateMode === "single") {
        if (fromDay) {
          const d = fromDay.format("YYYY-MM-DD");
          dateFrom = d;
          dateTo = d;
        }
      } else {
        if (fromDay) dateFrom = fromDay.format("YYYY-MM-DD");
        if (toDay) dateTo = toDay.format("YYYY-MM-DD");
      }
    }

    onConfirm({ columns, dateFrom, dateTo, format: clientFormat });
    onClose();
  };

  const dateLabel = activeDateFilter?.label ?? "資料日期";
  const confirmDisabled =
    mode === "backend"
      ? Boolean(backendDateFilter && rangeInvalid)
      : rangeInvalid;

  if (mode === "backend") {
    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent
            dividers
            sx={{
              ...scrollbarStyles,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {backendHideScope
                ? "匯出條件與目前列表篩選一致；後端依條件產出完整檔案（不分頁）。"
                : "匯出條件與目前列表搜尋一致（含排序）；另可選擇僅本頁或符合條件之全部資料。"}
            </Typography>
            {backendDateFilter && (
              <Typography variant="body2" color="text.secondary">
                下方日期區間會合併進匯出請求，並覆寫列表上相同欄位之篩選；清空則不帶該欄位條件。
              </Typography>
            )}
            {backendDateFilter && (
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="zh-tw"
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.primary">
                    {backendDateFilter.label ?? "訂單日期"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    未選則不以此欄位篩選（若列表已有訂單日期，可清空以取消日期條件）。
                  </Typography>
                  {dateMode === "single" ? (
                    <DatePicker
                      label="日期"
                      value={fromDay}
                      onChange={(v) => setFromDay(v)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  ) : (
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                    >
                      <DatePicker
                        label="起始日"
                        value={fromDay}
                        onChange={(v) => setFromDay(v)}
                        maxDate={toDay ?? undefined}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />
                      <DatePicker
                        label="結束日"
                        value={toDay}
                        onChange={(v) => setToDay(v)}
                        minDate={fromDay ?? undefined}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />
                    </Stack>
                  )}
                  {rangeInvalid && (
                    <Typography variant="caption" color="error">
                      結束日不可早於起始日
                    </Typography>
                  )}
                </Stack>
              </LocalizationProvider>
            )}
            {!backendHideScope && (
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend">匯出範圍</FormLabel>
                <RadioGroup
                  value={exportScope}
                  onChange={(e) =>
                    setExportScope(e.target.value as "page" | "all")
                  }
                >
                  <FormControlLabel
                    value="page"
                    control={<Radio size="small" />}
                    label="目前篩選＋本頁"
                  />
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label="符合篩選之全部"
                  />
                </RadioGroup>
              </FormControl>
            )}
            <FormControl size="small" fullWidth>
              <InputLabel id="export-format-label">檔案格式</InputLabel>
              <Select
                labelId="export-format-label"
                label="檔案格式"
                value={backendFormat}
                onChange={(e) => setBackendFormat(String(e.target.value))}
              >
                <MenuItem value="xlsx">Excel（xlsx）</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose}>取消</Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={confirmDisabled}
            >
              匯出
            </Button>
          </DialogActions>
        </Dialog>

        <GlobalAlertDialog
          open={guardOpen}
          title="提示"
          message={guardMessage}
          severity="warning"
          confirmLabel="確定"
          cancelLabel={undefined}
          hideCancel
          onClose={() => setGuardOpen(false)}
        />
      </>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        dividers
        sx={{
          ...scrollbarStyles,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
          {activeDateFilter && (
            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" color="text.primary">
                {dateLabel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                未選日期則匯出目前列表上的全部已載入資料。有選日期時，只匯出該欄位落在區間內的列（僅篩選本頁已載入資料；若要依日期匯出完整結果，請先用列表篩選或後端匯出）。
              </Typography>
              {dateMode === "single" ? (
                <DatePicker
                  label="日期"
                  value={fromDay}
                  onChange={(v) => setFromDay(v)}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                />
              ) : (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <DatePicker
                    label="起始日"
                    value={fromDay}
                    onChange={(v) => setFromDay(v)}
                    maxDate={toDay ?? undefined}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                  <DatePicker
                    label="結束日"
                    value={toDay}
                    onChange={(v) => setToDay(v)}
                    minDate={fromDay ?? undefined}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Stack>
              )}
              {rangeInvalid && (
                <Typography variant="caption" color="error">
                  結束日不可早於起始日
                </Typography>
              )}
            </Stack>
          )}
        </LocalizationProvider>
        <FormControl size="small" fullWidth>
          <InputLabel id="client-export-format-label">檔案格式</InputLabel>
          <Select
            labelId="client-export-format-label"
            label="檔案格式"
            value={clientFormat}
            onChange={(e) =>
              setClientFormat(e.target.value as "excel" | "csv")
            }
          >
            <MenuItem value="excel">Excel（xlsx）</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={confirmDisabled}
        >
          匯出
        </Button>
      </DialogActions>
    </Dialog>
  );
};
