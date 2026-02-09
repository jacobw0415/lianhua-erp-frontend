import { useMediaQuery, type Theme } from "@mui/material";

/**
 * 判斷是否為手機尺寸（< 600px，down("sm")）
 * 用於：AppBar、Sidebar、列表外殼、表格 cell／操作欄樣式
 */
export const useIsMobile = (): boolean =>
  useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

/**
 * 判斷是否為小螢幕（含平板，< 900px，down("md")）
 * 用於：列表表格 vs 卡片切換（ResponsiveList）、篩選列進階 Drawer、AppBar 更多選單
 */
export const useIsSmallScreen = (): boolean =>
  useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
