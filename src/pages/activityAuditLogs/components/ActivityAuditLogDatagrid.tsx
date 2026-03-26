import * as React from "react";
import { Chip } from "@mui/material";
import { FunctionField, type RaRecord } from "react-admin";

import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { ActivityAuditLogDetailDialog } from "@/pages/activityAuditLogs/components/ActivityAuditLogDetailDialog";
import {
  formatDuration,
  formatOccurredAtUTC,
  getActionLabel,
  getOperatorDisplay,
  getResourceTypeLabel,
  getStatusColor,
  getHttpMethodListDisplay,
  getHttpStatusChipLabel,
  getHttpStatusTooltip,
  safeParseDetails,
  type ParsedAuditDetails,
} from "@/pages/activityAuditLogs/auditFormatters";

type ParsedCacheEntry = {
  raw: unknown;
  parsed: ParsedAuditDetails | null;
};

const parsedCache = new WeakMap<object, ParsedCacheEntry>();

function getParsedFromRecord(record: RaRecord): ParsedAuditDetails | null {
  const obj = record as unknown as object;
  const raw = (record as Record<string, unknown>)?.details;

  const cached = parsedCache.get(obj);
  if (cached && cached.raw === raw) return cached.parsed;

  const parsed = safeParseDetails(raw);
  parsedCache.set(obj, { raw, parsed });
  return parsed;
}

export const ActivityAuditLogDatagrid: React.FC = () => {
  return (
    <ResponsiveListDatagrid tabletLayout="card" rowClick={false}>
      <FunctionField
        source="occurredAt"
        label="發生時間"
        sortBy="occurredAt"
        render={(record: RaRecord) => formatOccurredAtUTC(record?.occurredAt)}
      />
      <FunctionField
        label="操作者"
        sortable={false}
        render={(record: RaRecord) => {
          const parsed = getParsedFromRecord(record);
          return getOperatorDisplay(record, parsed);
        }}
      />
      <FunctionField
        label="動作"
        sortable={false}
        render={(record: RaRecord) => getActionLabel(record.action)}
      />
      <FunctionField
        label="資源類型"
        sortable={false}
        render={(record: RaRecord) => getResourceTypeLabel(record.resourceType)}
      />
      <FunctionField
        label="請求方式"
        sortable={false}
        render={(record: RaRecord) =>
          getHttpMethodListDisplay((record as Record<string, unknown>)?.httpMethod)
        }
      />
      <FunctionField
        label="回應狀態"
        sortable={false}
        render={(record: RaRecord) => {
          const parsed = getParsedFromRecord(record);
          return (
            <Chip
              label={getHttpStatusChipLabel(parsed?.httpStatus)}
              size="small"
              color={getStatusColor(parsed?.httpStatus)}
              title={getHttpStatusTooltip(parsed?.httpStatus)}
            />
          );
        }}
      />
      <FunctionField
        label="耗時"
        sortable={false}
        render={(record: RaRecord) => {
          const parsed = getParsedFromRecord(record);
          return parsed?.durationMs != null ? formatDuration(parsed.durationMs) : "—";
        }}
      />
      <FunctionField
        label="詳情"
        source="action"
        className="column-action"
        sortable={false}
        render={(record: RaRecord) =>
          record ? <ActivityAuditLogDetailDialog record={record} /> : null
        }
      />
    </ResponsiveListDatagrid>
  );
};

ActivityAuditLogDatagrid.displayName = "ActivityAuditLogDatagrid";

