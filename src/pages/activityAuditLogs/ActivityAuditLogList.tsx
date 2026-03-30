import * as React from "react";
import {
  Box,
} from "@mui/material";
import {
  List,
  useRedirect,
} from "react-admin";
import { useTheme } from "@mui/material";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { hasRoleSuperAdmin } from "@/utils/authStorage";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { ActivityAuditLogDatagrid } from "@/pages/activityAuditLogs/components/ActivityAuditLogDatagrid";
import { getActionLabel, getResourceTypeLabel } from "@/pages/activityAuditLogs/auditFormatters";
import { useTranslation } from "react-i18next";

/**
 * 全系統活動稽核（SUPER_ADMIN）— GET /api/admin/activity-audit-logs
 */
export const ActivityAuditLogList = () => {
  const redirect = useRedirect();
  const allowed = hasRoleSuperAdmin();
  const theme = useTheme();
  const { t } = useTranslation("common");

  React.useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  React.useEffect(() => {
    if (!allowed) {
      redirect("/forbidden");
    }
  }, [allowed, redirect]);

  if (!allowed) {
    return null;
  }

  return (
    <List
      title="審計中心（全系統活動稽核）"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage={true} />}
      perPage={10}
      sort={{ field: "occurredAt", order: "DESC" }}
    >
      <StyledListWrapper
        disableCreate
        quickFilters={[
          { type: "text", source: "operatorUsername", label: t("filters.operator") },
          {
            type: "select",
            source: "action",
            label: t("filters.auditAction"),
            choices: [
              "CREATE",
              "UPDATE",
              "DELETE",
              "PATCH",
              "EXPORT",
              "LOGIN",
              "LOGOUT",
              "VOID",
            ].map((id) => ({
              id,
              name: getActionLabel(id),
            })),
          },
          {
            type: "select",
            source: "resourceType",
            label: "資源類型",
            choices: [
              "AUTH",
              "EMPLOYEES",
              "USERS",
              "ROLES",
              "PERMISSIONS",
              "NOTIFICATIONS",
              "GLOBAL_SEARCH",
              "DASHBOARD",
              "SUPPLIERS",
              "PRODUCTS",
              "PRODUCT_CATEGORIES",
              "EXPENSES",
              "EXPENSE_CATEGORIES",
              "ORDERS",
              "ORDER_CUSTOMERS",
              "ORDER_ITEMS",
              "PURCHASES",
              "PURCHASE_ITEMS",
              "PAYMENTS",
              "RECEIPTS",
              "SALES",
              "AP",
              "AR",
              "REPORTS",
              "ADMIN",
            ].map((id) => ({
              id,
              name: getResourceTypeLabel(id),
            })),
          },
        ]}
        advancedFilters={[
          {
            type: "dateRange",
            source: "occurred",
            label: t("filters.occurredAtRange"),
          },
        ]}
        exportConfig={{
          filename: "activity_audit_export",
          format: "excel",
          exportPickerTitle: "匯出活動稽核",
          exportColumnPicker: false,
          backendExport: {
            resource: "admin/activity-audit-logs",
            defaultFormat: "xlsx",
            defaultScope: "all",
            sendColumns: false,
            queryStrategy: "scoped",
          },
          backendExportDateFilter: {
            label: t("filters.occurredAt"),
            listRangeFilterKeys: { from: "occurredStart", to: "occurredEnd" },
          },
          columns: [],
        }}
      >
        <Box sx={{ width: "100%" }}>
          <ActivityAuditLogDatagrid />
        </Box>
      </StyledListWrapper>
    </List>
  );
};

ActivityAuditLogList.displayName = "ActivityAuditLogList";
