import { useEffect } from "react";
import {
  TextInput,
  useRecordContext,
  useRedirect,
  Toolbar,
  SaveButton,
} from "react-admin";
import {
  Box,
  Typography,
  Chip,
  Alert,
  useTheme,
  Button,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { CurrencyField } from "@/components/money/CurrencyField";

/* =======================================================
 * 📄 OrderEdit 主頁
 * ======================================================= */
export const OrderEdit = () => {
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <GenericEditPage
      resource="orders"
      title="訂單管理"
      width="970px"
      toolbar={<OrderEditToolbar />}
      onSuccess={(data: any) => {
        showAlert({
          title: "更新成功",
          message: `已成功更新訂單「${data.orderNo}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "orders"), 500);
      }}
    >
      <OrderFormFields />
    </GenericEditPage>
  );
};

/* =======================================================
 * 📌 主內容區
 * ======================================================= */
const OrderFormFields = () => {
  const record = useRecordContext();

  // 若 record 尚未載入，顯示 Skeleton
  if (!record) return <OrderSkeleton />;

  // 直接使用後端同步過來的 recordStatus 欄位
  const isVoided = record.recordStatus === "VOIDED";
  // 如果已交付或已作廢，則鎖定編輯
  const editable = record.orderStatus !== "DELIVERED" && !isVoided;

  return (
    <Box>
      {/* 🔹 Header Row (響應式：手機單欄、電腦雙欄) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 580px) 1fr" },
          gap: { xs: 1, sm: 0 },
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 1 }}>
            🧾 編輯訂單資訊
          </Typography>
          
          {/* 所有 Chips 移到這裡 */}
          <Chip
            size="small"
            label={record.orderStatus}
            color={record.orderStatus === "DELIVERED" ? "success" : "primary"}
          />
          <Chip size="small" label={record.paymentStatus} variant="outlined" />
          {isVoided && <Chip size="small" label="已作廢" color="error" />}
        </Box>

        {/* 右側僅保留編號與客戶名稱 */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1, fontSize: "0.9rem" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>{record.orderNo}</Box>
          {record.customerName && (
            <Box component="span" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ｜{record.customerName}
            </Box>
          )}
        </Box>
      </Box>

      {/* 🔹 主要內容佈局 (響應式：手機單欄、電腦雙欄) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 380px" },
          gap: 4,
          alignItems: "start",
        }}
      >
        
        {/* 左側：基本資訊表單 (1fr 彈性寬度) */}
        <Box 
          sx={(t) => ({ 
            border: `2px solid ${t.palette.divider}`, 
            p: 3, 
            borderRadius: 2,
            bgcolor: t.palette.background.paper,
            ...(!editable && { opacity: 0.6, pointerEvents: "none" })
          })}
        >
          <Typography fontWeight={600} mb={2}>📅 訂單基本資訊</Typography>
          <LhDateInput source="orderDate" label="訂單日期" fullWidth disabled={!editable} />
          <Box sx={{ mt: 2 }} />
          <LhDateInput source="deliveryDate" label="交貨日期" fullWidth disabled={!editable} />
          <TextInput
            source="note"
            label="備註"
            fullWidth
            multiline
            minRows={4}
            disabled={!editable}
            sx={{ mt: 2 }}
          />
        </Box>

        {/* 右側：狀態與作廢資訊 (固定 380px) */}
        <Box>
          <Box 
            sx={(t) => ({ 
              border: `2px solid ${t.palette.divider}`, 
              p: 3, 
              borderRadius: 2,
              bgcolor: t.palette.background.paper,
            })}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, backgroundColor: "#9d99995b", borderRadius: "5px", px: 1 }}>
              💰 訂單財務摘要
            </Typography>
            
            <Typography sx={{ px: 1, mb: 1 }}>
              總金額：<b><CurrencyField source="totalAmount" /></b>
            </Typography>
            
            <Alert 
              severity={isVoided ? "error" : (record.paymentStatus === "PAID" ? "success" : "info")}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              狀態：<strong>{isVoided ? "訂單已作廢" : record.paymentStatus}</strong>
            </Alert>
          </Box>

          {/* ⚠️ 作廢資訊顯示區 */}
          {isVoided && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "8px",
                bgcolor: "rgba(33, 22, 10, 0.9)", 
                border: "1px solid rgba(255, 165, 0, 0.5)",
              }}
            >
              <Typography sx={{ color: "#FFB74D", fontWeight: "bold", mb: 1 }}>
                ⚠️ 此訂單已執行作廢程序
              </Typography>
              <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 1 }}>
                作廢時間：{record.voidedAt || "未紀錄"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 1, mt: 0.5 }}>
                作廢原因：{record.voidReason || "無"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#FFB74D", ml: 1, mt: 1, fontSize: '0.75rem' }}>
                * 系統已鎖定此單據，如需修改請重新建立。
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/* =======================================================
 * 🛠 輔助元件：Toolbar & Skeleton
 * ======================================================= */
const OrderEditToolbar = (props: any) => {
  const record = useRecordContext();
  const redirect = useRedirect();
  
  const isVoided = record?.recordStatus === "VOIDED";
  const editable = record && record.orderStatus !== "DELIVERED" && !isVoided;

  return (
    <Toolbar {...props} sx={{ display: "flex", justifyContent: "space-between" }}>
      <Button
        variant="outlined"
        color="success"
        startIcon={<ArrowBackIcon />}
        onClick={() => redirect("list", "orders")}
      >
        返回列表
      </Button>

      {editable && <SaveButton label="儲存變更" color="success" />}
    </Toolbar>
  );
};

const OrderSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 380px" }, gap: 4 }}>
      <Skeleton variant="rounded" height={400} />
      <Box>
        <Skeleton variant="rounded" height={150} />
        <Skeleton variant="rounded" height={140} sx={{ mt: 2 }} />
      </Box>
    </Box>
  </Box>
);