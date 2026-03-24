import { useEffect } from "react";
import type { ComponentProps } from "react";
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

import {
  GenericEditPage,
  type GenericEditToolbarActionProps,
} from "@/components/common/GenericEditPage";
import { FormFieldRow } from "@/components/common/FormFieldRow";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { CurrencyField } from "@/components/money/CurrencyField";

interface OrderRecord {
  id: number;
  orderNo: string;
}

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
      onSuccess={(data) => {
        const order = data as OrderRecord;
        showAlert({
          title: "更新成功",
          message: `已成功更新訂單「${order.orderNo}」`,
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
      {/* 🔹 Header（響應式：手機／平板直立單列、桌面橫向排列） */}
      <Box
        sx={{
          display: "flex",
          // 手機與平板：直向堆疊；桌面 (lg 以上) 才橫向排列
          flexDirection: { xs: "column", lg: "row" },
          flexWrap: "wrap",
          alignItems: { xs: "stretch", lg: "center" },
          gap: { xs: 1.5, lg: 2 },
          mb: 2,
        }}
      >
        {/* 標題列 */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            🧾 編輯訂單資訊
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              size="small"
              label={record.orderStatus}
              color={record.orderStatus === "DELIVERED" ? "success" : "primary"}
            />
            <Chip size="small" label={record.paymentStatus} variant="outlined" />
            {isVoided && <Chip size="small" label="已作廢" color="error" />}
          </Box>
        </Box>

        {/* 編號與客戶名稱（手機時獨立一列） */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            gap: 1,
            fontSize: "0.9rem",
            flex: { sm: 1 },
          }}
        >
          <Box component="span" sx={{ fontWeight: 700 }}>{record.orderNo}</Box>
          {record.customerName && (
            <Box component="span" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ｜{record.customerName}
            </Box>
          )}
        </Box>
      </Box>

      {/* 🔹 主要內容佈局 (響應式：手機/平板單欄，lg 以上雙欄，避免撐爆版面) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr minmax(200px, 380px)" },
          gap: { xs: 2, sm: 3, lg: 4 },
          alignItems: "start",
          minWidth: 0,
        }}
      >
        
        {/* 左側：基本資訊表單（響應式：每欄位直立單列） */}
        <Box 
          sx={(t) => ({ 
            border: `2px solid ${t.palette.divider}`, 
            p: { xs: 1.5, sm: 2, lg: 3 }, 
            borderRadius: 2,
            bgcolor: t.palette.background.paper,
            width: "100%",
            minWidth: 0,
            ...(!editable && { opacity: 0.6, pointerEvents: "none" })
          })}
        >
          <Typography fontWeight={600} mb={2}>📅 訂單基本資訊</Typography>
          <FormFieldRow sx={{ mb: 2 }}>
            <LhDateInput source="orderDate" label="訂單日期" fullWidth disabled={!editable} />
            <LhDateInput source="deliveryDate" label="交貨日期" fullWidth disabled={!editable} />
          </FormFieldRow>
          <FormFieldRow sx={{ "& > *": { gridColumn: "1 / -1" } }}>
            <TextInput
              source="note"
              label="備註"
              fullWidth
              multiline
              minRows={4}
              disabled={!editable}
            />
          </FormFieldRow>
        </Box>

        {/* 右側：狀態與作廢資訊（手機時直立單列） */}
        <Box sx={{ width: "100%", minWidth: 0 }}>
          <Box 
            sx={(t) => ({ 
              border: `2px solid ${t.palette.divider}`, 
              p: { xs: 1.5, sm: 2, lg: 3 }, 
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
type OrderEditToolbarProps = ComponentProps<typeof Toolbar> &
  GenericEditToolbarActionProps;

const OrderEditToolbar = (props: OrderEditToolbarProps) => {
  const { backAction, ...toolbarProps } = props ?? {};
  const record = useRecordContext();
  const redirect = useRedirect();
  
  const isVoided = record?.recordStatus === "VOIDED";
  const editable = record && record.orderStatus !== "DELIVERED" && !isVoided;

  return (
    <Toolbar {...toolbarProps} sx={{ display: "flex", justifyContent: "space-between" }}>
      <Button
        variant="outlined"
        color="success"
        startIcon={<ArrowBackIcon />}
        onClick={backAction ?? (() => redirect("list", "orders"))}
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
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" }, gap: { xs: 2, sm: 3, lg: 4 } }}>
      <Skeleton variant="rounded" height={400} />
      <Box>
        <Skeleton variant="rounded" height={150} />
        <Skeleton variant="rounded" height={140} sx={{ mt: 2 }} />
      </Box>
    </Box>
  </Box>
);