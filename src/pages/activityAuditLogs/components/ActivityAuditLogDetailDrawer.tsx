import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { RaRecord } from "react-admin";
import { useTranslation } from "react-i18next";

import { getDrawerScrollableStyles } from "@/theme/LianhuaTheme";
import { useIsMobile, useIsSmallScreen } from "@/hooks/useIsMobile";
import {
  formatDetailsPretty,
  formatDuration,
  formatOccurredAtUTC,
  getActionLabel,
  getOperatorDisplay,
  getResourceTypeLabel,
  getStatusColor,
  getHttpMethodChipLabel,
  getHttpStatusChipLabel,
  getHttpStatusResultText,
  getHttpStatusTooltip,
  maskIp,
  maskSensitiveQueryString,
  safeParseDetails,
  summarizeCtx,
  type ParsedAuditDetails,
} from "@/pages/activityAuditLogs/auditFormatters";

export const ActivityAuditLogDetailDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  record: RaRecord | null;
}> = ({ open, onClose, record }) => {
  const theme = useTheme();
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();

  const [showRawJson, setShowRawJson] = React.useState(false);
  const [showFullQuery, setShowFullQuery] = React.useState(false);
  const [showTechnical, setShowTechnical] = React.useState(false);
  const [showFullUserAgent, setShowFullUserAgent] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setShowRawJson(false);
    setShowFullQuery(false);
    setShowTechnical(false);
    setShowFullUserAgent(false);
  }, [open, record]);

  const parsed: ParsedAuditDetails | null = safeParseDetails((record as Record<string, unknown> | null | undefined)?.details);

  const handler = parsed?.handler != null ? String(parsed.handler) : "—";
  const duration = parsed?.durationMs != null ? formatDuration(parsed.durationMs) : "—";
  const requestId = parsed?.requestId != null ? String(parsed.requestId) : null;
  const ctxSummary = summarizeCtx(parsed?.ctx);
  const operatorDisplay = record ? getOperatorDisplay(record, parsed) : "—";
  const resultText = getHttpStatusResultText(parsed?.httpStatus);

  const rawQueryString = record ? (record as Record<string, unknown>)?.queryString : undefined;
  const maskedQuery = maskSensitiveQueryString(rawQueryString, 220);
  const queryText = rawQueryString != null ? String(rawQueryString) : "";
  const queryDisplay = showFullQuery ? queryText : maskedQuery;

  const userAgentText = record ? (record as Record<string, unknown>)?.userAgent : undefined;
  const uaText = userAgentText != null ? String(userAgentText) : "";
  const uaTruncated =
    uaText.length > 160 ? `${uaText.slice(0, 160)}…` : uaText || "—";

  if (!record) return null;

  return (
    <Drawer
      anchor={isSmallScreen ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isSmallScreen ? "100%" : { xs: "100%", sm: 560 },
          maxWidth: isSmallScreen ? "100%" : { xs: "100%", sm: 560 },
          ...(isSmallScreen && {
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }),
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                fontWeight: 600,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              活動稽核詳情
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0 }}>
            <CloseIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            ...getDrawerScrollableStyles(theme, 720, true),
            pr: 0.5,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">
              與「使用者管理稽核」來源不同；本頁為全系統 HTTP 活動紀錄（activity_audit_logs）。
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" alignItems="center">
              <Chip
                label={getHttpStatusChipLabel(parsed?.httpStatus)}
                color={getStatusColor(parsed?.httpStatus)}
                size="small"
                title={getHttpStatusTooltip(parsed?.httpStatus)}
              />
              <Chip
                label={getHttpMethodChipLabel((record as Record<string, unknown>).httpMethod)}
                size="small"
                variant="outlined"
              />
              <Chip label={duration} size="small" variant="outlined" />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              <strong>{resultText}</strong>
            </Typography>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>{t("filters.occurredAt")}：</strong>
                {formatOccurredAtUTC((record as Record<string, unknown>).occurredAt)}
              </Typography>
              <Typography variant="body2">
                <strong>{t("filters.operator")}：</strong>
                {operatorDisplay}
              </Typography>
              <Typography variant="body2">
                <strong>{t("filters.auditAction")}：</strong>
                {getActionLabel((record as Record<string, unknown>).action)}
              </Typography>
              <Typography variant="body2">
                <strong>資源：</strong>
                {getResourceTypeLabel((record as Record<string, unknown>).resourceType)}
              </Typography>
              {ctxSummary ? (
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                  <strong>ctx 摘要：</strong>
                  {ctxSummary}
                </Typography>
              ) : null}
            </Stack>

            <Divider />

            <Box>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowTechnical((v) => !v)}
                sx={{ px: 0, mb: 0.5 }}
              >
                {showTechnical ? "隱藏詳細追蹤資訊" : "顯示詳細追蹤資訊（技術）"}
              </Button>
            </Box>

            <Collapse in={showTechnical} timeout={180} unmountOnExit>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  <strong>API 路徑（requestPath）：</strong>
                  {(record as Record<string, unknown>).requestPath != null ? String((record as Record<string, unknown>).requestPath) : "—"}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  <strong>伺服器處理方法（handler）：</strong>
                  {handler}
                </Typography>
                <Typography variant="body2">
                  <strong>查詢參數（queryString）：</strong>
                  {queryDisplay}
                </Typography>
                {rawQueryString != null && String(rawQueryString).length > maskedQuery.length ? (
                  <Button size="small" variant="text" onClick={() => setShowFullQuery((v) => !v)}>
                    {showFullQuery ? "收起（遮罩）" : "顯示完整"}
                  </Button>
                ) : null}

                <Typography variant="body2">
                  <strong>IP：</strong>
                  {maskIp((record as Record<string, unknown>).ipAddress)}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  <strong>瀏覽器/裝置資訊：</strong>
                  {showFullUserAgent ? uaText || "—" : uaTruncated}
                </Typography>
                {uaText.length > 160 ? (
                  <Button size="small" variant="text" onClick={() => setShowFullUserAgent((v) => !v)}>
                    {showFullUserAgent ? "收起（截斷）" : "顯示完整"}
                  </Button>
                ) : null}

                <Typography variant="body2">
                  <strong>資源 ID（resourceId）：</strong>
                  {(record as Record<string, unknown>).resourceId != null ? String((record as Record<string, unknown>).resourceId) : "—"}
                </Typography>
                {requestId ? (
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    <strong>requestId：</strong>
                    <Box component="span" sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {requestId}
                    </Box>
                  </Typography>
                ) : null}
              </Stack>
            </Collapse>

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" gutterBottom>
                  原始追蹤資料（JSON）
                </Typography>
                <IconButton size="small" onClick={() => setShowRawJson((v) => !v)} aria-label="toggle details json">
                  {showRawJson ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Stack>
              <Collapse in={showRawJson} timeout={180} unmountOnExit>
                <Box
                  component="pre"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    fontSize: 12,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    ...getDrawerScrollableStyles(theme, 280, true),
                    m: 0,
                  }}
                >
                  {formatDetailsPretty((record as Record<string, unknown>).details) || "—"}
                </Box>
              </Collapse>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

ActivityAuditLogDetailDrawer.displayName = "ActivityAuditLogDetailDrawer";

