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
    Divider,
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
import { useNotifications } from "@/hooks/useNotifications";

import dayjs from "dayjs";
import type { ElementType } from "react";

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

export const CustomAppBar = (props: AppBarProps) => {
    const { alwaysOn, ...restProps } = props;

    // --- 🔔 通知 Hook ---
    const { notifications, unreadCount, markAsRead } = useNotifications(5000);

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

    // 搜尋相關狀態
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly SearchResult[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    /* =====================================================
     * 🔔 通知點擊處理 (相容 DTO 雙欄位)
     * ===================================================== */
    const handleNotificationClick = async (noti: any) => {
        setNotiAnchor(null);

        // 🚀 修改點：相容後端加了 @JsonProperty("id") 的情況
        const actualId = noti.id || noti.userNotificationId;

        if (!actualId) {
            console.warn("⚠️ 該通知缺少識別 ID (id/userNotificationId):", noti);
            return;
        }

        const success = await markAsRead({ ...noti, userNotificationId: actualId });
        
        if (success && noti.targetId) {
            switch (noti.targetType) {
                case 'purchases':
                    redirect(`/purchases/${noti.targetId}/show`);
                    break;
                case 'expenses':
                    redirect(`/expenses/${noti.targetId}/show`);
                    break;
                case 'orders':
                    redirect(`/orders/${noti.targetId}/show`);
                    break;
                default:
                    console.info("💡 該通知類型無跳轉目標:", noti.targetType);
            }
        }
    };

    /* =====================================================
     * 🔍 搜尋與標題邏輯
     * ===================================================== */
    const periodOptions = useMemo(() => {
        const options = [];
        for (let i = -6; i <= 3; i++) {
            options.push(dayjs().add(i, 'month').format("YYYY-MM"));
        }
        return options;
    }, []);

    const routeMetaMap = useMemo(() => {
        const map: Record<string, { title: string; icon: ElementType }> = {};
        (menuGroups as any[]).forEach((group) => {
            group.items?.forEach((item: any) => {
                const resolvedIcon: ElementType =
                    typeof item.icon?.type === "string" ? CalendarMonthIcon : item.icon?.type ?? CalendarMonthIcon;
                map[item.to] = { title: item.label, icon: resolvedIcon };
            });
        });
        return map;
    }, []);

    const matched = Object.keys(routeMetaMap)
        .filter((p) => pathname.startsWith(p))
        .sort((a, b) => b.length - a.length)[0];

    const activeMeta = matched ? routeMetaMap[matched] : null;
    const ActiveIcon = activeMeta?.icon ?? CalendarMonthIcon;
    const activeTitle = activeMeta?.title ?? "Dashboard";

    // 全局搜尋 Effect
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

                <Box sx={{ display: "flex", alignItems: "center", mr: { xs: 0.5, sm: 2 }, ml: { xs: 0, sm: 1 }, flexShrink: 0 }}>
                    <ActiveIcon sx={{ color: "#fff", mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    {!isMobile && (
                        <Typography sx={{ backgroundColor: "rgba(255,255,255,0.22)", px: 1.5, py: 0.5, borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem", color: "#fff", whiteSpace: "nowrap" }}>
                            {activeTitle}
                        </Typography>
                    )}
                </Box>

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
                    sx={{ ml: { xs: 0.5, md: 3 }, flexGrow: 1, maxWidth: { xs: '160px', sm: '300px', md: '400px' } }}
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
                        // 🚀 修改點：確保 key 被正確傳遞以消除警告
                        <Box component="li" {...props} key={option.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {option.subTitle} {option.type === "進貨" ? `| ${option.type}` : ""}
                            </Typography>
                        </Box>
                    )}
                />

                <Box sx={{ display: "flex", ml: "auto", alignItems: "center", flexShrink: 0 }}>
                    {!isTablet ? (
                        <>
                            <Tooltip title="通知中心">
                                <IconButton onClick={(e) => setNotiAnchor(e.currentTarget)}>
                                    <Badge badgeContent={unreadCount} color="error">
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
                        <IconButton onClick={(e) => setMoreMenuAnchor(e.currentTarget)}>
                            <Badge badgeContent={unreadCount} color="error" variant="dot">
                                <MoreVertIcon sx={{ color: "#fff" }} />
                            </Badge>
                        </IconButton>
                    )}

                    <Tooltip title="使用者選單">
                        <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} sx={{ ml: { xs: 0, sm: 1 } }}>
                            <AccountCircleIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>

            {/* --- 通知清單彈窗 --- */}
            <Menu
                anchorEl={notiAnchor}
                open={Boolean(notiAnchor)}
                onClose={() => setNotiAnchor(null)}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxHeight: 480,
                        mt: 1.5,
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
                        ...getScrollbarStyles(muiTheme)
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>通知中心</Typography>
                    {unreadCount > 0 && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                            {unreadCount} 則未讀
                        </Typography>
                    )}
                </Box>
                <Divider />

                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">目前沒有新通知</Typography>
                    </Box>
                ) : (
                    notifications.map((n) => (
                        <MenuItem
                            // 🚀 關鍵修正點：使用 id 或 userNotificationId 確保 Key 唯一
                            key={n.id || n.userNotificationId}
                            onClick={() => handleNotificationClick(n)}
                            sx={{
                                whiteSpace: 'normal',
                                py: 1.5,
                                px: 2,
                                borderBottom: '1px solid #f0f0f0',
                                '&:hover': { backgroundColor: 'action.hover' }
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{n.title}</Typography>
                                {/* 🚀 優化點：支援 \n 換行 */}
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                    {n.content}
                                </Typography>
                                <Typography variant="caption" color="grey.500" sx={{ mt: 1, display: 'block' }}>
                                    {dayjs(n.createdAt).format("YYYY-MM-DD HH:mm")}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}

                <Divider />
                <MenuItem sx={{ justifyContent: 'center', py: 1 }} onClick={() => { setNotiAnchor(null); redirect('/notifications'); }}>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                        查看全部通知
                    </Typography>
                </MenuItem>
            </Menu>

            {/* --- 平板/手機模式更多選單 --- */}
            <Menu anchorEl={moreMenuAnchor} open={Boolean(moreMenuAnchor)} onClose={() => setMoreMenuAnchor(null)} PaperProps={{ sx: { width: 180, mt: 1 } }}>
                <MenuItem onClick={(e) => { setNotiAnchor(e.currentTarget); setMoreMenuAnchor(null); }}>
                    <ListItemIcon>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon fontSize="small" />
                        </Badge>
                    </ListItemIcon>
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

            {/* --- 會計期間選單 --- */}
            <Menu anchorEl={periodMenuAnchor} open={Boolean(periodMenuAnchor)} onClose={() => setPeriodMenuAnchor(null)} PaperProps={{ sx: { mt: 1, maxHeight: 300, width: '120px', ...getScrollbarStyles(muiTheme) } }}>
                {periodOptions.map((p) => <MenuItem key={p} selected={p === accountingPeriod} onClick={() => { setAccountingPeriod(p); setPeriodMenuAnchor(null); }}>{p}</MenuItem>)}
            </Menu>

            {/* --- 使用者選單 --- */}
            <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
                <MenuItem>個人資料</MenuItem>
                <MenuItem onClick={() => window.location.reload()}>登出</MenuItem>
            </Menu>
        </AppBar>
    );
};