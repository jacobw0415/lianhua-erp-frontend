import { useListContext } from "react-admin";
import {
  Box,
  IconButton,
  Typography,
  FormControl,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { useIsMobile } from "@/hooks/useIsMobile";

export const CustomPaginationBar = ({ showPerPage = true }) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { page, perPage, total, setPage, setPerPage } = useListContext();

  if (!total) return null;

  const totalPages = Math.ceil(total / perPage);
  const current = page;

  // 計算顯示的筆數範圍
  const start = (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, total);

  const textColor = theme.palette.text.primary;
  const disabledColor = theme.palette.text.disabled;
  const activeColor = theme.palette.primary.main;

  /** 固定最多顯示 5 個頁碼 */
  const getPageNumbers = () => {
    const max = 5;
    if (totalPages <= max) return [...Array(totalPages).keys()].map(x => x + 1);

    let start = Math.max(current - 2, 1);
    let end = start + max - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - max + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="nowrap"
      gap={{ xs: 0.5, sm: 0 }}
      px={{ xs: 1.5, sm: 2 }}
      py={1}
      sx={{
        fontSize: "0.85rem",
        color: textColor,
        overflowX: "auto",
        "& > *": { flexShrink: 0 },
      }}
    >
      {/* --------- Rows per page ----------- */}
      {showPerPage && (
        <Box display="flex" alignItems="center" flexShrink={0} mr={{ xs: 0.5, sm: 2 }}>
          <Typography
            fontSize="0.75rem"
            mr={1}
            color={textColor}
            sx={{ display: isMobile ? "none" : "block" }}
          >
            Rows per page:
          </Typography>
          <Typography
            fontSize="0.75rem"
            mr={1}
            color={textColor}
            sx={{ display: isMobile ? "block" : "none" }}
          >
            每頁:
          </Typography>

          <FormControl size="small" sx={{ minWidth: 65 }}>
            <Select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              sx={{
                fontSize: "0.75rem",
                height: 30,
                color: textColor,
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: disabledColor,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: activeColor,
                },
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* --------- 筆數範圍 ----------- */}
      <Typography
        fontSize="0.8rem"
        color={textColor}
        mx={{ xs: 0.5, sm: 2 }}
        sx={{ minWidth: { xs: "fit-content", sm: "90px" }, textAlign: "center", whiteSpace: "nowrap" }}
      >
        {start}–{end} of {total}
      </Typography>

      {/* --------- Page buttons ----------- */}
      <IconButton
        size="small"
        onClick={() => setPage(1)}
        disabled={current === 1}
        sx={{
          color: current === 1 ? disabledColor : textColor,
          ...(isMobile && { p: 0.5, minWidth: 36, minHeight: 36 }),
        }}
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => setPage(current - 1)}
        disabled={current === 1}
        sx={{
          color: current === 1 ? disabledColor : textColor,
          ...(isMobile && { p: 0.5, minWidth: 36, minHeight: 36 }),
        }}
      >
        <NavigateBeforeIcon fontSize="small" />
      </IconButton>

      {/* 手機隱藏頁碼數字， desktop 顯示 */}
      {!isMobile &&
        pages.map((p) => (
          <Typography
            key={p}
            onClick={() => setPage(p)}
            sx={{
              px: 1,
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: p === current ? 700 : 400,
              color: p === current ? activeColor : textColor,
              textDecoration: p === current ? "underline" : "none",
              "&:hover": { color: activeColor },
            }}
          >
            {p}
          </Typography>
        ))}

      {/* 手機顯示目前頁/總頁 */}
      {isMobile && (
        <Typography
          fontSize="0.8rem"
          color={textColor}
          sx={{ px: 0.5, fontWeight: 500 }}
        >
          {current}/{totalPages}
        </Typography>
      )}

      <IconButton
        size="small"
        onClick={() => setPage(current + 1)}
        disabled={current === totalPages}
        sx={{
          color: current === totalPages ? disabledColor : textColor,
          ...(isMobile && { p: 0.5, minWidth: 36, minHeight: 36 }),
        }}
      >
        <NavigateNextIcon fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => setPage(totalPages)}
        disabled={current === totalPages}
        sx={{
          color: current === totalPages ? disabledColor : textColor,
          ...(isMobile && { p: 0.5, minWidth: 36, minHeight: 36 }),
        }}
      >
        <LastPageIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
