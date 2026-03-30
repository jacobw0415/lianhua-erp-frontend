import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import zhTWCommon from "@/locales/zh-TW/common.json";
import enCommon from "@/locales/en/common.json";
import zhTWDashboard from "@/locales/zh-TW/dashboard.json";
import enDashboard from "@/locales/en/dashboard.json";

import {
  getBackendLocaleFromStorage,
  normalizeToBackendLocale,
  setBackendLocaleInStorage,
} from "@/utils/apiLocale";

void i18n.use(initReactI18next).init({
  resources: {
    /** 完整語系碼（changeLanguage、localStorage 使用 zh-TW） */
    "zh-TW": { common: zhTWCommon, dashboard: zhTWDashboard },
    /**
     * languageOnly 會將 zh-TW 解析為 zh；若僅註冊 zh-TW，繁中翻譯會載入失敗而顯示 raw key。
     * 與 zh-TW 共用同一份 JSON。
     */
    zh: { common: zhTWCommon, dashboard: zhTWDashboard },
    en: { common: enCommon, dashboard: enDashboard },
  },
  lng: getBackendLocaleFromStorage(),
  fallbackLng: "zh-TW",
  supportedLngs: ["zh-TW", "zh", "en"],
  /** 僅以語言碼載入（en-US → en），避免找不到資源時整包落回 fallbackLng 繁中 */
  load: "languageOnly",
  ns: ["common", "dashboard"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on("languageChanged", (lng) => {
  setBackendLocaleInStorage(normalizeToBackendLocale(lng));
});

export default i18n;
