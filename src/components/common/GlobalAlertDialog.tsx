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

  /** 舊版：只顯示訊息 */
  message?: string;

  /** 新版：刪除確認模式 */
  title?: string;
  severity?: "error" | "warning" | "info" | "success";
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;

  onClose: () => void;
  onConfirm?: () => void;   // 若不傳 → 單按鈕模式
}

export const GlobalAlertDialog: React.FC<GlobalAlertDialogProps> = ({
  open,
  message,
  title = "提示",
  description,
  confirmLabel = "確定",
  cancelLabel = "取消",
  onClose,
  onConfirm,
}) => {

  /** ⭐ Enter 鍵關閉 */
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, p: 2 },
      }}
    >
      <DialogContent>
        {/* 標題 */}
        <Typography
          variant="h6"
          sx={{ mb: 1, textAlign: "center", fontWeight: 600 }}
        >
          {title}
        </Typography>

        {/* 文字內容 */}
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          {description || message}
        </Typography>
      </DialogContent>

      {/* 🔥 若有 onConfirm → 顯示兩個按鈕（取消 / 確定） */}
      {onConfirm ? (
        <DialogActions sx={{ justifyContent: "center" }}>
          {/* 取消按鈕 */}
          <Button
            variant="outlined"
            color="inherit"
            onClick={(event) => {
              event.stopPropagation();  // ⛔ 防止 rowClick=edit
              onClose();
            }}
          >
            {cancelLabel}
          </Button>

          {/* 刪除按鈕 */}
          <Button
            variant="contained"
            color="error"
            onClick={(event) => {
              event.stopPropagation();  // ⛔ 防止 rowClick=edit
              onConfirm && onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      ) : (
        /* 原本單按鈕提示模式 */
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button variant="contained" color="primary" onClick={onClose}>
            確定
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
