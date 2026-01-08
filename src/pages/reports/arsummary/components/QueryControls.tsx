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
// 引入我們之前建立的 Hook 型別
import type { ARSummaryQueryParams } from "@/hooks/useARSummaryReport";
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

interface ARSummaryQueryControlsProps {
  queryMode: "period" | "periods" | "specificDate";
  onQueryModeChange: (mode: "period" | "periods" | "specificDate") => void;
  
  // 單一月份模式
  period: string;
  onPeriodChange: (period: string) => void;
  
  // 多月份模式
  periods: string[];
  onPeriodsChange: (periods: string[]) => void;
  
  // 指定截止日模式 (AR 報表只需要截止日，不需要起始日)
  endDate: Dayjs | null;
  onEndDateChange: (date: Dayjs | null) => void;
  
  onQuery: () => void;
  onQuickSelectQuery?: (params: ARSummaryQueryParams) => void;
  onRefresh: () => void;
  onExport: () => void; // 若後端有提供 Excel 匯出功能
  
  loading: boolean;
  exporting?: boolean;
  hasData: boolean;
  canQuery?: boolean;
  error?: string | null;
}

export const ARSummaryQueryControls = ({
  queryMode,
  onQueryModeChange,
  period,
  onPeriodChange,
  periods,
  onPeriodsChange,
  endDate,
  onEndDateChange,
  onQuery,
  onQuickSelectQuery,
  onRefresh,
  onExport,
  loading,
  exporting = false,
  hasData,
  canQuery = false,
  error,
}: ARSummaryQueryControlsProps) => {
  const MAX_PERIODS = 12;

  // 快速選擇處理
  const handleQuickSelect = (params: ARSummaryQueryParams) => {
    // 1. 多月份趨勢
    if (params.periods && params.periods.length > 0) {
      const unique = [...new Set(params.periods)].slice(0, MAX_PERIODS);
      onQueryModeChange("periods");
      onPeriodsChange(unique);
      onPeriodChange(unique[unique.length - 1] || "");
      onEndDateChange(null);
      if (onQuickSelectQuery) {
        onQuickSelectQuery({ periods: unique });
      }
      return;
    }

    // 2. 指定截止日 (As Of Date)
    if (params.endDate) {
      onQueryModeChange("specificDate");
      onEndDateChange(dayjs(params.endDate));
      onPeriodChange(dayjs(params.endDate).format("YYYY-MM")); // 同步更新月份供參考
      onPeriodsChange([]);
      if (onQuickSelectQuery) {
        onQuickSelectQuery({ 
            period: dayjs(params.endDate).format("YYYY-MM"),
            endDate: params.endDate 
        });
      }
      return;
    }

    // 3. 單一月份 (As Of Month End)
    if (params.period) {
      onQueryModeChange("period");
      onPeriodChange(params.period);
      onPeriodsChange([]);
      onEndDateChange(null);
      if (onQuickSelectQuery) {
        onQuickSelectQuery({ period: params.period });
      }
      return;
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
          應收帳款查詢條件
        </Typography>

        {/* 錯誤提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
                    // 切換時清空互斥的條件
                    if (newMode === "period") {
                      onPeriodsChange([]);
                      onEndDateChange(null);
                    } else if (newMode === "periods") {
                      onEndDateChange(null);
                    } else {
                      // specificDate
                      onPeriodsChange([]);
                      // 預設帶入今天
                      if (!endDate) onEndDateChange(dayjs());
                    }
                  }
                }}
                aria-label="查詢模式"
                size="small"
                fullWidth
              >
                <ToggleButton value="period">
                  單一月份 (月底餘額)
                </ToggleButton>
                <ToggleButton value="specificDate">
                  指定截止日
                </ToggleButton>
                <ToggleButton value="periods">
                  多月趨勢比較
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* 根據模式顯示不同的輸入框 */}
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
                  選擇月份（可加入多個月份比較餘額變化）
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
                      加入
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
              // specificDate 模式
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="zh-tw"
              >
                <Box>
                   <Typography
                    variant="body2"
                    sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
                  >
                    查詢截止該日期的應收餘額
                  </Typography>
                  <DatePicker
                    label="截止日期"
                    value={endDate}
                    onChange={(newValue) => onEndDateChange(newValue)}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "例如：查詢截至今日尚未付款的訂單總額"
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
                label="截至今日"
                onClick={() =>
                  handleQuickSelect({ 
                    period: dayjs().format("YYYY-MM"),
                    endDate: dayjs().format("YYYY-MM-DD") 
                  })
                }
                clickable
                variant="outlined"
                size="small"
                color="primary"
              />
               <Chip
                label="本月底 (預估)"
                onClick={() =>
                  handleQuickSelect({ period: dayjs().format("YYYY-MM") })
                }
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="上個月底"
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
                label="近3個月趨勢"
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
                label="今年每季末"
                onClick={() => {
                  const year = dayjs().year();
                  handleQuickSelect({
                      periods: [
                          `${year}-03`,
                          `${year}-06`,
                          `${year}-09`,
                          `${year}-12`
                      ]
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
            {exporting ? "匯出中..." : "匯出報表"}
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
            disabled={!canQuery || loading || exporting}
          >
            查詢
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};