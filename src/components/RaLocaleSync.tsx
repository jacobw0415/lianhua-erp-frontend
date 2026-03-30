import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSetLocale } from "react-admin";

/**
 * 將 i18next 語系與 React Admin polyglot 語系同步（儲存／列表按鈕等 ra.* 文案）。
 */
export const RaLocaleSync = () => {
  const { i18n } = useTranslation();
  const setLocale = useSetLocale();

  useEffect(() => {
    const code = i18n.language.startsWith("en") ? "en" : "zh-TW";
    setLocale(code);
  }, [i18n.language, setLocale]);

  return null;
};
