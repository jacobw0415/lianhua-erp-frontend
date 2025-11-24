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
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "background.default",
        minHeight: "200px",
        display: "flex",
        width: "100%",
        flexDirection: "column",
      }}
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
            sx={{
              border: "1px solid #eee",
              borderRadius: 1,
              maxHeight: maxHeight,
              width: "100%",
              overflowY: enableScroll ? "auto" : "visible",
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: 4,
              },
            }}
          >
            <Datagrid
              bulkActionButtons={false}
              rowClick={false}
              sx={{
                "& .RaDatagrid-table": {
                  tableLayout: "fixed",
                  borderRadius: 2,
                  overflow: "hidden",
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
