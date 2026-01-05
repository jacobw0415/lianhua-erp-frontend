import React from "react";
import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ListContextProvider,
} from "react-admin";
import type { RaRecord, ListControllerResult } from "react-admin";
import { Box, Typography } from "@mui/material";
import { getDrawerScrollableStyles } from "@/theme/LianhuaTheme";

/* =========================================================
 * 型別定義
 * ========================================================= */
interface ColumnConfig {
  source: string;
  label: string;
  type: "text" | "currency" | "date";
}

interface GenericSubTablePanelProps {
  title: string;
  rows: RaRecord[];
  columns: ColumnConfig[];
}

/* =========================================================
 * Component
 * ========================================================= */
export const GenericSubTablePanel: React.FC<GenericSubTablePanelProps> = ({
  title,
  rows,
  columns,
}) => {
  const enableScroll = rows.length > 2;
  const maxHeight = 150;

  /**
   * ⚠️ 關鍵說明
   * 這裡是「UI 用的本地子表」
   * Datagrid 實際只會用到 data / total / isLoading
   * React-Admin v4 型別要求完整 ListControllerResult
   * → 在此做「集中、可控」的型別斷言（正確做法）
   */
  const listContext = {
    data: rows,
    total: rows.length,
    isLoading: false,
    resource: "generic-subtable-panel",
  } as unknown as ListControllerResult;

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 1.5,
        minHeight: "200px",
        display: "flex",
        width: "100%",
        flexDirection: "column",
      })}
    >
      {/* Title */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/* Empty */}
      {rows.length === 0 ? (
        <Box
          sx={{
            height: 140,
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
              borderRadius: 2,
              border: `2px solid ${theme.palette.divider}`,
              ...getDrawerScrollableStyles(theme, maxHeight, enableScroll),
            })}
          >
            <Datagrid
              bulkActionButtons={false}
              rowClick={false}
              sx={{
                /* ⭐ 關鍵：整張子表統一靠左（包含金額） */
                "& th": {
                  textAlign: "left",
                  fontWeight: 600,
                  padding: "8px 6px",
                },
                "& td": {
                  textAlign: "left",
                  padding: "8px 6px",
                },
              }}
            >
              {columns.map((col) => {
                switch (col.type) {
                  case "currency":
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

                  case "date":
                    return (
                      <DateField
                        key={col.source}
                        source={col.source}
                        label={col.label}
                      />
                    );

                  default:
                    return (
                      <TextField
                        key={col.source}
                        source={col.source}
                        label={col.label}
                      />
                    );
                }
              })}
            </Datagrid>
          </Box>
        </ListContextProvider>
      )}
    </Box>
  );
};

export default GenericSubTablePanel;