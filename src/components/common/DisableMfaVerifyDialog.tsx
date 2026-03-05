import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";

export interface DisableMfaVerifyDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 驗證碼輸入錯誤時顯示（由父層傳入，例如 API 400 回傳） */
  error?: string | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
}

export const DisableMfaVerifyDialog: React.FC<DisableMfaVerifyDialogProps> = ({
  open,
  title = "關閉 MFA",
  description = "請輸入目前驗證器上的 6 碼驗證碼以確認關閉 MFA。",
  confirmLabel = "確認關閉",
  cancelLabel = "取消",
  error,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open) {
      setCode("");
    }
  }, [open]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(value);
  };

  const handleConfirm = () => {
    const trimmed = code.trim();
    if (!trimmed || trimmed.length !== 6) return;
    onConfirm(trimmed);
  };

  const canConfirm = code.trim().length === 6 && !loading;

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

        <TextField
          fullWidth
          label="6 碼驗證碼"
          value={code}
          onChange={handleCodeChange}
          placeholder="000000"
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 6,
          }}
          error={!!error}
          helperText={error ?? undefined}
          disabled={loading}
          autoFocus
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
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiFormHelperText-root": { color: "#f44336" },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={loading}
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
          disabled={!canConfirm}
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
