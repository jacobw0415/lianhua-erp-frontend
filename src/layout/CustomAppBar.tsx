import { useState, useMemo, useEffect } from "react";
import {
    useTheme,
    useRedirect,
    SidebarToggleButton,
    useDataProvider,
    type AppBarProps,
} from "react-admin";

import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Tooltip,
    TextField,
    Menu,
    MenuItem,
    Badge,
    Typography,
    Autocomplete,
    CircularProgress,
} from "@mui/material";

import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";

// Icons
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";

import { useColorMode } from "@/contexts/useColorMode";
import { menuGroups } from "@/layout/menuConfig";

import dayjs from "dayjs";
import type { ReactElement, ElementType } from "react";

/* =====================================================
 * 🔐 型別定義
 * ===================================================== */
interface SearchResult {
    id: string;
    type: string;
    title: string;
    subTitle?: string;
    url: string;
}

interface MenuItemMeta {
    to: string;
    label: string;
    icon?: ReactElement;
}

interface MenuGroupMeta {
    items?: MenuItemMeta[];
}

const dummyNotifications = [
    { id: 1, text: "今日有 2 筆進貨尚未付款" },
    { id: 2, text: "永進蛋品帳款超過 7 天未清" },
    { id: 3, text: "本月應付金額達 $175,000" },
];

