import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";

import type { ExportEnumMapKey } from "@/utils/exportCellValue";
import { parseYmdLocal } from "@/utils/localYmd";

export interface ExportPickerColumn {
  header: string;
  key: string;
  width?: number;
  /** 與列表 FunctionField 一致，匯出 enum 中文 */
  enumKey?: ExportEnumMapKey;
}

/** 匯出前依列表資料上的日期欄位篩選（僅作用於目前已載入的列） */
export interface ExportDateFilterConfig {
  /** 後端／列上的欄位名，例如 createdAt、saleDate */
  source: string;
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
}

export interface ExportColumnPickerDialogProps {
  open: boolean;
  title?: string;
  columns: ExportPickerColumn[];
  /** 為 false 時不顯示欄位勾選（匯出全部 `columns`） */
  showColumnPicker?: boolean;
  dateFilter?: ExportDateFilterConfig;
  /** 由列表目前 filter 帶入的起迄（YYYY-MM-DD） */
  listDatePrefill?: { from?: string; to?: string };
  onClose: () => void;
  onConfirm: (payload: ExportOptionsConfirm) => void;
}

export const ExportColumnPickerDialog: React.FC<ExportColumnPickerDialogProps> = ({
  open,
  title = "匯出選項",
  columns,
  showColumnPicker = true,
  dateFilter,
  listDatePrefill,
  onClose,
  onConfirm,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [fromDay, setFromDay] = useState<Dayjs | null>(null);
  const [toDay, setToDay] = useState<Dayjs | null>(null);

  const dateMode = dateFilter?.mode ?? "range";

  useEffect(() => {
    if (!open || columns.length === 0) return;
    setSelectedKeys(new Set(columns.map((c) => c.key)));
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
  }, [open, columns, dateMode, listDatePrefill?.from, listDatePrefill?.to]);

  const toggle = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedKeys(new Set(columns.map((c) => c.key)));
  }, [columns]);

  const clearAll = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const rangeInvalid = useMemo(() => {
    if (!dateFilter || dateMode !== "range") return false;
    if (!fromDay || !toDay) return false;
    return fromDay.startOf("day").isAfter(toDay.startOf("day"));
  }, [dateFilter, dateMode, fromDay, toDay]);

  const handleConfirm = () => {
    const selected = showColumnPicker
      ? columns.filter((c) => selectedKeys.has(c.key))
      : columns;

    if (selected.length === 0) return;

    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    if (dateFilter) {
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

    onConfirm({ columns: selected, dateFrom, dateTo });
    onClose();
  };

  const dateLabel = dateFilter?.label ?? "資料日期";
  const confirmDisabled =
    (showColumnPicker && selectedKeys.size === 0) || rangeInvalid;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
          {dateFilter && (
            <Stack spacing={1.5} sx={{ mb: showColumnPicker ? 2.5 : 0 }}>
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

          {showColumnPicker && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                勾選要匯出的欄位；未勾選的欄位不會出現在檔案中。
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button size="small" onClick={selectAll}>
                  全選
                </Button>
                <Button size="small" onClick={clearAll}>
                  清除
                </Button>
              </Stack>
              <FormGroup>
                {columns.map((col) => (
                  <FormControlLabel
                    key={col.key}
                    control={
                      <Checkbox
                        checked={selectedKeys.has(col.key)}
                        onChange={() => toggle(col.key)}
                      />
                    }
                    label={col.header}
                  />
                ))}
              </FormGroup>
            </>
          )}
        </LocalizationProvider>
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
