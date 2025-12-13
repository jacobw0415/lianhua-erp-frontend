import React, { useState } from "react";
import { Box, Chip, Popover, Typography, useTheme } from "@mui/material";

interface ChipItem {
  key: string;
  display: string | undefined | null;
}

interface Props {
  chips: ChipItem[];
  onRemove: (key: string) => void;
}

export const SearchChipsCompact: React.FC<Props> = ({ chips, onRemove }) => {
  /* =========================================================
   * ⭐ Hooks 一定要放最前面
   * ========================================================= */
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /* =========================================================
   * 🛡 防呆處理（放在 Hooks 之後）
   * ========================================================= */
  if (!Array.isArray(chips)) return null;

  const safeChips = chips.filter(
    (chip) =>
      chip &&
      typeof chip.display === "string" &&
      chip.display.trim() !== "" &&
      typeof chip.key === "string" &&
      chip.key.trim() !== ""
  );

  if (safeChips.length === 0) return null;

  /* =========================================================
   * 資料切分
   * ========================================================= */
  const visibleCount = 3;
  const visible = safeChips.slice(0, visibleCount);
  const hidden = safeChips.slice(visibleCount);

  /* =========================================================
   * 樣式
   * ========================================================= */
  const chipBg =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "#e8e8e8";

  const chipText =
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.black;

  /* =========================================================
   * Render
   * ========================================================= */
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {visible.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.display}
          size="small"
          onDelete={() => onRemove(chip.key)}
          sx={{
            height: 28,
            bgcolor: chipBg,
            color: chipText,
            fontSize: "0.75rem",
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        />
      ))}

      {hidden.length > 0 && (
        <>
          <Chip
            label={`+${hidden.length} 更多`}
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              height: 28,
              bgcolor: chipBg,
              color: chipText,
              fontSize: "0.75rem",
              border: "1px solid rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
          />

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <Box sx={{ p: 2, maxWidth: 260 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                其他篩選條件
              </Typography>

              {hidden.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.display}
                  size="small"
                  onDelete={() => onRemove(chip.key)}
                  sx={{
                    m: 0.5,
                    bgcolor: chipBg,
                    color: chipText,
                    border: "1px solid rgba(0,0,0,0.2)",
                  }}
                />
              ))}
            </Box>
          </Popover>
        </>
      )}
    </Box>
  );
};
