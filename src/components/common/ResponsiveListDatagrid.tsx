import React, { useMemo, cloneElement, isValidElement } from "react";
import { Box, Stack } from "@mui/material";
import {
  Datagrid,
  useListContext,
  RecordContextProvider,
  type DatagridProps,
  type RaRecord,
} from "react-admin";
import { useBreakpoint } from "@/hooks/useIsMobile";
import { ListCard } from "./ListCard";
import { EmptyPlaceholder } from "./EmptyPlaceholder";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import { useTheme } from "@mui/material";

/**
 * 渲染字段组件并提取值
 */
const renderFieldValue = (
  record: RaRecord,
  element: React.ReactElement
): React.ReactNode => {
  if (!record) return "-";

  // 对于 FunctionField，直接调用 render 函数
  const props = element.props as { render?: (record: RaRecord) => React.ReactNode };
  if (props?.render && typeof props.render === "function") {
    try {
      return props.render(record);
    } catch (e) {
      console.warn("Error rendering field:", e);
      return "-";
    }
  }

  // 对于其他字段，使用 RecordContextProvider 包装
  // 这样字段组件可以正确访问 record context
  return (
    <RecordContextProvider value={record}>
      {cloneElement(element)}
    </RecordContextProvider>
  );
};

interface ResponsiveListDatagridProps extends DatagridProps {
  maxHeight?: string;
  /**
   * true（預設）：僅手機 (< 600px) 顯示卡片，平板/桌面顯示表格
   * false：小螢幕 (< 900px) 含平板也顯示卡片
   */
  cardOnlyOnMobile?: boolean;
  /**
   * 平板 (600–900px) 布局，預設 'table' 與桌面一致
   * 'card'：平板也顯示卡片
   */
  tabletLayout?: "card" | "table";
}

/**
 * 響應式列表組件（三層：手機 / 平板 / 桌面）
 * - 手機 (< 600px)：卡片列表
 * - 平板 (600–1199px)：依 tabletLayout，預設「卡片」
 * - 桌面 (>= 1200px)：表格
 */
export const ResponsiveListDatagrid: React.FC<
  ResponsiveListDatagridProps
