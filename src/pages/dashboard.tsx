import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Dashboard = () => (
  <Card>
    <CardContent>
      <Typography variant="h5">🌿 歡迎使用蓮華 ERP 管理系統</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        使用左側選單進行供應商、進貨、銷售與報表管理。
      </Typography>
    </CardContent>
  </Card>
);

export default Dashboard;