export const CustomAppBar = (props: AppBarProps) => {
    const muiTheme = useMuiTheme();
    const [, setRaTheme] = useTheme();
    const { setMode } = useColorMode();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const isDark = muiTheme.palette.mode === "dark";
    const location = useLocation();
    const pathname = location.pathname;

    /* =====================================================
     * 📌 狀態管理：月份與搜尋
     * ===================================================== */
    const [accountingPeriod, setAccountingPeriod] = useState<string>(dayjs().format("YYYY-MM"));
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState<HTMLElement | null>(null);
    
    // 🚀 動態生成月份選項 (當前月份的前 6 個月到後 3 個月)
    const periodOptions = useMemo(() => {
        const options = [];
        for (let i = -6; i <= 3; i++) {
            options.push(dayjs().add(i, 'month').format("YYYY-MM"));
        }
        return options;
    }, []);

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly SearchResult[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    /* =====================================================
     * 📌 路由解析邏輯
     * ===================================================== */
    const routeMetaMap: Record<string, { title: string; icon: ElementType }> = {};
    (menuGroups as MenuGroupMeta[]).forEach((group) => {
        group.items?.forEach((item) => {
            const resolvedIcon: ElementType =
                typeof item.icon?.type === "string" ? CalendarMonthIcon : item.icon?.type ?? CalendarMonthIcon;
            routeMetaMap[item.to] = { title: item.label, icon: resolvedIcon };
        });
    });

    const matched = Object.keys(routeMetaMap)
        .filter((p) => pathname.startsWith(p))
        .sort((a, b) => b.length - a.length)[0];

    const activeMeta = matched ? routeMetaMap[matched] : null;
    const ActiveIcon = activeMeta?.icon ?? CalendarMonthIcon;
    const activeTitle = activeMeta?.title ?? "Dashboard";

    /* =====================================================
     * 🔍 全域搜尋實作 (當關鍵字或月份改變時觸發)
     * ===================================================== */
    useEffect(() => {
        if (inputValue.trim() === "") {
            setOptions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await dataProvider.get("global_search", {
                    meta: {
                        keyword: inputValue,
                        period: accountingPeriod, // ✅ 將目前的會計期間帶入 API
                        limit: 10
                    }
                });

                const rawData = response.data;
                const list = rawData.items || (Array.isArray(rawData) ? rawData : []);

                const formattedResults = list.map((item: any) => ({
                    id: String(item.id),
                    type: item.type,
                    title: item.title,
                    subTitle: item.subtitle,
                    url: item.route,
                }));

                setOptions(formattedResults);
            } catch (err) {
                console.error("搜尋連線失敗:", err);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inputValue, accountingPeriod, dataProvider]); // ✅ 當月份改變時也會重新搜尋

    /* =====================================================
     * 🌙 事件處理
     * ===================================================== */
    const handleToggleTheme = () => {
        const next = isDark ? "light" : "dark";
        setMode(next);
        setRaTheme(next);
    };

    const handlePeriodChange = (period: string) => {
        setAccountingPeriod(period);
        setPeriodMenuAnchor(null);
    };

    const [notiAnchor, setNotiAnchor] = useState<HTMLElement | null>(null);
    const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);

    return (
        <>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                className={props.className}
                sx={{
                    top: 0,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backdropFilter: "blur(10px)",
                    backgroundColor: isDark ? "rgba(46, 125, 50, 0.85)" : "rgba(56, 142, 60, 0.85)",
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    padding: 0,
                }}
            >
                <Toolbar sx={{ paddingRight: 2, height: "52px !important", minHeight: "52px !important" }}>
                    <SidebarToggleButton />

                    <Box sx={{ display: "flex", alignItems: "center", mr: 2, ml: 1 }}>
                        <ActiveIcon sx={{ color: "#fff", mr: 1 }} />
                        <Typography
                            sx={{
                                backgroundColor: "rgba(255,255,255,0.22)",
                                padding: "4px 14px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                color: "#fff",
                            }}
                        >
                            {activeTitle}
                        </Typography>
                    </Box>

                    {/* 📅 會計期間選擇器 */}
                    <Box
                        onClick={(e) => setPeriodMenuAnchor(e.currentTarget)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            px: 1.5, py: 0.5, borderRadius: 1.5,
                            color: "#fff", cursor: "pointer",
                            transition: "0.2s",
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" }
                        }}
                    >
                        <Typography variant="body2" sx={{ mr: 0.5, fontWeight: 500 }}>
                            📅 {accountingPeriod}
                        </Typography>
                        {/* ✅ 修正處： size="small" 改為 fontSize="small" */}
                        <ArrowDropDownIcon fontSize="small" />
                    </Box>

                    <Menu
                        anchorEl={periodMenuAnchor}
                        open={Boolean(periodMenuAnchor)}
                        onClose={() => setPeriodMenuAnchor(null)}
                        PaperProps={{ sx: { mt: 1, maxHeight: 300 } }}
                    >
                        {periodOptions.map((period) => (
                            <MenuItem 
                                key={period} 
                                selected={period === accountingPeriod}
                                onClick={() => handlePeriodChange(period)}
                            >
                                {period}
                            </MenuItem>
                        ))}
                    </Menu>

                    <Autocomplete
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        inputValue={inputValue}
                        onInputChange={(_, val) => setInputValue(val)}
                        options={options}
                        loading={loading}
                        filterOptions={(x) => x}
                        groupBy={(option) => option.type}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
                        onChange={(_, val) => val && redirect(val.url)}
                        sx={{ ml: 3 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="搜尋供應商 / 商品 / 單號..."
                                sx={{
                                    width: { xs: 180, md: 350 },
                                    "& .MuiInputBase-root": {
                                        height: "34px",
                                        fontSize: "0.85rem",
                                        color: "white",
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        borderRadius: "8px",
                                        padding: "0 12px !important",
                                        "& fieldset": { border: "none" },
                                        "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                                        "&.Mui-focused": { backgroundColor: "rgba(255,255,255,0.35)" }
                                    },
                                    "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.75)", opacity: 1 }
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <SearchIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 18, mr: 0.5 }} />,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={14} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.subTitle} {option.type === "進貨" ? `| ${option.type}` : ""}
                                </Typography>
                            </Box>
                        )}
                    />

                    <Box sx={{ display: "flex", ml: "auto", alignItems: "center" }}>
                        <Tooltip title="通知中心">
                            <IconButton onClick={(e) => setNotiAnchor(e.currentTarget)}>
                                <Badge badgeContent={dummyNotifications.length} color="error">
                                    <NotificationsIcon sx={{ color: "#fff" }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Menu anchorEl={notiAnchor} open={Boolean(notiAnchor)} onClose={() => setNotiAnchor(null)}>
                            {dummyNotifications.map((n) => <MenuItem key={n.id}>{n.text}</MenuItem>)}
                        </Menu>

                        <Tooltip title="使用者選單">
                            <IconButton onClick={(e) => setUserAnchor(e.currentTarget)}>
                                <AccountCircleIcon sx={{ color: "#fff" }} />
                            </IconButton>
                        </Tooltip>
                        <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
                            <MenuItem>個人資料</MenuItem>
                            <MenuItem onClick={() => window.location.reload()}>登出</MenuItem>
                        </Menu>

                        <Tooltip title={isDark ? "切換為亮色" : "切換為暗色"}>
                            <IconButton onClick={handleToggleTheme}>
                                {isDark ? <Brightness7Icon sx={{ color: "#fff" }} /> : <Brightness4Icon sx={{ color: "#fff" }} />}
                            </IconButton>
                        </Tooltip>
                        <IconButton><SettingsIcon sx={{ color: "#fff" }} /></IconButton>
                        <IconButton onClick={() => window.location.reload()}><RefreshIcon sx={{ color: "#fff" }} /></IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ height: 5, width: '100%' }} />
        </>
    );
};