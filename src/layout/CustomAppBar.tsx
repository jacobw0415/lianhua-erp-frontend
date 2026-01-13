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
    useMediaQuery,
    ListItemIcon,
    ListItemText,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useColorMode } from "@/contexts/useColorMode";
import { menuGroups } from "@/layout/menuConfig";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";

import dayjs from "dayjs";
import type { ElementType } from "react";

/* =====================================================
 * 🔐 型別與常數定義
 * ===================================================== */
interface SearchResult {
    id: string;
    type: string;
    title: string;
    subTitle?: string;
    url: string;
}

const dummyNotifications = [
    { id: 1, text: "今日有 2 筆進貨尚未付款" },
    { id: 2, text: "永進蛋品帳款超過 7 天未清" },
    { id: 3, text: "本月應付金額達 $175,000" },
];

export const CustomAppBar = (props: AppBarProps) => {
    const { alwaysOn, ...restProps } = props;
    
    const muiTheme = useMuiTheme();
    const [, setRaTheme] = useTheme();
    const { setMode } = useColorMode();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const isDark = muiTheme.palette.mode === "dark";
    const location = useLocation();
    const pathname = location.pathname;

    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(muiTheme.breakpoints.down("md"));

    /* =====================================================
     * 📌 狀態管理
     * ===================================================== */
    const [accountingPeriod, setAccountingPeriod] = useState<string>(dayjs().format("YYYY-MM"));
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState<HTMLElement | null>(null);
    const [notiAnchor, setNotiAnchor] = useState<HTMLElement | null>(null);
    const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);

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
     * 📌 標題解析邏輯
     * ===================================================== */
    const routeMetaMap: Record<string, { title: string; icon: ElementType }> = {};
    (menuGroups as any[]).forEach((group) => {
        group.items?.forEach((item: any) => {
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

    useEffect(() => {
        if (inputValue.trim() === "") {
            setOptions([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await dataProvider.get("global_search", {
                    meta: { keyword: inputValue, period: accountingPeriod, limit: 10 }
                });
                const list = response.data.items || (Array.isArray(response.data) ? response.data : []);
                setOptions(list.map((item: any) => ({
                    id: String(item.id),
                    type: item.type,
                    title: item.title,
                    subTitle: item.subtitle,
                    url: item.route,
                })));
            } catch (err) {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue, accountingPeriod, dataProvider]);

    const handleToggleTheme = () => {
        const next = isDark ? "light" : "dark";
        setMode(next);
        setRaTheme(next);
        setMoreMenuAnchor(null);
    };

    return (
        <AppBar
            {...restProps}
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backdropFilter: "blur(10px)",
                backgroundColor: isDark ? "rgba(46, 125, 50, 0.85)" : "rgba(56, 142, 60, 0.85)",
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
            }}
        >
            <Toolbar sx={{ px: { xs: 0.5, sm: 2 }, height: "52px !important", minHeight: "52px !important" }}>
                <SidebarToggleButton />

                {/* 📌 模組標題區 */}
                <Box sx={{ display: "flex", alignItems: "center", mr: { xs: 0.5, sm: 2 }, ml: { xs: 0, sm: 1 }, flexShrink: 0 }}>
                    <ActiveIcon sx={{ color: "#fff", mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    {!isMobile && (
                        <Typography sx={{ backgroundColor: "rgba(255,255,255,0.22)", px: 1.5, py: 0.5, borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem", color: "#fff", whiteSpace: "nowrap" }}>
                            {activeTitle}
                        </Typography>
                    )}
                </Box>

                {/* 📅 會計期間 */}
                <Box
                    onClick={(e) => setPeriodMenuAnchor(e.currentTarget)}
                    sx={{
                        display: "flex", alignItems: "center", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.22)", px: { xs: 0.8, sm: 1.5 }, py: 0.8, borderRadius: 1.5, color: "#fff", cursor: "pointer", transition: "0.2s",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" }, whiteSpace: "nowrap", mr: { xs: 0.5, sm: 0 }
                    }}
                >
                    <Typography variant="body2" sx={{ mr: 0.2, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {!isMobile ? `📅 ${accountingPeriod}` : `${accountingPeriod.split('-')[1]}月`}
                    </Typography>
                    <ArrowDropDownIcon sx={{ fontSize: '1.1rem' }} />
                </Box>

                {/* 🔍 全域搜尋 - 已還原您原有的所有樣式與屬性 */}
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
                    sx={{ 
                        ml: { xs: 0.5, md: 3 }, 
                        flexGrow: 1, 
                        maxWidth: { xs: '160px', sm: '300px', md: '400px' } 
                    }}
                    slotProps={{
                        paper: { sx: { "& .MuiAutocomplete-listbox": { padding: 0, ...getScrollbarStyles(muiTheme) } } }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={isMobile ? "搜尋..." : "搜尋供應商 / 商品 / 單號..."}
                            sx={{
                                "& .MuiInputBase-root": {
                                    height: "34px", fontSize: "0.85rem", color: "white",
                                    backgroundColor: "rgba(255,255,255,0.22)",
                                    borderRadius: "8px", padding: "0 8px !important",
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
                                    <>{loading ? <CircularProgress color="inherit" size={14} /> : null}{!isMobile && params.InputProps.endAdornment}</>
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

                {/* ⚙️ 右側動作區 */}
                <Box sx={{ display: "flex", ml: "auto", alignItems: "center", flexShrink: 0 }}>
                    {!isTablet ? (
                        <>
                            <Tooltip title="通知中心">
                                <IconButton onClick={(e) => setNotiAnchor(e.currentTarget)}>
                                    <Badge badgeContent={dummyNotifications.length} color="error">
                                        <NotificationsIcon sx={{ color: "#fff" }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <IconButton onClick={handleToggleTheme}>
                                {isDark ? <Brightness7Icon sx={{ color: "#fff" }} /> : <Brightness4Icon sx={{ color: "#fff" }} />}
                            </IconButton>
                            <IconButton><SettingsIcon sx={{ color: "#fff" }} /></IconButton>
                            <IconButton onClick={() => window.location.reload()}><RefreshIcon sx={{ color: "#fff" }} /></IconButton>
                        </>
                    ) : (
                        /* 📱 縮小時顯示的三個小點 */
                        <IconButton onClick={(e) => setMoreMenuAnchor(e.currentTarget)}>
                            <MoreVertIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    )}

                    {/* 👤 個人資料 (永遠在最右邊) */}
                    <Tooltip title="使用者選單">
                        <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} sx={{ ml: { xs: 0, sm: 1 } }}>
                            <AccountCircleIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>

            {/* --- 選單組件 --- */}

            {/* 🆕 更多功能選單 (Tablet/Mobile) */}
            <Menu anchorEl={moreMenuAnchor} open={Boolean(moreMenuAnchor)} onClose={() => setMoreMenuAnchor(null)} PaperProps={{ sx: { width: 180, mt: 1 } }}>
                <MenuItem onClick={(e) => { setNotiAnchor(e.currentTarget); setMoreMenuAnchor(null); }}>
                    <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>通知中心</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleToggleTheme}>
                    <ListItemIcon>{isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}</ListItemIcon>
                    <ListItemText>{isDark ? '淺色模式' : '深色模式'}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setMoreMenuAnchor(null)}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>系統設定</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => window.location.reload()}>
                    <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>重新整理</ListItemText>
                </MenuItem>
            </Menu>

            {/* 原有其他選單 */}
            <Menu anchorEl={periodMenuAnchor} open={Boolean(periodMenuAnchor)} onClose={() => setPeriodMenuAnchor(null)} PaperProps={{ sx: { mt: 1, maxHeight: 300, width: '120px', ...getScrollbarStyles(muiTheme) } }}>
                {periodOptions.map((p) => <MenuItem key={p} selected={p === accountingPeriod} onClick={() => { setAccountingPeriod(p); setPeriodMenuAnchor(null); }}>{p}</MenuItem>)}
            </Menu>

            <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
                <MenuItem>個人資料</MenuItem>
                <MenuItem onClick={() => window.location.reload()}>登出</MenuItem>
            </Menu>

            <Menu anchorEl={notiAnchor} open={Boolean(notiAnchor)} onClose={() => setNotiAnchor(null)} PaperProps={{ sx: { width: 280, ...getScrollbarStyles(muiTheme) } }}>
                <Typography sx={{ p: 1.5, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>通知事項</Typography>
                {dummyNotifications.map((n) => <MenuItem key={n.id} sx={{ whiteSpace: 'normal', py: 1 }}>{n.text}</MenuItem>)}
            </Menu>
        </AppBar>
    );
};