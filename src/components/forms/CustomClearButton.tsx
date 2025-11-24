import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@mui/material";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

export interface CustomClearButtonProps {
  onClear: (formApi: any) => void;
}

export const CustomClearButton: React.FC<CustomClearButtonProps> = ({
  onClear,
}) => {
  const { setValue, resetField } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        清除
      </Button>

      <GlobalAlertDialog
        open={open}
        title="清除輸入內容"
        description="您確定要清除目前輸入的付款資料？"
        confirmLabel="清除"
        cancelLabel="取消"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);

          // 🔥 呼叫父層提供的清除函式
          onClear({ setValue, resetField });

       
          setTimeout(() => {
            const active = document.activeElement as HTMLElement;
            if (active) active.blur();
          }, 10);
        }}
      />
    </>
  );
};
