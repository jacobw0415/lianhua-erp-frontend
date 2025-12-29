import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Alert,
} from "@mui/material";

interface VoidReasonDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export const VoidReasonDialog: React.FC<VoidReasonDialogProps> = ({
  open,
  title = "作廢確認",
  description = "請輸入作廢原因（選填）：",
  confirmLabel = "確認作廢",
  cancelLabel = "取消",
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const MAX_LENGTH = 20; 

  // 當對話框關閉時重置輸入
  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setReason(value);
    }
  };

  // Enter 鍵處理
  useEffect(() => {
    if (!open) return;

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onConfirm(reason || undefined);
      }
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [open, reason, onConfirm]);

  const handleConfirm = () => {
    onConfirm(reason || undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      maxWidth="sm"
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
          minWidth: 400,
        },
        onClick: (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
      }}
    >
      <DialogContent>
        <Typography
          variant="h6"
          sx={{ mb: 1.5, fontWeight: 700, color: "white" }}
        >
          {title}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9, color: "#ddd" }}>
          {description}
        </Typography>

        <Box sx={{ position: "relative" }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="請輸入作廢原因（選填，最多20字）"
            value={reason}
            onChange={handleReasonChange}
            inputProps={{
              maxLength: MAX_LENGTH,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1F1F1F",
                color: "white",
                "& fieldset": {
                  borderColor: "#555",
                },
                "&:hover fieldset": {
                  borderColor: "#777",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0288D1",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#888",
                opacity: 1,
              },
            }}
            autoFocus
          />
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 12,
              color: reason.length >= MAX_LENGTH ? "#f44336" : "#888",
              fontSize: "0.75rem",
              pointerEvents: "none",
            }}
          >
            {reason.length}/{MAX_LENGTH}
          </Typography>
        </Box>
        {reason.length >= MAX_LENGTH && (
          <Alert
            severity="warning"
            sx={{
              mt: 1.5,
              bgcolor: "rgba(237, 108, 2, 0.1)",
              color: "#ff9800",
              "& .MuiAlert-icon": {
                color: "#ff9800",
              },
            }}
          >
            <Typography variant="caption">
              已達最大字數限制（{MAX_LENGTH}字），無法繼續輸入
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
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

        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            handleConfirm();
          }}
          sx={{
            minWidth: 120,
            fontWeight: 700,
            bgcolor: "#ED6C02",
            color: "white",
            "&:hover": {
              bgcolor: "#E65100",
              color: "white",
            },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

