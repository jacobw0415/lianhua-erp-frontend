import React from 'react';
import {
  SimpleForm,
  Toolbar,
  SaveButton,
  useRedirect,
  useRecordContext,
} from 'react-admin';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * ✅ 通用編輯表單模板（支援 React-Admin 4.14+）
 * - 不包含 transform / onSuccess / onError（改由 <Edit> 控制）
 * - 提供統一 UI 與 Toolbar
 * - 可於不同資源重用
 */
type GenericEditFormProps = {
  children: React.ReactNode;
  resource?: string; // 用於 redirect
};

export const GenericEditForm = ({ children, resource = 'purchases' }: GenericEditFormProps) => {
  const redirect = useRedirect();
  const record = useRecordContext();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '2rem 1rem',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 800,
          borderRadius: 2,
          boxShadow: 2,
          padding: '2rem',
        }}
      >
        <SimpleForm
          record={record}
          toolbar={
            <Toolbar
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                color="success"
                onClick={() => redirect('list', resource)}
              >
                返回
              </Button>
              <SaveButton label="儲存" color="success" />
            </Toolbar>
          }
        >
          {children}
        </SimpleForm>
      </Box>
    </Box>
  );
};
