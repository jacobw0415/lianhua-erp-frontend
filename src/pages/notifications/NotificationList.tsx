import { useEffect, useState } from "react";
import { useTheme, Box, IconButton } from "@mui/material";
import {
  List,
  TextField,
  DateField,
  FunctionField,
  type RaRecord,
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import {
  NotificationDetailDrawer,
  type NotificationDetail,
} from "./NotificationDetailDrawer";

/**
 * 通知中心列表 - 純資訊顯示 + 詳細 Drawer
 */
export const NotificationList = () => {
  const theme = useTheme();
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDetail | null>(null);

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const openDetails = (record: RaRecord) => {
    const row = record as any;
    setSelectedNotification({
      id: row.id,
      title: row.title ?? "",
      content: row.content ?? "",
      targetType: row.targetType ?? "",
      targetId: row.targetId,
      createdAt: row.createdAt ?? "",
      read: Boolean(row.read),
    });
    setOpenDetailDrawer(true);
  };

  return (
    <>
      <List
        title="通知中心"
        actions={false}
        empty={false}
        // 🚀 修正 1：設定預設排序為跨表路徑 (需配合 DataProvider 白名單)
        sort={{ field: "notification.createdAt", order: "DESC" }}
        pagination={<CustomPaginationBar showPerPage={true} />}
        perPage={10}
      >
        <StyledListWrapper disableCreate disableButton>
          <ResponsiveListDatagrid tabletLayout="card">
            <TextField source="targetType" label="類別" />
            <TextField source="title" label="主旨" sortable={false} />

            {/* 🚀 修正 2：內容摘要不可排序，避免觸發 No property 'content' 錯誤 */}
            <TextField source="content" label="內容摘要" sortable={false} />

            <DateField
              source="createdAt"
              // 🚀 修正 3：強制設定排序時使用的路徑為跨表路徑
              sortBy="notification.createdAt"
              label="時間"
              showTime
              options={{ hour12: false }}
            />

            <FunctionField
              label="詳情"
              render={(record: RaRecord) => (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetails(record);
                  }}
                  title="查看完整內容"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            <FunctionField
              label="狀態"
              // 🚀 修正 4：狀態建議也關閉排序，除非後端有實作 read 的排序邏輯
              sortable={false}
              render={(record: RaRecord) => {
                const row = record as any;
                const isRead = row.read;
                const activeGreen = "#00DD00";

                return (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                      paddingLeft: "8px",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "70px",
                        height: "26px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: isRead ? "normal" : "bold",
                        color: isRead ? theme.palette.text.secondary : activeGreen,
                        backgroundColor: isRead
                          ? theme.palette.action.selected
                          : "rgba(0, 230, 118, 0.08)",
                        border: isRead
                          ? `1px solid ${theme.palette.divider}`
                          : `1px solid ${activeGreen}`,
                        transition: "all 0.2s",
                      }}
                    >
                      {!isRead && (
                        <Box
                          component="span"
                          sx={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: activeGreen,
                            marginRight: "6px",
                            boxShadow: `0 0 4px ${activeGreen}`,
                          }}
                        />
                      )}
                      {isRead ? "已讀" : "未讀"}
                    </Box>
                  </Box>
                );
              }}
            />
          </ResponsiveListDatagrid>
        </StyledListWrapper>
      </List>

      <NotificationDetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        notification={selectedNotification ?? undefined}
      />
    </>
  );
};