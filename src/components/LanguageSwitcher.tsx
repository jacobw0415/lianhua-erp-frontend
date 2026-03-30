import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Menu,
  MenuItem,
  SvgIcon,
  type SvgIconProps,
  Tooltip,
  Typography,
} from "@mui/material";

/** 與 MUI Translate 圖示相同路徑；避免 `@mui/icons-material/Translate` 獨立預打包 chunk 造成快取不一致。 */
function TranslateGlyph(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="m12.87 15.07-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2zm-2.62 7 1.62-4.33L19.12 17z" />
    </SvgIcon>
  );
}

import type { BackendLocaleTag } from "@/utils/apiLocale";

const LOCALES: { code: BackendLocaleTag; labelKey: "lang.zhTW" | "lang.en" }[] = [
  { code: "zh-TW", labelKey: "lang.zhTW" },
  { code: "en", labelKey: "lang.en" },
];

/**
 * 頂欄語系切換：與 i18n 及後端 Accept-Language（apiLocale）同步。
 */
export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("common");
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const current = i18n.language.startsWith("en") ? "en" : "zh-TW";

  return (
    <>
      <Tooltip title={t("lang.label")}>
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={t("lang.label")}
          sx={{ color: "#fff" }}
          size="small"
        >
          <TranslateGlyph sx={{ fontSize: 22 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 160 } } }}
      >
        {LOCALES.map(({ code, labelKey }) => (
          <MenuItem
            key={code}
            selected={current === code}
            onClick={() => {
              void i18n.changeLanguage(code);
              setAnchor(null);
            }}
            dense
          >
            <Typography variant="body2">{t(labelKey)}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
