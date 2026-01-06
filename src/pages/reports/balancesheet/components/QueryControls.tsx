import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CardActions,
  Divider,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import type { BalanceSheetQueryParams } from "@/hooks/useBalanceSheetReport";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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

interface QueryControlsProps {
  queryType: "month" | "date";
  onQueryTypeChange: (type: "month" | "date") => void;
  period: string;
  onPeriodChange: (period: string) => void;
  periods: string[];
  onPeriodsChange: (periods: string[]) => void;
  endDate: Dayjs | null;
  onEndDateChange: (date: Dayjs | null) => void;
  onQuery: () => void;
  onQuickSelect: (params: BalanceSheetQueryParams) => void;
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
  exporting?: boolean;
  hasData: boolean;
  canQuery?: boolean;
}

export const QueryControls = ({
  queryType,
  onQueryTypeChange,
  period,
  onPeriodChange,
  periods,
  onPeriodsChange,
  endDate,
  onEndDateChange,
  onQuery,
  onQuickSelect,
  onRefresh,
  onExport,
  loading,
  exporting = false,
  hasData,
  canQuery = false,
}: QueryControlsProps) => {
  // 計算截至日期顯示文字
  const getDisplayDate = (): string => {
    if (queryType === "month" && period) {
      const periodDate = dayjs(period);
      if (periodDate.isValid()) {
        return periodDate.endOf("month").format("YYYY 年 MM 月 DD 日");
      }
    } else if (queryType === "date" && endDate) {
      return endDate.format("YYYY 年 MM 月 DD 日");
    }
    return "";
  };

  const displayDate = getDisplayDate();
  const MAX_PERIODS = 12;

  // 快速選擇處理
  const handleQuickSelect = (params: BalanceSheetQueryParams) => {
    if (params.periods && params.periods.length > 0) {
      const unique = [...new Set(params.periods)].slice(0, MAX_PERIODS);
      onQueryTypeChange("month");
      onPeriodsChange(unique);
      onPeriodChange(unique[unique.length - 1]);
      onEndDateChange(null);
      onQuickSelect({ periods: unique });
      return;
    }

    if (params.period) {
      onQueryTypeChange("month");
      onPeriodChange(params.period);
      onPeriodsChange([]);
      onEndDateChange(null);
      onQuickSelect({ period: params.period });
      return;
    }

    if (params.endDate) {
      onQueryTypeChange("date");
      const date = dayjs(params.endDate);
      onEndDateChange(date);
      onPeriodChange("");
      onPeriodsChange([]);
      onQuickSelect({ endDate: params.endDate });
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            查詢條件
          </Typography>
          {displayDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                截至 {displayDate}
              </Typography>
              <Tooltip
                title="資產負債表為時點報表，顯示截至所選時間點的財務狀態"
                arrow
              >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", cursor: "help" }} />
              </Tooltip>
            </Box>
          )}
        </Box>

        <Stack spacing={2.5}>
          {/* 查詢類型切換 */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
            >
              查詢類型
            </Typography>
            <ToggleButtonGroup
              value={queryType}
              exclusive
              onChange={(_, newType) => {
                if (newType !== null) {
                  onQueryTypeChange(newType);
                  // 切換時清空另一個選擇
                  if (newType === "month") {
                    onEndDateChange(null);
                  } else {
                    onPeriodChange("");
                    onPeriodsChange([]);
                  }
                }
              }}
              aria-label="查詢類型"
              size="small"
              fullWidth
            >
              <ToggleButton value="month" aria-label="月份查詢">
                月份查詢
              </ToggleButton>
              <ToggleButton value="date" aria-label="日期查詢">
                日期查詢
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 快速選擇按鈕 */}
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
                onClick={() => handleQuickSelect({ period: dayjs().format("YYYY-MM") })}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="上個月"
                onClick={() => handleQuickSelect({ period: dayjs().subtract(1, "month").format("YYYY-MM") })}
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
                label="本年12個月"
                onClick={() =>
                  handleQuickSelect({
                    periods: Array.from({ length: 12 }, (_, i) => dayjs().month(i).format("YYYY-MM")),
                  })
                }
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本季末"
                onClick={() => handleQuickSelect({ endDate: dayjs().endOf("quarter").format("YYYY-MM-DD") })}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="本年末"
                onClick={() => handleQuickSelect({ endDate: dayjs().endOf("year").format("YYYY-MM-DD") })}
                clickable
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>

          {/* 日期選擇器 */}
          {queryType === "month" ? (
            <Box sx={{ maxWidth: 560 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
              >
                選擇月份（可新增多個月份並列比較，最多 12 個）
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                  <MonthPicker
                    label="選擇月份（截至該月底）"
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
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {periods.map((p) => (
                    <Chip key={p} label={p} onDelete={() => handleRemovePeriod(p)} />
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
            <Box sx={{ maxWidth: 300 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
              >
                選擇日期
              </Typography>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="zh-tw"
              >
                <DatePicker
                  label="選擇日期（截至該日）"
                  value={endDate}
                  onChange={(newValue) => onEndDateChange(newValue)}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          )}
        </Stack>

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
            disabled={!canQuery || loading || exporting}
          >
            查詢
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};
