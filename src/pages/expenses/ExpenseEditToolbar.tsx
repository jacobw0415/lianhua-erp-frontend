import { Toolbar, SaveButton, useRecordContext, useRedirect } from 'react-admin';
import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const ExpenseEditToolbar = (props: any) => {
    const record = useRecordContext();
    const redirect = useRedirect(); // 🚀 取得導航功能
    const isVoided = record?.status === 'VOIDED';

    // 定義統一的返回邏輯
    const handleBack = () => {
        // 返回該資源的列表頁 (例如 /expenses)
        redirect('list', props.resource || 'expenses');
    };

    return (
        <Toolbar {...props} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {/* ⬅️ 左側：永遠顯示的返回按鈕 */}
            <Button
                variant="outlined"
                color="success"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
            >
                返回列表
            </Button>

            {/* ➡️ 右側：根據狀態顯示不同內容 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isVoided ? (
                    // 🛑 作廢狀態提示
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                        <LockIcon sx={{ fontSize: 18, mr: 1 }} />
                        <Typography variant="body2" fontWeight={600}>
                            此單據已作廢，功能已鎖定
                        </Typography>
                    </Box>
                ) : (
                    // ✅ 正常狀態：顯示儲存按鈕
                    <SaveButton label="儲存變更" color="success" />
                )}
            </Box>
        </Toolbar>
    );
};