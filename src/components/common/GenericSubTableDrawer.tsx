import React from "react";
import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ListContextProvider,
  type ListControllerResult,
} from "react-admin";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ColumnConfig {
  source: string;
  label: string;
  type: "text" | "currency" | "date";
}

interface GenericSubTableDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  rows: Record<string, unknown>[];
  columns: ColumnConfig[];
  showTotal?: boolean;              // 是否顯示合計
  totalField?: string;             // 合計使用的欄位
}

export const GenericSubTableDrawer: React.FC<GenericSubTableDrawerProps> = ({
  open,
  onClose,
  title,
  rows,
  columns,
  showTotal = false,
  totalField = "amount",
}) => {

  const enableScroll = rows.length > 2;
  const maxHeight = enableScroll ? "150px" : "auto";

  const totalAmount = showTotal
    ? rows.reduce((sum, r) => sum + (Number(r[totalField]) || 0), 0)
    : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listContext: Partial<ListControllerResult<any>> = {
    data: rows,
    total: rows.length,
    isLoading: false,
    resource: "generic-subtable",
    sort: { field: "id", order: "ASC" as const },
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "48vw",
          maxWidth: "620px",
          bgcolor: "background.paper",
          p: 0,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ⭐ 標題列 */}
      <Box
        sx={(theme) => ({
          p: 2,
          position: "sticky",
          top: 0,
          bgcolor: theme.palette.background.paper,
          zIndex: 10,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        })}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* ⭐ 合計（可選） */}
      {showTotal && (
        <Box
          sx={(theme) => ({
            px: 2,
            py: 1.5,
            position: "sticky",
            top: 64,
            bgcolor: theme.palette.background.paper,
            zIndex: 9,
            borderBottom: `1px solid ${theme.palette.divider}`,
            textAlign: "right",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "green" }}>
            合計：NT${totalAmount?.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* ⭐ 子表內容 */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: theme.palette.background.default,
            p: 2,
            transition: "background-color 0.2s ease, border-color 0.2s ease",
          })}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              mb: 1,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📄 明細資料
          </Typography>

          {rows.length === 0 ? (
            <Box
              sx={(theme) => ({
                width: "100%",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.text.disabled,
                fontSize: "0.9rem",
              })}
            >
              尚無資料
            </Box>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ListContextProvider value={listContext as ListControllerResult<any>}>
              {/* Layer 2：滾動專用容器 */}
               <Box
                sx={(theme) => ({
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  maxHeight,
                  overflowY: enableScroll ? "auto" : "visible",

                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c1c1c1",
                    borderRadius: "4px",
                  },
                })}
              >
                {/* Layer 3：Datagrid（圓角避免缺角） */}
                <Datagrid
                  bulkActionButtons={false}
                  rowClick={false}
                  sx={{
                    /* ⭐ 設定 scroll container 在 Datagrid 內建 wrapper */
                    "& .RaDatagrid-tableWrapper": {
                      maxHeight: maxHeight,
                    },

                    /* ⭐ 固定表頭（這次會生效） */
                    "& th": {
                      top: 0,
                      zIndex: 5,
                      backgroundColor: "background.paper",
                      textAlign: "left",
                      fontWeight: 600,
                      padding: "8px 6px",
                    },

                    "& td": {
                      textAlign: "left",
                      padding: "8px 6px",
                    },

                    "& .RaDatagrid-row": {
                      width: "100%",
                    },

                    "& .RaDatagrid-headerRow": {
                      position: "sticky",
                      width: "100%",
                    },
                  }}
                >
                  {columns.map((col) => {
                    if (col.type === "currency")
                      return (
                        <NumberField
                          key={col.source}
                          source={col.source}
                          label={col.label}
                          options={{
                            style: "currency",
                            currency: "TWD",
                            minimumFractionDigits: 0,
                          }}
                        />
                      );

                    if (col.type === "date")
                      return (
                        <DateField
                          key={col.source}
                          source={col.source}
                          label={col.label}
                        />
                      );

                    return (
                      <TextField
                        key={col.source}
                        source={col.source}
                        label={col.label}
                      />
                    );
                  })}
                </Datagrid>
              </Box>
            </ListContextProvider>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
