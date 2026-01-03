import { useState } from "react";
import {
    AppBar,
    useTheme,
    useRedirect,
    type AppBarProps,
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

import { useColorMode } from "@/contexts/useColorMode";
import { menuGroups } from "@/layout/menuConfig";
import { dashboardColors } from "@/theme/LianhuaTheme";

import dayjs from "dayjs";
import type { ReactElement, ElementType } from "react";

/* =====================================================
 * 🔐 型別定義（只補型別，不影響結構）
 * ===================================================== */
interface MenuItemMeta {
    to: string;
    label: string;
    icon?: ReactElement;
}

interface MenuGroupMeta {
    items?: MenuItemMeta[];
}

/* ------------------------------------------------------------
 * 🔰 模擬通知資料
 * ------------------------------------------------------------ */
const dummyNotifications: { id: number; text: string }[] = [
    { id: 1, text: "今日有 2 筆進貨尚未付款" },
    { id: 2, text: "永進蛋品帳款超過 7 天未清" },
    { id: 3, text: "本月應付金額達 $175,000" },
];

/* ------------------------------------------------------------
 * 🔰 CustomAppBar
 * ------------------------------------------------------------ */
export const CustomAppBar = (props: AppBarProps) => {
    const muiTheme = useMuiTheme();
    const [, setRaTheme] = useTheme();
    const { setMode } = useColorMode();
    const redirect = useRedirect();
    const isDark = muiTheme.palette.mode === "dark";

    const location = useLocation();
    const pathname = location.pathname;

    /* =====================================================
     * 📌 Step 1 — 從 menuGroups 產生 route meta
     * ===================================================== */
    const routeMetaMap: Record<
        string,
        { title: string; icon: ElementType }
    > = {};

    (menuGroups as MenuGroupMeta[]).forEach((group) => {
        group.items?.forEach((item) => {
            const resolvedIcon: ElementType =
                typeof item.icon?.type === "string"
                    ? CalendarMonthIcon
                    : item.icon?.type ?? CalendarMonthIcon;

            routeMetaMap[item.to] = {
                title: item.label,
                icon: resolvedIcon,
            };
        });
    });

    /* =====================================================
     * 📌 Step 2 — 取得目前路由對應資料
     * ===================================================== */
    const matched = Object.keys(routeMetaMap)
        .filter((p) => pathname.startsWith(p))
        .sort((a, b) => b.length - a.length)[0];

    const activeMeta = matched ? routeMetaMap[matched] : null;
    const ActiveIcon = activeMeta?.icon ?? CalendarMonthIcon;
    const activeTitle = activeMeta?.title ?? "未命名頁面";

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
    const [periodMenuAnchor, setPeriodMenuAnchor] =
        useState<HTMLElement | null>(null);
    const [accountingPeriod, setAccountingPeriod] =
        useState<string>(dayjs().format("YYYY-MM"));

    const openPeriodMenu = (e: React.MouseEvent<HTMLElement>) =>
        setPeriodMenuAnchor(e.currentTarget);
    const closePeriodMenu = () => setPeriodMenuAnchor(null);

    const handlePeriodChange = (period: string) => {
        setAccountingPeriod(period);
        closePeriodMenu();
    };

    const periodList: string[] = [
        dayjs().subtract(1, "month").format("YYYY-MM"),
        dayjs().format("YYYY-MM"),
        dayjs().add(1, "month").format("YYYY-MM"),
    ];

    /* =====================================================
     * 🔍 全域搜尋
     * ===================================================== */
    const [searchText, setSearchText] = useState<string>("");

    const handleGlobalSearch = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter" && searchText.trim()) {
            redirect(`/suppliers?search=${searchText}`);
        }
    };

    /* =====================================================
     * 🔔 通知中心
     * ===================================================== */
    const [notiAnchor, setNotiAnchor] =
        useState<HTMLElement | null>(null);
    const openNoti = (e: React.MouseEvent<HTMLElement>) =>
        setNotiAnchor(e.currentTarget);
    const closeNoti = () => setNotiAnchor(null);

    /* =====================================================
     * 👤 使用者選單
     * ===================================================== */
    const [userAnchor, setUserAnchor] =
        useState<HTMLElement | null>(null);
    const openUserMenu = (e: React.MouseEvent<HTMLElement>) =>
        setUserAnchor(e.currentTarget);
    const closeUserMenu = () => setUserAnchor(null);

    /* =====================================================
     * 🎨 AppBar UI
     * ===================================================== */
    return (
        <AppBar
            {...props}
            color="inherit"
            toolbar={null}
            elevation={0}
            sx={{
                backdropFilter: "blur(10px)",
                backgroundColor: isDark
                    ? "rgba(46, 125, 50, 0.85)" // #2E7D32 帶透明度
                    : "rgba(56, 142, 60, 0.85)", // #388E3C 帶透明度
                paddingLeft: 2,
                paddingRight: 1,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                boxShadow: isDark
                    ? "0 2px 10px rgba(0,0,0,0.4)"
                    : "0 2px 10px rgba(0,0,0,0.15)",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                {/* ⭐ 動態 Icon + Title */}
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

                {/* 📅 會計期間 */}
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
                    <Typography sx={{ mr: 1 }}>
                        📅 {accountingPeriod}
                    </Typography>
                    <ArrowDropDownIcon />
                </Box>

                <Menu
                    anchorEl={periodMenuAnchor}
                    open={Boolean(periodMenuAnchor)}
                    onClose={closePeriodMenu}
                >
                    {periodList.map((p) => (
                        <MenuItem
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                        >
                            {p}
                        </MenuItem>
                    ))}
                </Menu>

                {/* 🔍 搜尋 */}
                <TextField
                    placeholder="搜尋供應商 / 商品 / 單號..."
                    variant="outlined"
                    size="small"
                    sx={{
                        width: "320px",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        mr: 2,
                    }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleGlobalSearch}
                />

                {/* 右側操作 */}
                <Box sx={{ display: "flex", ml: "auto" }}>
                    <Tooltip title="通知中心">
                        <IconButton onClick={openNoti}>
                            <Badge
                                badgeContent={dummyNotifications.length}
                                color="error"
                            >
                                <NotificationsIcon sx={{ color: "#fff" }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={notiAnchor}
                        open={Boolean(notiAnchor)}
                        onClose={closeNoti}
                    >
                        {dummyNotifications.map((n) => (
                            <MenuItem key={n.id}>{n.text}</MenuItem>
                        ))}
                    </Menu>

                    <Tooltip title="使用者選單">
                        <IconButton onClick={openUserMenu}>
                            <AccountCircleIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={userAnchor}
                        open={Boolean(userAnchor)}
                        onClose={closeUserMenu}
                    >
                        <MenuItem>個人資料</MenuItem>
                        <MenuItem>偏好設定</MenuItem>
                        <MenuItem>登出</MenuItem>
                    </Menu>

                    <Tooltip title={isDark ? "切換為亮色" : "切換為暗色"}>
                        <IconButton onClick={handleToggleTheme}>
                            {isDark ? (
                                <Brightness7Icon sx={{ color: "#fff" }} />
                            ) : (
                                <Brightness4Icon sx={{ color: "#fff" }} />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="系統設定">
                        <IconButton>
                            <SettingsIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="重新整理">
                        <IconButton onClick={() => window.location.reload()}>
                            <RefreshIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </AppBar>
    );
};