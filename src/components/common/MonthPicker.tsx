import { memo, useCallback, useEffect, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useTheme } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import { applyMuiPickersScrollbarStyles } from "@/utils/scrollbarStyles";

interface MonthPickerProps {
  label?: string;
  value: string | null; // YYYY-MM 格式
  onChange: (value: string | null) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  disabled?: boolean;
  format?: string;
  error?: boolean;
  helperText?: string;
}

/**
 * 月份選擇器組件
 * 
 * 功能特點：
 * - 統一的滾動條樣式（與現金流量表一致）
 * - 支持深色/淺色主題
 * - 優化的性能和可訪問性
 */
export const MonthPicker = memo(({
  label = "選擇月份",
  value,
  onChange,
  fullWidth = true,
  size = "medium",
  disabled = false,
  format = "YYYY年MM月",
  error = false,
  helperText,
}: MonthPickerProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 將字符串值轉換為 dayjs 對象
  const dateValue = useMemo(() => {
    if (!value || !value.trim()) {
      return null;
    }
    // 驗證月份格式 (YYYY-MM)
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(value)) {
      console.warn(`MonthPicker: 無效的月份格式 "${value}"，應為 YYYY-MM 格式`);
      return null;
    }
    const date = dayjs(value);
    // 驗證日期是否有效
    if (!date.isValid()) {
      console.warn(`MonthPicker: 無效的日期值 "${value}"`);
      return null;
    }
    // 驗證月份是否在有效範圍內
    const [year, month] = value.split("-").map(Number);
    if (year < 1900 || year > 2100 || month < 1 || month > 12) {
      console.warn(`MonthPicker: 月份超出有效範圍 "${value}"`);
      return null;
    }
    return date;
  }, [value]);

  // 處理日期變更
  const handleChange = useCallback((newValue: Dayjs | null) => {
    if (newValue) {
      onChange(newValue.format("YYYY-MM"));
    } else {
      onChange(null);
    }
  }, [onChange]);

  // 為日期選擇器彈窗應用統一的 scrollbar 樣式（與現金流量表一致）
  useEffect(() => {
    const cleanup = applyMuiPickersScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 為月份選擇視圖移除"月"字（優化版：使用全局單例避免重複監聽）
  useEffect(() => {
    // 全局單例：確保只有一個 observer 和 interval
    const GLOBAL_KEY = "__monthPickerObserver__";

    // 如果已經存在全局 observer，只註冊清理函數
    if ((window as any)[GLOBAL_KEY]) {
      return () => {
        // 不清理，因為其他組件可能還在使用
      };
    }

    const removeMonthChar = () => {
      // 使用多種選擇器來確保找到所有月份按鈕
      const selectors = [
        ".MuiPickersPopper-root .MuiMonthCalendar-root button",
        ".MuiPickersPopper-root .MuiPickersMonth-root button",
        "[role='dialog'] .MuiMonthCalendar-root button",
        "[role='dialog'] .MuiPickersMonth-root button",
      ];

      selectors.forEach((selector) => {
        try {
          const buttons = document.querySelectorAll(selector);
          buttons.forEach((button) => {
            // 檢查並替換按鈕文本內容
            if (button.textContent && button.textContent.includes("月")) {
              const originalText = button.textContent;
              const newText = originalText.replace(/月/g, "");
              if (originalText !== newText) {
                button.textContent = newText;
              }
            }

            // 檢查並替換按鈕的所有子節點文本
            button.childNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes("月")) {
                node.textContent = node.textContent.replace(/月/g, "");
              }
            });

            // 也檢查 aria-label
            const ariaLabel = button.getAttribute("aria-label");
            if (ariaLabel && ariaLabel.includes("月")) {
              button.setAttribute("aria-label", ariaLabel.replace(/月/g, ""));
            }
          });
        } catch (e) {
          // 忽略選擇器錯誤
        }
      });
    };

    // 使用 MutationObserver 來監聽 DOM 變化（優化：只監聽 popper 相關變化）
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        const target = mutation.target as Element;
        // 只處理與 picker 相關的變化
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData" ||
          target.closest?.(".MuiPickersPopper-root") ||
          target.classList?.contains("MuiPickersPopper-root")
        ) {
          shouldCheck = true;
        }
      });
      if (shouldCheck) {
        // 使用 requestAnimationFrame 確保在 DOM 更新後執行
        requestAnimationFrame(() => {
          removeMonthChar();
        });
      }
    });

    // 開始觀察整個文檔（但通過過濾器優化性能）
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });

    // 立即執行一次
    removeMonthChar();

    // 使用定時器作為備用方案，頻率適中
    const interval = setInterval(() => {
      requestAnimationFrame(removeMonthChar);
    }, 200); // 降低頻率以提升性能

    // 保存到全局
    (window as any)[GLOBAL_KEY] = { observer, interval };

    return () => {
      // 不立即清理，因為可能有多個組件使用
      // 可以考慮使用引用計數，但為了簡化，這裡保持全局單例
    };
  }, []);

  // 統一的樣式配置
  const slotProps = useMemo(() => ({
    openPickerIcon: {
      sx: {
        color: isDark ? "#fff" : "#444",
        transition: "color 0.2s ease-in-out",
      },
    },
    textField: {
      fullWidth,
      size,
      error,
      helperText,
      sx: {
        "& .MuiInputBase-root": {
          ...(size === "small" && { height: 40 }),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#66BB6A" : "#4CAF50",
            },
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          transition: "border-color 0.2s ease-in-out",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#4CAF50 !important",
          borderWidth: "2px",
        },
      },
    },
    popper: {
      placement: "bottom-start" as const,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ],
      sx: {
        "& .MuiPaper-root": {
          borderRadius: 2,
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.4)"
            : "0 8px 32px rgba(0, 0, 0, 0.15)",
          transition: "box-shadow 0.3s ease-in-out",
        },
      },
    },
    calendarHeader: {
      sx: {
        "& .MuiPickersCalendarHeader-label": {
          fontWeight: 600,
          fontSize: "1rem",
          color: isDark ? "#fff" : "#333",
        },
        "& .MuiIconButton-root": {
          color: isDark ? "#fff" : "#444",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.04)",
            transform: "scale(1.05)",
          },
        },
      },
    },
  }), [isDark, fullWidth, size, error, helperText]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <DatePicker
        views={["year", "month"]}
        label={label}
        format={format}
        value={dateValue}
        onChange={handleChange}
        disabled={disabled}
        slots={{ openPickerIcon: CalendarMonthIcon }}
        slotProps={slotProps}
      />
    </LocalizationProvider>
  );
});

MonthPicker.displayName = "MonthPicker";

