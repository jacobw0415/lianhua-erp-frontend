import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { RaRecord } from "react-admin";

import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  formatDetailsPretty,
  formatDuration,
  formatOccurredAtUTC,
  getActionLabel,
  getOperatorDisplay,
  getResourceTypeLabel,
  getStatusColor,
  getHttpStatusChipLabel,
  getHttpStatusResultText,
  getHttpStatusTooltip,
  maskIp,
  maskSensitiveQueryString,
  safeParseDetails,
  summarizeCtx,
} from "@/pages/activityAuditLogs/auditFormatters";

export const ActivityAuditLogDetailDialog: React.FC<{ record: RaRecord }> = ({ record }) => {
  const [open, setOpen] = React.useState(false);
  const [showRawJson, setShowRawJson] = React.useState(false);
  const [showFullQuery, setShowFullQuery] = React.useState(false);
  const [showTechnical, setShowTechnical] = React.useState(false);
  const [showFullUserAgent, setShowFullUserAgent] = React.useState(false);

  const theme = useTheme();
  const scrollbarStyles = getScrollbarStyles(theme);

  const parsed = safeParseDetails((record as Record<string, unknown>).details);
  const handler = parsed?.handler != null ? String(parsed.handler) : "—";
  const duration = parsed?.durationMs != null ? formatDuration(parsed.durationMs) : "—";
  const requestId = parsed?.requestId != null ? String(parsed.requestId) : null;
  const ctxSummary = summarizeCtx(parsed?.ctx);
  const operatorDisplay = getOperatorDisplay(record, parsed);
  const resultText = getHttpStatusResultText(parsed?.httpStatus);

  const maskedQuery = maskSensitiveQueryString((record as Record<string, unknown>).queryString, 220);
  const queryText = (record as Record<string, unknown>).queryString != null ? String((record as Record<string, unknown>).queryString) : "";
  const queryDisplay = showFullQuery ? queryText : maskedQuery;

  const userAgentText = (record as Record<string, unknown>).userAgent != null ? String((record as Record<string, unknown>).userAgent) : "";
  const uaTruncated =
    userAgentText.length > 160
      ? `${userAgentText.slice(0, 160)}…`
      : userAgentText || "—";

  return (
    <>
      <Link component="button" type="button" variant="body2" onClick={() => setOpen(true)} sx={{ cursor: "pointer" }}>
        詳情
      </Link>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>活動稽核詳情</DialogTitle>
        <DialogContent dividers sx={scrollbarStyles}>
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
                label={`請求方式 ${((record as Record<string, unknown>).httpMethod != null) ? String((record as Record<string, unknown>).httpMethod) : "—"}`}
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
                <strong>發生時間：</strong>
                {formatOccurredAtUTC((record as Record<string, unknown>).occurredAt)}
              </Typography>
              <Typography variant="body2">
                <strong>操作者：</strong>
                {operatorDisplay}
              </Typography>
              <Typography variant="body2">
                <strong>動作：</strong>
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
                {(record as Record<string, unknown>).queryString != null &&
                  String((record as Record<string, unknown>).queryString).length > maskedQuery.length ? (
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
                  {showFullUserAgent ? userAgentText || "—" : uaTruncated}
                </Typography>
                {userAgentText.length > 160 ? (
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
                    ...scrollbarStyles,
                    m: 0,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    fontSize: 12,
                    overflow: "auto",
                    maxHeight: 280,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {formatDetailsPretty((record as Record<string, unknown>).details) || "—"}
                </Box>
              </Collapse>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>關閉</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ActivityAuditLogDetailDialog.displayName = "ActivityAuditLogDetailDialog";

