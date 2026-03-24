export type ExportScope = "page" | "all";

export interface BackendExportBehavior {
  defaultScope: ExportScope;
  sendColumns: boolean;
}

const DEFAULT_BACKEND_EXPORT_BEHAVIOR: BackendExportBehavior = {
  defaultScope: "all",
  sendColumns: true,
};

const BACKEND_EXPORT_BEHAVIOR_BY_RESOURCE: Record<string, BackendExportBehavior> = {
  ar: { defaultScope: "all", sendColumns: false },
  purchases: { defaultScope: "all", sendColumns: false },
  receipts: { defaultScope: "all", sendColumns: false },
  suppliers: { defaultScope: "all", sendColumns: false },
};

export function getBackendExportBehavior(resource?: string): BackendExportBehavior {
  if (!resource) return DEFAULT_BACKEND_EXPORT_BEHAVIOR;
  return (
    BACKEND_EXPORT_BEHAVIOR_BY_RESOURCE[resource] ??
    DEFAULT_BACKEND_EXPORT_BEHAVIOR
  );
}
