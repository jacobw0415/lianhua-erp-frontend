import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";

import { zhTWMessages } from "@/i18n/raMessagesZhTW";
import { getBackendLocaleFromStorage } from "@/utils/apiLocale";

const initialLocale = getBackendLocaleFromStorage();

export const raI18nProvider = polyglotI18nProvider(
  (locale: string) => (locale.startsWith("en") ? englishMessages : zhTWMessages),
  initialLocale,
  [
    { locale: "en", name: "English" },
    { locale: "zh-TW", name: "繁體中文" },
  ]
);
