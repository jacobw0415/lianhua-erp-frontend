import React from "react";
import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ArrayField,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { Box, Typography } from "@mui/material";

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
  const maxHeight = enableScroll ? "150px" : "auto";

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
        <Box
          sx={(theme) => ({
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            maxHeight,
            overflowY: enableScroll ? "auto" : "visible",
          })}
        >
          <ArrayField source="rows" record={{ rows }}>
            <Datagrid bulkActionButtons={false} rowClick={false}>
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
          </ArrayField>
        </Box>
      )}
    </Box>
  );
};