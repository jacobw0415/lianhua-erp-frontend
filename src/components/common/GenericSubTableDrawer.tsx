import React from "react";
import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ListContextProvider,
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
  rows: any[];
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

  const listContext: any = {
    data: rows,
    total: rows.length,
    isLoading: false,
    resource: "generic-subtable",
    sort: { field: "id", order: "ASC" },
    currentSort: { field: "id", order: "ASC" },
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
        sx={{
          p: 2,
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 10,
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
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
          sx={{
            px: 2,
            py: 1.5,
            position: "sticky",
            top: 64,
            bgcolor: "background.paper",
            zIndex: 9,
            borderBottom: "1px solid #eee",
            textAlign: "right",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "green" }}>
            合計：NT${totalAmount?.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* ⭐ 子表內容 */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {/* Layer 1：外層統一框線 */}
        <Box
          sx={{
            border: "1px solid #eee",
            borderRadius: 2,
            bgcolor: "background.default",
            p: 1.5,
          }}
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
              sx={{
                width: "100%",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "0.9rem",
              }}
            >
              尚無資料
            </Box>
          ) : (
            <ListContextProvider value={listContext}>
              {/* Layer 2：滾動專用容器 */}
              <Box
                sx={{
                  border: "1px solid #eee",
                  borderRadius: 1,
                  maxHeight: maxHeight,
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
                }}
              >
                {/* Layer 3：Datagrid（圓角避免缺角） */}
                <Datagrid
                  bulkActionButtons={false}
                  rowClick={false}
                  sx={{
                    "& .RaDatagrid-table": {
                      tableLayout: "fixed",
                      borderRadius: "8px",
                      overflow: "hidden",
                    },

                    "& .RaDatagrid-thead": {
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      bgcolor: "background.paper",
                    },

                    "& th, & td": {
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      padding: "8px 6px",
                      fontSize: "0.85rem",
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
