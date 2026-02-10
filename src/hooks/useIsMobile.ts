import { useMediaQuery, type Theme } from "@mui/material";

export type Breakpoint = "mobile" | "tablet" | "desktop";

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

/**
 * 判斷是否為寬螢幕（>= 1200px，up("lg")）
 * 用於：篩選列桌面 layout，避免 900-1200px 窄桌面擁擠
 */
export const useIsLargeScreen = (): boolean =>
  useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

/**
 * 判斷是否為平板尺寸（600–900px，between("sm","md")）
 * 用於：三層 RWD 設計中平板專屬行為
 */
export const useIsTablet = (): boolean =>
  useMediaQuery((theme: Theme) => theme.breakpoints.between("sm", "md"));

export const useBreakpoint = (): Breakpoint => {
  /**
   * 統一 RWD 定義：
   * - mobile:  < 600px
   * - tablet:  600–1199px
   * - desktop: >= 1200px
   *
   * 說明：
   * - FilterBar 的桌面版判斷也是使用 up("lg") (>= 1200px)
   * - 因此這裡也改成以 lg 當作 desktop 起點，
   *   讓 900–1200px 的「窄桌機／橫向平板」都被視為 tablet，
   *   與目前我們在平板上採用直立 FilterBar + 卡片列表的設計一致。
   */
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  if (isMobile) return "mobile";
  if (isDesktop) return "desktop";
  return "tablet";
};
