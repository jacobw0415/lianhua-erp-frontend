import { getApiUrl } from "@/config/apiUrl";
import {
  type BuildListQueryParamsInput,
  buildExportQueryParams,
} from "@/providers/listQueryParams";

function parseExportErrorMessage(response: Response, bodyText: string): string {
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

/**
 * GET `/{resource}/export`，查詢參數與列表搜尋一致，並帶 `format`、`scope`。
 */
export async function downloadResourceExport(
  resource: string,
  listParams: BuildListQueryParamsInput,
  options: {
    scope: "page" | "all";
    format: string;
    /** 與後端約定之 `columns` query（逗號分隔欄位 key） */
    columns?: string[];
  }
): Promise<void> {
  const query = buildExportQueryParams(resource, listParams, {
    scope: options.scope,
    format: options.format,
    columns: options.columns,
  });
  const url = `${getApiUrl()}/${resource}/export?${query.toString()}`;

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const tokenType =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("tokenType") || "Bearer"
      : "Bearer";

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `${tokenType} ${token}`);
  }
  headers.set("Accept", "application/octet-stream,application/json;q=0.1,*/*");

  const response = await fetch(url, { method: "GET", headers });

  const contentType = response.headers.get("Content-Type") || "";

  if (!response.ok) {
    const text = await response.text();
    const message = parseExportErrorMessage(response, text);
    if (response.status === 401) {
      throw new Error("SESSION_EXPIRED");
    }
    throw new Error(message);
  }

  // 與 reportExportDownload 一致：勿將錯誤 JSON 當成檔案下載
  if (contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(parseExportErrorMessage(response, text));
  }

  const blob = await response.blob();
  const fromHeader = parseFilenameFromContentDisposition(
    response.headers.get("Content-Disposition")
  );
  const ext = options.format.toLowerCase() === "csv" ? "csv" : "xlsx";
  const fallback = `${resource}_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${ext}`;
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
