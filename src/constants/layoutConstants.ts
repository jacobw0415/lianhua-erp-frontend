import type { SxProps, Theme } from "@mui/material";

/**
 * RWD 斷點語意（三層：手機／平板／桌面）
 * - 手機 (mobile): < 600px → useIsMobile() / useBreakpoint() === 'mobile'
 * - 平板 (tablet): 600–1199px → useIsTablet() / useBreakpoint() === 'tablet'
 * - 桌面 (desktop): >= 1200px → useBreakpoint() === 'desktop'
 * - 小螢幕 (smallScreen): < 900px → useIsSmallScreen()（平板+手機）
 *
 * 說明：
 * - 斷點數值與 MUI 預設一致（sm=600, md=900, lg=1200）
 * - 在實務設計上，我們將 900–1199px 的窄桌機／橫向平板也視為「平板區段」，
 *   讓整體 UX（FilterBar 直立 + 卡片列表等）保持一致。
 * - 請統一使用 @/hooks/useIsMobile 與 @/hooks/useIsTablet、useBreakpoint 等語意化 hook，
 *   避免在各元件中自行硬寫 breakpoints 判斷。
 */

/** RWD 斷點（px），與 MUI 預設一致 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

/**
 * 平板 (600–1199px) 專用常數，供 useBreakpoint() === 'tablet' 時選用
 *
 * 注意：
 * - useIsTablet() 的嚴格判斷仍是 600–900px（between('sm','md')），
 *   適合用在需要「真正平板」行為的場景。
 * - useBreakpoint() === 'tablet' 則涵蓋 600–1199px，
 *   主要用於 layout 分層（例如列表卡片／表格切換）。
 */
export const TABLET_CONSTANTS = {
  /** 列表建議最小高度 */
  listMinHeight: 520,
  /** Drawer 建議寬度 (vw) */
  drawerWidthVw: 52,
} as const;

/**
 * 與報表／儀表板一致的內容區響應式寬度／間距（基準）
 * 所有列表頁、報表頁、儀表板共用，確保全專案同寬
 * minWidth: 0 讓 flex 子元素在 RWD 下可正確縮小，避免寬表格撐破版面
 */
export const CONTENT_BOX_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  mt: { xs: 1.5, sm: 1 },
  pb: 4,
  px: { xs: 1, sm: 2, md: 2 },
};

/**
 * 內容區嚴格不擴張（與報表 RWD 一致）
 */
export const CONTENT_STRICT_OVERFLOW_SX: SxProps<Theme> = {
  overflow: "hidden",
};

/**
 * 內容區嚴格寬度包裝（與報表 REPORT_STRICT_WIDTH_WRAPPER_SX 同邏輯）
 */
export const CONTENT_STRICT_WIDTH_WRAPPER_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box",
};

/**
 * 報表主要內容區（QueryControls + Table）寬度約束
 * 與列表頁、其他模組同寬，RWD 下不溢出、可橫向捲動
 */
export const REPORT_CONTENT_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflowX: "auto",
  overflowY: "visible",
};

/**
 * 欄位較多的報表專用：表格區外層
 */
export const REPORT_WIDE_TABLE_WRAPPER_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflowX: "auto",
  overflowY: "visible",
  boxSizing: "border-box",
  WebkitOverflowScrolling: "touch",
};

/**
 * 欄位多的報表整頁內容外層
 */
export const REPORT_STRICT_WIDTH_WRAPPER_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box",
};

/**
 * AppBar 在不同裝置上的標準高度（px）
 */
export const APP_BAR_HEIGHT = {
  mobile: 64,
  desktop: 52,
} as const;

/**
 * 列表主內容區在不同裝置上的建議最小高度（px）
 */
export const LIST_MIN_HEIGHT = {
  mobile: 420,
  desktop: 600,
} as const;

/**
 * 新增/編輯表單版面常數
 */
export const FORM_MAX_WIDTH = 700;
export const FORM_WIDE_MAX_WIDTH = 970;

/**
 * 表單固定高度設定（與 StyledListDatagrid 保持一致）
 * 桌面端：800px（考慮作廢資訊框約占用 150px，確保按鈕可見）
 * 移動端：600px（考慮作廢資訊框約占用 150px，確保按鈕可見）
 */
export const FORM_FIXED_HEIGHT = {
  mobile: "600px",
  desktop: "800px",
} as const;

/** 表單外層卡片：響應式內距 */
export const FORM_CONTAINER_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  px: { xs: 1.25, sm: 2, md: 3 },
  py: { xs: 1.5, sm: 2, md: 2.5 },
};

export const FORM_FIELD_ROW_SX: SxProps<Theme> = {
  display: "grid",
  /**
   * 表單內「雙欄列」共用樣式
   * - mobile / tablet (< 1200px): 單欄直立
   * - desktop (>= 1200px, lg 以上): 雙欄橫向
   *
   * 說明：
   * - 新增／編輯頁在手機與平板上統一保持單欄，避免 600–1199px 時被撐成兩欄難以閱讀
   */
  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
  gap: 2,
  alignItems: "start",
  "& .RaInput-input, & .MuiFormControl-root": { marginTop: 0, marginBottom: 0 },
  "& .MuiFormControl-root": { marginTop: 0 },
  "& .MuiInputLabel-root": { transformOrigin: "top left" },
  "& .MuiInputBase-root": { marginTop: 0 },
};

/**
 * 列表頁「篩選 + 列表」外層容器
 * 使用統一的響應式間距與樣式
 * 與 Dashboard 保持一致的左右間距
 * 注意：水平間距由 .RaLayout-content 提供，此處僅保留垂直間距
 * 內部內容的水平間距和 gap 由 StyledListWrapper 的內部 wrapper 提供
 */
export const LIST_WRAPPER_CONTENT_SX: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  paddingY: { xs: 1, sm: 2, md: 2 },
  paddingX: 0, // 水平間距由父層 .RaLayout-content 提供
  borderRadius: { xs: 1, md: 2 },
  border: (theme) => ({ xs: "none", sm: `1px solid ${theme.palette.divider}` }),
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  boxShadow: { xs: "none", sm: 1 },
  minHeight: { xs: "auto", sm: LIST_MIN_HEIGHT.desktop },
  height: "auto",
  overflow: "hidden",
};

/**
 * 列表內容區（包 Datagrid/ResponsiveList 的捲動區）
 * 使用 flex: 1 填滿外層容器的其餘空間
 */
export const LIST_CONTENT_AREA_SX: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflowY: "visible",
  width: "100%",
  maxWidth: "100%",
};

/**
 * 統一的 z-index 層級管理
 * 確保所有浮動元素（Menu、Dialog、Snackbar 等）的層級關係清晰
 * 
 * Material-UI 預設 z-index：
 * - mobileStepper: 1000
 * - speedDial: 1050
 * - appBar: 1100
 * - drawer: 1200
 * - modal: 1300
 * - snackbar: 1400
 * - tooltip: 1500
 */
export const Z_INDEX = {
  /** AppBar 相關 */
  appBar: 1100,
  appBarMenu: 1200, // AppBar 上的選單（通知中心、使用者選單等）

  /** 側邊欄 */
  drawer: 1200,

  /** 對話框和模態框 */
  modal: 1300,
  dialog: 1300,

  /** 通知和提示 */
  snackbar: 1400,
  alert: 2000, // 專案自訂的 Alert 組件

  /** 工具提示 */
  tooltip: 1500,

  /** 下拉選單和 Popover */
  menu: 1200,
  popover: 1200,

  /** 特殊用途（AppBar 更多選單按鈕，需在通知中心之上） */
  appBarMoreButton: 1300,
} as const;
