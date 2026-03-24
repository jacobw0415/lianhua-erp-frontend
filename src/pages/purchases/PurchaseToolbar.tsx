import { Toolbar, SaveButton, useRecordContext, useRedirect } from 'react-admin';
import type { ComponentProps } from "react";
import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { GenericEditToolbarActionProps } from "@/components/common/GenericEditPage";

type PurchaseToolbarProps = ComponentProps<typeof Toolbar> &
    GenericEditToolbarActionProps;

export const PurchaseToolbar = (props: PurchaseToolbarProps) => {
    const { deleteAction, ...toolbarProps } = props ?? {};
    const record = useRecordContext();
    const redirect = useRedirect();
    // 🚀 判斷狀態是否為作廢
    const isVoided = record?.status === 'VOIDED';

    return (
        <Toolbar {...toolbarProps} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {/* ⬅️ 左側：永遠顯示返回列表按鈕 */}
            <Button
                variant="outlined"
                color="success"
                startIcon={<ArrowBackIcon />}
                onClick={() => redirect('list', 'purchases')}
            >
                返回列表
            </Button>

            {/* ➡️ 右側：根據狀態切換操作 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isVoided ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                        <LockIcon sx={{ fontSize: 18, mr: 1 }} />
                        <Typography variant="body2" fontWeight={600}>
                            此單據已作廢，功能已鎖定
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* 只有非作廢狀態才渲染刪除按鈕 */}
                        <Button
                            variant="contained"
                            color="error"
                            onClick={deleteAction}
                        >
                            刪除
                        </Button>
                        <SaveButton label="儲存變更" color="success" />
                    </Box>
                )}
            </Box>
        </Toolbar>
    );
};