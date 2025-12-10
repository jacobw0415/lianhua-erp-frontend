import React, { useState } from "react";
import {
    AppBar,
    useTheme,
    useRedirect,
} from "react-admin";

import {
    Box,
    IconButton,
    Tooltip,
    TextField,
    Menu,
    MenuItem,
    Badge,
    Typography,
} from "@mui/material";

import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { useColorMode } from "@/contexts/ColorModeContext";
import { menuGroups } from "@/layout/menuConfig";

import dayjs from "dayjs";


// ------------------------------------------------------------
// 🔰 模擬通知資料
// ------------------------------------------------------------
const dummyNotifications = [
    { id: 1, text: "今日有 2 筆進貨尚未付款" },
    { id: 2, text: "永進蛋品帳款超過 7 天未清" },
    { id: 3, text: "本月應付金額達 $175,000" },
];


// ------------------------------------------------------------
// 🔰 CustomAppBar
// ------------------------------------------------------------
export const CustomAppBar = (props: any) => {
    const muiTheme = useMuiTheme();
    const [_, setRaTheme] = useTheme();
    const { setMode } = useColorMode();
    const redirect = useRedirect();
    const isDark = muiTheme.palette.mode === "dark";

    const location = useLocation();
    const pathname = location.pathname;


    /* =====================================================
     * 📌 Step 1 — 從 menuGroups 產生路由 → { title, icon }
     * ===================================================== */
    const routeMetaMap: Record<string, { title: string; icon: any }> = {};

    menuGroups.forEach((group: any) => {
        group.items?.forEach((item: any) => {
            routeMetaMap[item.to] = {
                title: item.label,
                icon: item.icon?.type || CalendarMonthIcon,
            };
        });
    });

    /* =====================================================
     * 📌 Step 2 — 找出目前最接近的路由（支援子路由）
     * ===================================================== */
    const matched = Object.keys(routeMetaMap)
        .filter((p) => pathname.startsWith(p))
        .sort((a, b) => b.length - a.length)[0];

    const activeMeta = matched ? routeMetaMap[matched] : null;
    const ActiveIcon = activeMeta?.icon || CalendarMonthIcon;
    const activeTitle = activeMeta?.title || "未命名頁面";


    /* =====================================================
     * 🌙 主題切換
     * ===================================================== */
    const handleToggleTheme = () => {
        const next = isDark ? "light" : "dark";
        setMode(next);
        setRaTheme(next);
    };


    /* =====================================================
     * 📅 會計期間切換
     * ===================================================== */
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState<null | HTMLElement>(null);
    const [accountingPeriod, setAccountingPeriod] = useState(dayjs().format("YYYY-MM"));

    const openPeriodMenu = (e: any) => setPeriodMenuAnchor(e.currentTarget);
    const closePeriodMenu = () => setPeriodMenuAnchor(null);

    const handlePeriodChange = (period: string) => {
        setAccountingPeriod(period);
        closePeriodMenu();
    };

    const periodList = [
        dayjs().subtract(1, "month").format("YYYY-MM"),
        dayjs().format("YYYY-MM"),
        dayjs().add(1, "month").format("YYYY-MM"),
    ];


    /* =====================================================
     * 🔍 全域搜尋
     * ===================================================== */
    const [searchText, setSearchText] = useState("");

    const handleGlobalSearch = (e: any) => {
        if (e.key === "Enter" && searchText.trim()) {
            redirect(`/suppliers?search=${searchText}`);
        }
    };


    /* =====================================================
     * 🔔 通知中心
     * ===================================================== */
    const [notiAnchor, setNotiAnchor] = useState<null | HTMLElement>(null);
    const openNoti = (e: any) => setNotiAnchor(e.currentTarget);
    const closeNoti = () => setNotiAnchor(null);


    /* =====================================================
     * 👤 使用者選單
     * ===================================================== */
    const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
    const openUserMenu = (e: any) => setUserAnchor(e.currentTarget);
    const closeUserMenu = () => setUserAnchor(null);



    /* =====================================================
     * 🎨 AppBar UI
     * ===================================================== */
    return (
        <AppBar
            {...props}
            color="inherit"
            toolbar={<></>}   // ❗移除預設 Refresh
            elevation={0}
            sx={{
                backdropFilter: "blur(10px)",
                backgroundColor: isDark
                    ? "rgba(42, 61, 42, 0.85)"   // 深色玻璃
                    : "rgba(76, 175, 80, 0.85)", // 亮色玻璃
                paddingLeft: 2,
                paddingRight: 1,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                boxShadow: isDark
                    ? "0 2px 10px rgba(0,0,0,0.4)"
                    : "0 2px 10px rgba(0,0,0,0.15)",
                transition: "background-color 0.25s ease, backdrop-filter 0.25s ease",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>


                {/* ----------------------------------------------
                 * ⭐ 動態 Icon + 動態 Title（自動依路由切換）
                 * ---------------------------------------------- */}
                <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                    <ActiveIcon sx={{ color: "#fff", mr: 1 }} />
                    <Typography
                        sx={{
                            backgroundColor: isDark
                                ? "rgba(255,255,255,0.18)"
                                : "rgba(255,255,255,0.25)",
                            padding: "5px 14px",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "1.05rem",
                            color: "#fff",
                        }}
                    >
                        {activeTitle}
                    </Typography>
                </Box>


                {/* ----------------------------------------------
                 * 📅 會計期間膠囊
                 * ---------------------------------------------- */}
                <Box
                    onClick={openPeriodMenu}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "rgba(255,255,255,0.22)",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        color: "#fff",
                        cursor: "pointer",
                        mr: 3,
                    }}
                >
                    <Typography sx={{ mr: 1 }}>📅 {accountingPeriod}</Typography>
                    <ArrowDropDownIcon />
                </Box>

                <Menu anchorEl={periodMenuAnchor} open={Boolean(periodMenuAnchor)} onClose={closePeriodMenu}>
                    {periodList.map((p) => (
                        <MenuItem key={p} onClick={() => handlePeriodChange(p)}>
                            {p}
                        </MenuItem>
                    ))}
                </Menu>


                {/* ----------------------------------------------
                 * 🔍 全域搜尋
                 * ---------------------------------------------- */}
                <TextField
                    placeholder="搜尋供應商 / 商品 / 單號..."
                    variant="outlined"
                    size="small"
                    sx={{
                        width: "320px",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        mr: 2,
                        "& .MuiOutlinedInput-root": {
                            paddingLeft: "8px",
                            height: "36px",
                        },
                    }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleGlobalSearch}
                />


                {/* ----------------------------------------------
                 * 🔘 右側按鈕群組
                 * ---------------------------------------------- */}
                <Box sx={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>

                    {/* 🔔 通知 */}
                    <Tooltip title="通知中心">
                        <IconButton color="inherit" onClick={openNoti}>
                            <Badge badgeContent={dummyNotifications.length} color="error">
                                <NotificationsIcon sx={{ color: "#fff" }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Menu anchorEl={notiAnchor} open={Boolean(notiAnchor)} onClose={closeNoti}>
                        {dummyNotifications.map((n) => (
                            <MenuItem key={n.id}>{n.text}</MenuItem>
                        ))}
                    </Menu>


                    {/* 👤 使用者 */}
                    <Tooltip title="使用者選單">
                        <IconButton color="inherit" onClick={openUserMenu}>
                            <AccountCircleIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>

                    <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={closeUserMenu}>
                        <MenuItem>個人資料</MenuItem>
                        <MenuItem>偏好設定</MenuItem>
                        <MenuItem>登出</MenuItem>
                    </Menu>


                    {/* 🌙 暗亮切換 */}
                    <Tooltip title={isDark ? "切換為亮色" : "切換為暗色"}>
                        <IconButton onClick={handleToggleTheme}>
                            {isDark ? (
                                <Brightness7Icon sx={{ color: "#fff" }} />
                            ) : (
                                <Brightness4Icon sx={{ color: "#fff" }} />
                            )}
                        </IconButton>
                    </Tooltip>


                    {/* ⚙️ 系統設定 */}
                    <Tooltip title="系統設定">
                        <IconButton color="inherit">
                            <SettingsIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>


                    {/* 🔄 自訂 Refresh */}
                    <Tooltip title="重新整理">
                        <IconButton color="inherit" onClick={() => window.location.reload()}>
                            <RefreshIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </AppBar>
    );
};