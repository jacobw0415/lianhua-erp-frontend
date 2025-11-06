// src/pages/dashboard/Dashboard.tsx
import * as React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Dashboard = () => {
    return (
        <Box sx={{ padding: 3 }}>
            {/* 歡迎區 */}
            <Card
                sx={{
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    borderRadius: 3,
                    boxShadow: 3,
                    mb: 3,
                }}
            >
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        🌿 歡迎使用蓮華 ERP 管理系統
                    </Typography>
                    <Typography variant="body1">
                        使用左側選單可快速進行供應商、進貨、銷售與報表管理。
                    </Typography>
                </CardContent>
            </Card>

            {/* 統計卡片區 */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MonetizationOnIcon
                                    sx={{ color: '#43A047', fontSize: 40, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6">
                                        今日營收
                                    </Typography>
                                    <Typography variant="h5">
                                        NT$ 25,600
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ShoppingCartIcon
                                    sx={{ color: '#FB8C00', fontSize: 40, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6">
                                        本月採購
                                    </Typography>
                                    <Typography variant="h5">
                                        NT$ 82,300
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StoreIcon
                                    sx={{ color: '#1E88E5', fontSize: 40, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6">
                                        供應商數量
                                    </Typography>
                                    <Typography variant="h5">
                                        42
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssessmentIcon
                                    sx={{ color: '#8E24AA', fontSize: 40, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6">
                                        淨利趨勢
                                    </Typography>
                                    <Typography variant="h5">
                                        +18%
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
