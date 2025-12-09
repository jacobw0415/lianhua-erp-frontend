import React from "react";
import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ListContextProvider,
} from "react-admin";
import { Box, Typography } from "@mui/material";

interface ColumnConfig {
  source: string;
  label: string;
  type: "text" | "currency" | "date";
}

interface GenericSubTablePanelProps {
  title: string;
  rows: any[];
  columns: ColumnConfig[];
}

export const GenericSubTablePanel: React.FC<GenericSubTablePanelProps> = ({
  title,
  rows,
  columns,
}) => {
  const enableScroll = rows.length > 2;
  const maxHeight = enableScroll ? "150px" : "auto";

  const listContext: any = {
    data: rows,
    total: rows.length,
    isLoading: false,
    resource: "generic-subtable-panel",
  };

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper, //  卡片背景
        border: `2px solid ${theme.palette.divider}`, //  統一邊框風格
        borderRadius: 2,
        p: 1.5,
        minHeight: "200px",
        display: "flex",
        width: "100%",
        flexDirection: "column",
      })}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {title}
      </Typography>

      {rows.length === 0 ? (
        <Box
          sx={{
            width: "100%",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.disabled",
            fontSize: "0.9rem",
          }}
        >
          目前尚無紀錄
        </Box>
      ) : (
        <ListContextProvider value={listContext}>
          <Box
            sx={(theme) => ({
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              bgcolor: theme.palette.background.paper, //  卡片背景
              border: `2px solid ${theme.palette.divider}`, //  統一邊框風格
              maxHeight: maxHeight,
              width: "100%",
              overflowY: enableScroll ? "auto" : "visible",
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: 4,
              },
            })}
          >
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
                  <TextField key={col.source} source={col.source} label={col.label} />
                );
              })}
            </Datagrid>
          </Box>
        </ListContextProvider>
      )}
    </Box>
  );
};
