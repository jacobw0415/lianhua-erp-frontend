import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface GlobalAlertDialogProps {
  open: boolean;
  message?: string;
  title?: string;
  severity?: "error" | "warning" | "info" | "success";
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  hideButtons?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const GlobalAlertDialog: React.FC<GlobalAlertDialogProps> = ({
  open,
  message,
  title = "提示",
  severity = "info",
  description,
  confirmLabel = "確定",
  cancelLabel = "取消",
  hideCancel,
  hideButtons,
  onClose,
  onConfirm,
}) => {

  /** 🔥 Enter 觸發 */
  useEffect(() => {
    if (!open) return;

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm ? onConfirm() : onClose();
      }
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [open, onClose, onConfirm]);

  /** ⭐ 按鈕顏色依 severity 切換 */
  const severityColorMap: Record<
    NonNullable<GlobalAlertDialogProps["severity"]>,
    { bgcolor: string; hover: string }
  > = {
    error: {
      bgcolor: "#D32F2F",   // red
      hover: "#B71C1C",
    },
    warning: {
      bgcolor: "#ED6C02",   // orange
      hover: "#E65100",
    },
    info: {
      bgcolor: "#0288D1",   // blue
      hover: "#0277BD",
    },
    success: {
      bgcolor: "#2E7D32",   // green
      hover: "#1B5E20",
    },
  };

  const confirmButtonColor = {
    bgcolor: severityColorMap[severity].bgcolor,
    color: "white",
    "&:hover": {
      bgcolor: severityColorMap[severity].hover,
      color: "white",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 3,
          bgcolor: "#2F2F2F",
          color: "white",
          minWidth: 360,
        },
        onClick: (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
      }}
    >
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{ mb: 1.5, fontWeight: 700, color: "white" }}
        >
          {title}
        </Typography>

        <Typography variant="body1" sx={{ opacity: 0.9, color: "#ddd" }}>
          {description || message}
        </Typography>
      </DialogContent>

      {/* ⭐ 若 hideButtons → 完全不顯示按鈕 */}
      {!hideButtons && (
        onConfirm ? (
          <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
            {!hideCancel && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                  onClose();
                }}
                sx={{
                  borderColor: "#777",
                  color: "#ddd",
                  "&:hover": { borderColor: "#aaa", color: "#fff" },
                  minWidth: 90,
                }}
              >
                {cancelLabel}
              </Button>
            )}

            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                onConfirm?.();
              }}
              sx={{
                minWidth: 90,
                fontWeight: 700,
                ...confirmButtonColor,
              }}
            >
              {confirmLabel}
            </Button>
          </DialogActions>
        ) : (
          <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                minWidth: 100,
                fontWeight: 700,
                ...confirmButtonColor,
              }}
            >
              確定
            </Button>
          </DialogActions>
        )
      )}
    </Dialog>
  );
};