import { Typography, Box, Alert, Button } from "@mui/material";
import {
  TextInput,
  SelectInput,
  useRecordContext,
  useRedirect,
  Toolbar,
  SaveButton,
} from "react-admin";
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useActiveExpenseCategories } from "@/hooks/useActiveExpenseCategories";
import { useActiveEmployees } from "@/hooks/useActiveEmployees";

/* -------------------------------------------------------
 * 🛠️ 自定義 Toolbar：移除刪除按鈕，並根據狀態切換
 * ------------------------------------------------------- */
const ExpenseEditToolbar = (props: any) => {
    const record = useRecordContext();
    const redirect = useRedirect();
    const isVoided = record?.status === 'VOIDED';

    const handleBack = () => {
        redirect('list', props.resource || 'expenses');
    };

    return (
        <Toolbar {...props} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
                variant="outlined"
                color="success"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
            >
                返回列表
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isVoided ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                        <LockIcon sx={{ fontSize: 18, mr: 1 }} />
                        <Typography variant="body2" fontWeight={600}>
                            此單據已作廢，功能已鎖定
                        </Typography>
                    </Box>
                ) : (
                    <SaveButton label="儲存備註" color="success" />
                )}
            </Box>
        </Toolbar>
    );
};

/* -------------------------------------------------------
 * ⭐ 支出紀錄編輯頁面
 * ------------------------------------------------------- */
export const ExpenseEdit: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="expenses"
      title="編輯支出紀錄"
      width="700px"
      /* 透過 toolbar 屬性傳入自定義組件，徹底移除刪除按鈕 */
      toolbar={<ExpenseEditToolbar />}
      onSuccess={() => {
        showAlert({
          title: "更新成功",
          message: `已更新備註資訊`,
          severity: "success",
          hideCancel: true,
        });
        redirect("list", "expenses");
      }}
    >
      <ExpenseFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 支出紀錄欄位 (修正顯示邏輯)
 * ------------------------------------------------------- */
const ExpenseFormFields: React.FC = () => {
  const record = useRecordContext();
  const { categories, loading: categoriesLoading } = useActiveExpenseCategories();
  const { employees, loading: employeesLoading } = useActiveEmployees();

  if (!record) return null;

  const isVoided = record.status === 'VOIDED';

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        💰 支出紀錄資訊 <Typography variant="caption" color="text.secondary">(唯讀)</Typography>
      </Typography>

      {isVoided && (
        <Alert severity="error" sx={{ mb: 2 }}>
            此支出紀錄已作廢，無法修改任何內容。
        </Alert>
      )}

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          {/* 支出日期：唯讀 */}
          <LhDateInput source="expenseDate" label="支出日期" disabled fullWidth />

          {/* 費用類別：唯讀，確保 choices 包含目前的 record 資料 */}
          <SelectInput
            source="categoryId"
            label="費用類別"
            choices={categories}
            optionText="name"
            optionValue="id"
            fullWidth
            isLoading={categoriesLoading}
            disabled
          />

          {/* 金額：唯讀 */}
          <TextInput source="amount" label="支出金額" fullWidth disabled />

          {/* 員工：唯讀 */}
          <SelectInput
            source="employeeId"
            label="關聯員工"
            choices={employees}
            optionText="name"
            optionValue="id"
            fullWidth
            isLoading={employeesLoading}
            disabled
            emptyText="無關聯員工"
          />
        </Box>

        {/* 備註：唯一可編輯欄位 */}
        <Box mb={2}>
          <TextInput
            source="note"
            label="備註 (可修改)"
            multiline
            minRows={3}
            fullWidth
            disabled={isVoided}
          />
          <Typography variant="caption" color="text.secondary">
            ※ 僅備註欄位可進行異動儲存
          </Typography>
        </Box>
      </Box>
    </>
  );
};