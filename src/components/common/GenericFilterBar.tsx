import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import {
  useListContext,
  useCreatePath,
  useResourceContext,
} from "react-admin";

import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";

interface FilterOption {
  type: "text" | "select" | "reference" | "dateRange" | "numberRange";
  source: string;
  label: string;
  choices?: { id: any; name: string }[];
}

interface GenericFilterBarProps {
  quickFilters?: FilterOption[];
  advancedFilters?: FilterOption[];
  popoverWidth?: number | string;

  /** 🔥 新增 + 匯出 控制 */
  enableCreate?: boolean;
  enableExport?: boolean;
  createLabel?: string;
  onExport?: () => void; // ⭐ 匯出 callback（從 StyledListWrapper 傳入）
}

export const GenericFilterBar: React.FC<GenericFilterBarProps> = ({
  quickFilters = [],
  advancedFilters = [],
  popoverWidth = 420,

  enableCreate = true,
  enableExport = false,
  createLabel = "新增資料",
  onExport,
}) => {
  const { setFilters } = useListContext();
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

  const createPath = useCreatePath();
  const resource = useResourceContext();

  const updateValue = (src: string, value: any) =>
    setLocalFilters((prev) => ({ ...prev, [src]: value }));

  const applyFilters = () => setFilters(localFilters);
  const clearFilters = () => {
    setLocalFilters({});
    setFilters({});
  };

  const renderFilter = (f: FilterOption) => {
    switch (f.type) {
      case "text":
        return (
          <TextField
            label={f.label}
            fullWidth
            value={localFilters[f.source] ?? ""}
            onChange={(e) => updateValue(f.source, e.target.value)}
          />
        );

      case "select":
        return (
          <TextField
            label={f.label}
            select
            fullWidth
            value={localFilters[f.source] ?? ""}
            onChange={(e) => updateValue(f.source, e.target.value)}
          >
            {f.choices?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* 左邊篩選區 */}
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
        {quickFilters.map((filter, idx) => (
          <Box key={idx} sx={{ minWidth: 220 }}>
            {renderFilter(filter)}
          </Box>
        ))}

        {/* 進階篩選 —— ⭐ 原本缺少！補上後 UI 就會出現 */}
        {advancedFilters.map((filter, idx) => (
          <Box key={idx} sx={{ minWidth: 220 }}>
            {renderFilter(filter)}
          </Box>
        ))}

        <Button variant="contained" onClick={applyFilters}>
          搜尋
        </Button>

        <Button variant="outlined" color="error" onClick={clearFilters}>
          清除
        </Button>
      </Stack>

      {/* 右側功能按鈕：新增＋匯出 */}
      <Stack direction="row" spacing={1}>
        {enableCreate && (
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            href={`#${createPath({ resource, type: "create" })}`}   // ⭐⭐ 加 #
          >
            {createLabel}
          </Button>
        )}

        {enableExport && onExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
          >
            匯出資料
          </Button>
        )}
      </Stack>
    </Box>
  );
};
