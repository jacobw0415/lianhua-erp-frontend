import { useEffect } from "react";
import { useTheme, Box } from "@mui/material";
import {
  List,
  TextField,
  DateField,
  FunctionField,
  type RaRecord
} from "react-admin";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

/**
 * 通知中心列表 - 純資訊顯示 (優化狀態欄對齊)
 */
export const NotificationList = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <List
      title="通知中心"
      actions={false}
      empty={false}
      sort={{ field: "createdAt", order: "DESC" }}
      pagination={<CustomPaginationBar showPerPage={true} />}
      perPage={10}
    >
      <StyledListWrapper
       disableCreate
        quickFilters={[
          { type: "text", source: "title", label: "搜尋主旨" },
          { type: "text", source: "content", label: "搜尋內容" },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "read",
            label: "讀取狀態",
            choices: [
              { id: false, name: "未讀訊息" },
              { id: true, name: "已讀訊息" },
            ],
          },
        ]}
      >
        <StyledListDatagrid>
          <TextField source="targetType" label="類別" />
          <TextField source="title" label="主旨" />
          <TextField source="content" label="內容摘要" />

          <DateField
            source="createdAt"
            label="時間"
            showTime
            options={{ hour12: false }}
          />
          
          <FunctionField
            label="狀態"
            render={(record: RaRecord) => {
              const row = record as any;
              const isRead = row.read;

              // 定義固定的高亮綠色 (即使在深色模式也清晰可見)
              const activeGreen = "#00DD00";  

              return (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start", // 核心：向前 (左) 切齊
                    alignItems: "center",
                    width: "100%",
                    paddingLeft: "8px", // 稍微留白不貼死邊框
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "70px", // 固定寬度防止抖動
                      height: "26px",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: isRead ? "normal" : "bold",

                      // 1. 顏色處理：未讀時強制使用高亮綠
                      color: isRead ? theme.palette.text.secondary : activeGreen,

                      // 2. 背景與外框處理
                      backgroundColor: isRead
                        ? theme.palette.action.selected
                        : "rgba(0, 230, 118, 0.08)", // 螢光綠的極淡背景

                      border: isRead
                        ? `1px solid ${theme.palette.divider}`
                        : `1px solid ${activeGreen}`, // 未讀時外框呈現燈號感

                      transition: "all 0.2s",
                    }}
                  >
                    {/* 3. 圓點燈號 */}
                    {!isRead && (
                      <Box
                        component="span"
                        sx={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: activeGreen, // 固定螢光綠
                          marginRight: "6px",
                          boxShadow: `0 0 4px ${activeGreen}`, // 圓點發光
                        }}
                      />
                    )}
                    {isRead ? "已讀" : "未讀"}
                  </Box>
                </Box>
              );
            }}
          />
        </StyledListDatagrid>
      </StyledListWrapper>
    </List>
  );
};