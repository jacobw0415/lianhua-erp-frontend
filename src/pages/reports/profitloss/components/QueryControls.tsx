import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CardActions,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import type { ComprehensiveIncomeStatementQueryParams } from "@/hooks/useComprehensiveIncomeStatement";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import { MonthPicker } from "@/components/common/MonthPicker";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

interface QueryControlsProps {
  queryMode: "period" | "dateRange" | "periods";
  onQueryModeChange: (mode: "period" | "dateRange" | "periods") => void;
  period: string;
  onPeriodChange: (period: string) => void;
  periods: string[];
  onPeriodsChange: (periods: string[]) => void;
  startDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  onEndDateChange: (date: Dayjs | null) => void;
  onBatchDateChange?: (start: Dayjs | null, end: Dayjs | null) => void;
  onQuery: () => void;
  onQuickSelectQuery?: (params: ComprehensiveIncomeStatementQueryParams) => void;
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
  exporting?: boolean;
  hasData: boolean;
  dateRangeError?: string | null;
  canQuery?: boolean;
}

export const QueryControls = ({
  queryMode,
  onQueryModeChange,
  period,
  onPeriodChange,
  periods,
  onPeriodsChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onBatchDateChange,
  onQuery,
  onQuickSelectQuery,
  onRefresh,
  onExport,
  loading,
  exporting = false,
  hasData,
  dateRangeError,
  canQuery = false,
}: QueryControlsProps) => {
  const MAX_PERIODS = 12;

  // 快速選擇處理
  const handleQuickSelect = (params: ComprehensiveIncomeStatementQueryParams) => {
    if (params.periods && params.periods.length > 0) {
      const unique = [...new Set(params.periods)].slice(0, MAX_PERIODS);
      onQueryModeChange("periods");
      onPeriodsChange(unique);
      onPeriodChange(unique[unique.length - 1] || "");
      onStartDateChange(null);
      onEndDateChange(null);
      if (onQuickSelectQuery) {
        onQuickSelectQuery({ periods: unique });
      }
      return;
    }

    if (params.period) {
      onQueryModeChange("period");
      onPeriodChange(params.period);
      onPeriodsChange([]);
      onStartDateChange(null);
      onEndDateChange(null);
      if (onQuickSelectQuery) {
        onQuickSelectQuery({ period: params.period });
      }
      return;
    }

    if (params.startDate && params.endDate) {
      onQueryModeChange("dateRange");
      const start = dayjs(params.startDate);
      const end = dayjs(params.endDate);
      if (onBatchDateChange) {
        onBatchDateChange(start, end);
      } else {
        onStartDateChange(start);
        onEndDateChange(end);
      }
      onPeriodChange("");
      onPeriodsChange([]);
      if (onQuickSelectQuery) {
        onQuickSelectQuery({ startDate: params.startDate, endDate: params.endDate });
      }
    }
  };

  const handleAddPeriod = () => {
    if (!period) return;
    const normalized = period.trim();
    if (!/^\d{4}-\d{2}$/.test(normalized)) return;

    const next = [...new Set([...periods, normalized])].slice(0, MAX_PERIODS);
    onPeriodsChange(next);
  };

  const handleRemovePeriod = (target: string) => {
    const next = periods.filter((p) => p !== target);
    onPeriodsChange(next);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          查詢條件
        </Typography>

        {/* 日期範圍錯誤提示 */}
        {dateRangeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {dateRangeError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* 左側：查詢模式和日期選擇 */}
          <Stack spacing={2.5}>
            {/* 查詢模式切換 */}
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
              >
                查詢模式
              </Typography>
              <ToggleButtonGroup
                value={queryMode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode !== null) {
                    onQueryModeChange(newMode);
                    // 切換時清空其他選擇
                    if (newMode === "period") {
                      onPeriodsChange([]);
                      onStartDateChange(null);
                      onEndDateChange(null);
                    } else if (newMode === "periods") {
                      onStartDateChange(null);
                      onEndDateChange(null);
                    } else {
                      onPeriodChange("");
                      onPeriodsChange([]);
                    }
                  }
                }}
                aria-label="查詢模式"
                size="small"
                fullWidth
              >
                <ToggleButton value="period" aria-label="單一月份查詢">
                  單一月份
                </ToggleButton>
                <ToggleButton value="dateRange" aria-label="日期區間查詢">
                  日期區間
                </ToggleButton>
                <ToggleButton value="periods" aria-label="多月份比較">
                  多月份比較
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* 日期選擇器 */}
            {queryMode === "period" ? (
              <MonthPicker
                label="選擇月份"
                value={period}
                onChange={(value) => {
                  if (value !== null) {
                    onPeriodChange(value);
                  }
                }}
                fullWidth
              />
            ) : queryMode === "periods" ? (
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
                >
                  選擇月份（可新增多個月份並列比較，最多 12 個）
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box sx={{ flex: 1, minWidth: 240 }}>
                    <MonthPicker
                      label="選擇月份"
                      value={period}
                      onChange={(value) => {
                        if (value !== null) {
                          onPeriodChange(value);
                        }
                      }}
                      fullWidth
                    />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={handleAddPeriod}
                      disabled={!period || periods.length >= MAX_PERIODS}
                    >
                      加入月份
                    </Button>
                    <Button
                      variant="text"
                      startIcon={<ClearIcon />}
                      onClick={() => onPeriodsChange([])}
                      disabled={periods.length === 0}
                    >
                      清空
                    </Button>
                  </Stack>
                </Stack>

                {periods.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {periods.map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        onDelete={() => handleRemovePeriod(p)}
                      />
                    ))}
                    <Chip
                      label={`共 ${periods.length} 個月份`}
                      variant="outlined"
                      color={periods.length > MAX_PERIODS ? "error" : "default"}
                      sx={{ pointerEvents: "none" }}
                    />
                  </Stack>
                )}
              </Box>
            ) : (
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="zh-tw"
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 2,
                  }}
                >
                  <DatePicker
                    label="起始日期"
                    value={startDate}
                    onChange={(newValue) => onStartDateChange(newValue)}
                    format="YYYY-MM-DD"
                    maxDate={endDate || undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!dateRangeError,
                      },
                    }}
                  />
                  <DatePicker
                    label="結束日期"
                    value={endDate}
                    onChange={(newValue) => onEndDateChange(newValue)}
                    format="YYYY-MM-DD"
                    minDate={startDate || undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!dateRangeError,
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            )}
          </Stack>

          {/* 右側：快速選擇按鈕 */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
            >
              快速選擇
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip
                label="本月"
                onClick={() =>
                  handleQuickSelect({ period: dayjs().format("YYYY-MM") })
                }
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="上個月"
                onClick={() =>
                  handleQuickSelect({
                    period: dayjs().subtract(1, "month").format("YYYY-MM"),
                  })
                }
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="最近3個月"
                onClick={() =>
                  handleQuickSelect({
                    periods: [
                      dayjs().subtract(2, "month").format("YYYY-MM"),
                      dayjs().subtract(1, "month").format("YYYY-MM"),
                      dayjs().format("YYYY-MM"),
                    ],
                  })
                }
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本季3個月"
                onClick={() => {
                  const quarter = dayjs().quarter();
                  const months = [
                    dayjs().month((quarter - 1) * 3).format("YYYY-MM"),
                    dayjs().month((quarter - 1) * 3 + 1).format("YYYY-MM"),
                    dayjs().month((quarter - 1) * 3 + 2).format("YYYY-MM"),
                  ];
                  handleQuickSelect({ periods: months });
                }}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本週"
                onClick={() => {
                  const weekStart = dayjs().startOf("week");
                  const weekEnd = dayjs().endOf("week");
                  const today = dayjs();
                  const end = weekEnd.isAfter(today) ? today : weekEnd;
                  handleQuickSelect({
                    startDate: weekStart.format("YYYY-MM-DD"),
                    endDate: end.format("YYYY-MM-DD"),
                  });
                }}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本月（日期區間）"
                onClick={() => {
                  const monthStart = dayjs().startOf("month");
                  const monthEnd = dayjs().endOf("month");
                  const today = dayjs();
                  const end = monthEnd.isAfter(today) ? today : monthEnd;
                  handleQuickSelect({
                    startDate: monthStart.format("YYYY-MM-DD"),
                    endDate: end.format("YYYY-MM-DD"),
                  });
                }}
                clickable
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 操作按鈕 */}
        <CardActions sx={{ px: 0, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!hasData || loading || exporting}
            onClick={onExport}
          >
            {exporting ? "匯出中..." : "匯出 Excel"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading || exporting}
          >
            刷新
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onQuery}
            disabled={!canQuery || loading || exporting || !!dateRangeError}
          >
            查詢
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

