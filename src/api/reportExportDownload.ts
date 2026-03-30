import { getApiUrl } from "@/config/apiUrl";
import {
  appendLangQueryIfMissing,
  applyAcceptLanguageHeader,
} from "@/utils/apiLocale";

/** 與後端 `GET /api/reports/{reportKey}/export` 的 path 參數一致 */
export const REPORT_EXPORT_KEYS = {
  balance_sheet: "balance_sheet",
  comprehensive_income_statement: "comprehensive_income_statement",
  cash_flow_reports: "cash_flow_reports",
  ar_summary: "ar_summary",
  ap_summary: "ap_summary",
} as const;

export type ReportExportKey =
  (typeof REPORT_EXPORT_KEYS)[keyof typeof REPORT_EXPORT_KEYS];

/** 與各報表 GET 相同的篩選（ReportExportQueryDto） */
export interface ReportExportFilter {
  period?: string;
  periods?: string[];
  /**
   * 與 `useBalanceSheetReport` GET 一致：多期時除 `periods` 外另送逗號字串（後端綁定相容）。
   * 僅資產負債表多期匯出需要帶入。
   */
  periodsCsv?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportExportDownloadOptions {
  format?: "xlsx" | "csv";
  scope?: "all" | "page";
  columns?: string[];
  page?: number;
  size?: number;
  /** 例如 `accountingPeriod,desc`（僅支援 accountingPeriod） */
  sort?: string;
  /** 匯出表頭語系需與 UI 不同時（後端 `exportLang`） */
  exportLang?: "zh-TW" | "en";
}

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const ascii = /filename="([^"]+)"/i.exec(header);
  if (ascii?.[1]) return ascii[1].trim();
  const plain = /filename=([^;]+)/i.exec(header);
  if (plain?.[1]) return plain[1].replace(/^"|"$/g, "").trim();
  return null;
}

function appendReportFilters(q: URLSearchParams, filter: ReportExportFilter): void {
  if (filter.periods && filter.periods.length > 0) {
    q.set("periods", filter.periods.join(","));
    if (filter.periodsCsv) {
      q.set("periodsCsv", filter.periodsCsv);
    }
  } else if (filter.period) {
    q.set("period", filter.period);
  }
  if (filter.startDate) q.set("startDate", filter.startDate);
  if (filter.endDate) q.set("endDate", filter.endDate);
}

/**
 * 組出與 Swagger 一致的匯出 query（與各報表 GET 篩選相同鍵名）。
 */
export function buildReportExportQuery(
  filter: ReportExportFilter,
  options: ReportExportDownloadOptions = {}
): URLSearchParams {
  const q = new URLSearchParams();
  appendReportFilters(q, filter);
  const scope = options.scope ?? "all";
  q.set("format", options.format ?? "xlsx");
  q.set("scope", scope);
  if (options.columns?.length) {
    q.set("columns", options.columns.join(","));
  }
  if (scope === "page") {
    if (options.page !== undefined) q.set("page", String(options.page));
    if (options.size !== undefined) q.set("size", String(options.size));
  }
  if (options.sort) q.set("sort", options.sort);
  if (options.exportLang) {
    q.set("exportLang", options.exportLang === "en" ? "en" : "zh-TW");
  }
  return q;
}

function parseErrorMessage(response: Response, bodyText: string): string {
  let message = `匯出失敗（${response.status}）`;
  try {
    const j = JSON.parse(bodyText) as { message?: string; error?: string };
    if (j.message) message = j.message;
    else if (j.error) message = j.error;
  } catch {
    if (bodyText && bodyText.length < 500) message = bodyText;
  }
  return message;
}

/**
 * GET `/api/reports/{reportKey}/export`，下載 xlsx/csv；失敗時 body 多為 JSON。
 */
export async function downloadReportExport(
  reportKey: ReportExportKey,
  filter: ReportExportFilter,
  options: ReportExportDownloadOptions = {}
): Promise<void> {
  const query = buildReportExportQuery(filter, options).toString();
  const url = appendLangQueryIfMissing(
    `${getApiUrl()}/reports/${reportKey}/export?${query}`
  );

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const tokenType =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("tokenType") || "Bearer"
      : "Bearer";

  const headers = new Headers();
  applyAcceptLanguageHeader(headers);
  if (token) {
    headers.set("Authorization", `${tokenType} ${token}`);
  }
  headers.set("Accept", "application/octet-stream,application/json;q=0.1,*/*");

  const response = await fetch(url, { method: "GET", headers });

  const contentType = response.headers.get("Content-Type") || "";

  if (!response.ok) {
    const text = await response.text();
    const message = parseErrorMessage(response, text);
    if (response.status === 401) {
      throw new Error("SESSION_EXPIRED");
    }
    throw new Error(message);
  }

  if (contentType.includes("application/json")) {
    const text = await response.text();
    const message = parseErrorMessage(response, text);
    throw new Error(message);
  }

  const blob = await response.blob();
  const fromHeader = parseFilenameFromContentDisposition(
    response.headers.get("Content-Disposition")
  );
  const fmt = (options.format ?? "xlsx").toLowerCase();
  const ext = fmt === "csv" ? "csv" : "xlsx";
  const fallback = `${reportKey}_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${ext}`;
  const filename = fromHeader || fallback;

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
