import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  CardActions,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Alert,
} from "@mui/material";
import type { CashFlowQueryParams } from "@/hooks/useCashFlowReport";
import {
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import { MonthPicker } from "@/components/common/MonthPicker";

dayjs.extend(quarterOfYear);

interface QueryControlsProps {
  queryMode: "period" | "dateRange";
  onQueryModeChange: (mode: "period" | "dateRange") => void;
  period: string;
  onPeriodChange: (period: string) => void;
  startDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  onEndDateChange: (date: Dayjs | null) => void;
  onBatchDateChange?: (start: Dayjs | null, end: Dayjs | null) => void;
  onQuery: () => void;
  onQuickSelectQuery?: (params: CashFlowQueryParams) => void;
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
  // 快速選擇按鈕（選擇後自動觸發查詢）
  const handleQuickSelect = (range: "week" | "month" | "lastMonth" | "quarter" | "year") => {
    onQueryModeChange("dateRange");

    let selectedStart: Dayjs;
    let selectedEnd: Dayjs;

    switch (range) {
      case "week": {
        selectedStart = dayjs().startOf("week");
        // 本週結束日期：取本週最後一天和今天中的較小值（避免查詢未來日期）
        const weekEnd = dayjs().endOf("week");
        const today = dayjs();
        selectedEnd = weekEnd.isAfter(today) ? today : weekEnd;
        break;
      }
      case "month": {
        selectedStart = dayjs().startOf("month");
        // 本月結束日期：取本月最後一天和今天中的較小值（避免查詢未來日期）
        const monthEnd = dayjs().endOf("month");
        const today = dayjs();
        selectedEnd = monthEnd.isAfter(today) ? today : monthEnd;
        break;
      }
      case "lastMonth": {
        selectedStart = dayjs().subtract(1, "month").startOf("month");
        selectedEnd = dayjs().subtract(1, "month").endOf("month");
        break;
      }
      case "quarter": {
        selectedStart = dayjs().startOf("quarter");
        // 本季結束日期：取本季最後一天和今天中的較小值（避免查詢未來日期）
        const quarterEnd = dayjs().endOf("quarter");
        const today = dayjs();
        selectedEnd = quarterEnd.isAfter(today) ? today : quarterEnd;
        break;
      }
      case "year": {
        selectedStart = dayjs().startOf("year");
        // 本年結束日期：取本年最後一天和今天中的較小值（避免查詢未來日期）
        const yearEnd = dayjs().endOf("year");
        const today = dayjs();
        selectedEnd = yearEnd.isAfter(today) ? today : yearEnd;
        break;
      }
    }

    // 使用批次更新避免中間狀態的驗證錯誤
    if (onBatchDateChange) {
      onBatchDateChange(selectedStart, selectedEnd);
    } else {
      // 如果沒有提供批次更新函數，則分別更新（可能會有瞬間錯誤）
      onStartDateChange(selectedStart);
      onEndDateChange(selectedEnd);
    }

    // 快速選擇後立即觸發查詢（使用直接參數，避免狀態更新延遲問題）
    if (onQuickSelectQuery) {
      onQuickSelectQuery({
        startDate: selectedStart.format("YYYY-MM-DD"),
        endDate: selectedEnd.format("YYYY-MM-DD"),
      });
    } else {
      // 如果沒有提供快速查詢回調，延遲觸發普通查詢
      setTimeout(() => {
        onQuery();
      }, 100);
    }
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
                  }
                }}
                aria-label="查詢模式"
                size="small"
                fullWidth
              >
                <ToggleButton value="period" aria-label="月份查詢">
                  月份查詢
                </ToggleButton>
                <ToggleButton value="dateRange" aria-label="日期區間查詢">
                  日期區間查詢
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* 日期選擇器 */}
            {queryMode === "period" ? (
              <MonthPicker
                label="選擇月份"
                value={period}
                onChange={(value) => {
                  // 只有當 value 不為 null 時才更新，避免清空選擇時意外重置為當前月份
                  if (value !== null) {
                    onPeriodChange(value);
                  }
                }}
                fullWidth
              />
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
                label="本週"
                onClick={() => handleQuickSelect("week")}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本月"
                onClick={() => handleQuickSelect("month")}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="上個月"
                onClick={() => handleQuickSelect("lastMonth")}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本季"
                onClick={() => handleQuickSelect("quarter")}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本年"
                onClick={() => handleQuickSelect("year")}
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