> = ({
  children,
  maxHeight = "500px",
  rowClick,
  cardOnlyOnMobile = true,
  // 平板預設也使用卡片布局，與目前 FilterBar 在平板的直立樣式一致
  tabletLayout = "card",
  ...rest
}) => {
  const breakpoint = useBreakpoint();
  const useCardLayout =
    breakpoint === "mobile" ||
    (breakpoint === "tablet" && (tabletLayout === "card" || !cardOnlyOnMobile));
  const { data, isLoading } = useListContext();
  const theme = useTheme();

  // 检测字段类型
  const detectFieldType = (element: React.ReactElement, label: string, source?: string): "currency" | "date" | "text" => {
    // 检查组件类型
    const componentType = element.type;
    if (componentType && typeof componentType === "function") {
      const componentName = (componentType as { displayName?: string; name?: string }).displayName || 
                            (componentType as { name?: string }).name || "";
      if (componentName.includes("NumberField") || componentName.includes("Currency")) {
        return "currency";
      }
      if (componentName.includes("DateField") || componentName.includes("Date")) {
        return "date";
      }
    }

    // 检查 props
    const props = element.props as { options?: { style?: string; currency?: string } };
    if (props?.options?.style === "currency" || props?.options?.currency) {
      return "currency";
    }

    // 检查 label 和 source
    const lowerLabel = label.toLowerCase();
    const lowerSource = source?.toLowerCase() || "";

    if (
      lowerLabel.includes("金額") ||
      lowerLabel.includes("金额") ||
      lowerLabel.includes("amount") ||
      lowerLabel.includes("price") ||
      lowerLabel.includes("total") ||
      lowerLabel.includes("paid") ||
      lowerLabel.includes("balance") ||
      lowerSource.includes("amount") ||
      lowerSource.includes("price") ||
      lowerSource.includes("total")
    ) {
      return "currency";
    }

    if (
      lowerLabel.includes("日期") ||
      lowerLabel.includes("date") ||
      lowerLabel.includes("時間") ||
      lowerLabel.includes("时间") ||
      lowerSource.includes("date") ||
      lowerSource.includes("time")
    ) {
      return "date";
    }

    return "text";
  };

  // 提取字段信息
  const fieldConfigs = useMemo(() => {
    if (!children) return [];

    return React.Children.toArray(children)
      .filter(isValidElement)
      .map((child) => {
        const element = child as React.ReactElement;
        const props = element.props as { source?: string; label?: string; className?: string };
        const source = props?.source;
        const label = props?.label || source || "";
        const className = props?.className || "";
        const isAction =
          className.includes("column-action") || source === "action";
        const isDetail = label === "明細" || label === "明细";
        const fieldType = detectFieldType(element, label, source);

        return {
          element,
          source,
          label,
          isAction,
          isDetail,
          fieldType,
        };
      });
  }, [children]);

  // 行動端／小螢幕：渲染卡片列表
  if (useCardLayout) {
    if (isLoading && (!data || data.length === 0)) {
      return <LoadingPlaceholder />;
    }

    if (!data || data.length === 0) {
      return <EmptyPlaceholder />;
    }

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          height: maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          px: { xs: 0, sm: 0 },
          boxSizing: "border-box",
          position: "relative",
          ...getScrollbarStyles(theme),
        }}
      >
        <Stack 
          spacing={0}
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            px: 0,
            mx: 0,
          }}
        >
          {data.map((record: RaRecord) => (
            <RecordContextProvider key={record.id} value={record}>
              <ListCard
                fields={fieldConfigs.map((config) => ({
                  label: config.label,
                  value: renderFieldValue(record, config.element),
                  source: config.source,
                  isAction: config.isAction,
                  isDetail: config.isDetail,
                  fieldType: config.fieldType,
                }))}
                onClick={
                  rowClick
                    ? () => {
                        if (typeof rowClick === "function") {
                          rowClick(record.id, rest.resource || "", record);
                        } else if (rowClick === "edit" || rowClick === "show") {
                          window.location.href = `#/${rest.resource || ""}/${record.id}`;
                        }
                      }
                    : undefined
                }
              />
            </RecordContextProvider>
          ))}
        </Stack>
      </Box>
    );
  }

  // 桌面端：使用原有的表格样式（通过 StyledListDatagrid 处理）
  // 这里直接返回 Datagrid，让 StyledListDatagrid 处理样式
  return (
    <Box
      sx={{
        width: "100%",
        height: maxHeight,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        position: "relative",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {isLoading && (!data || data.length === 0) ? (
        <LoadingPlaceholder />
      ) : (
        <Datagrid
          empty={<EmptyPlaceholder />}
          bulkActionButtons={false}
          size="small"
          rowClick={rowClick}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: "100%",
            borderRadius: 12,
            position: "relative",
            maxWidth: "100%",
            "& .RaDatagrid-list": {
              flex: 1,
              display: "flex",
              flexDirection: "column",
            },
            "& .RaDatagrid-table": {
              tableLayout: "fixed",
              width: "100%",
              minWidth: "100%",
              borderCollapse: "collapse",
              minHeight: "auto",
            },
            backgroundColor: theme.palette.background.paper,
            overflowX: "auto",
            overflowY: "auto",
            "& thead": {
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: theme.palette.background.paper,
            },
            "& .MuiTableCell-head": {
              padding: "4px 8px",
              height: 32,
              fontSize: "0.8rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            },
            "& .RaDatagrid-row": {
              height: "45px",
            },
            "& .MuiTableCell-body": {
              padding: "0 8px !important",
              height: "42px",
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              verticalAlign: "middle",
            },
            "& .column-action": {
              width: "150px",
              maxWidth: "150px",
            },
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
            },
          }}
          {...rest}
        >
          {children}
        </Datagrid>
      )}
    </Box>
  );
};

ResponsiveListDatagrid.displayName = "ResponsiveListDatagrid";
