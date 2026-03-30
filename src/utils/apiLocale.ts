/**
 * 與後端 Spring MessageSource / LocaleContextFilter 對齊：
 * 以 Accept-Language（及可選的 lang 查詢參數）傳遞 zh-TW | en。
 * UI 語系可寫入 localStorage（見 setBackendLocaleInStorage）；預設 zh-TW。
 */

export const APP_LOCALE_STORAGE_KEY = "app_locale";

export type BackendLocaleTag = "zh-TW" | "en";

export function normalizeToBackendLocale(raw: string | null | undefined): BackendLocaleTag {
  if (!raw) return "zh-TW";
  const t = raw.trim().toLowerCase();
  if (t === "en" || t.startsWith("en-")) return "en";
  return "zh-TW";
}

export function getBackendLocaleFromStorage(): BackendLocaleTag {
  if (typeof localStorage === "undefined") return "zh-TW";
  return normalizeToBackendLocale(localStorage.getItem(APP_LOCALE_STORAGE_KEY));
}

/** 供語系切換元件呼叫，與 Accept-Language 同步。 */
export function setBackendLocaleInStorage(locale: BackendLocaleTag): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(APP_LOCALE_STORAGE_KEY, locale);
}

export function getAcceptLanguageValue(): string {
  return getBackendLocaleFromStorage();
}

export function applyAcceptLanguageHeader(headers: Headers): void {
  headers.set("Accept-Language", getAcceptLanguageValue());
}

export function mergeHeadersWithAcceptLanguage(headers?: HeadersInit | null): Headers {
  const h = new Headers(headers ?? undefined);
  applyAcceptLanguageHeader(h);
  return h;
}

/**
 * 若 URL 尚無 `lang`，附加與 Accept-Language 一致之值（後端 Filter 層與快取鍵對齊）。
 */
export function appendLangQueryIfMissing(url: string): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("lang")) {
      u.searchParams.set("lang", getBackendLocaleFromStorage());
    }
    return u.toString();
  } catch {
    return url;
  }
}
