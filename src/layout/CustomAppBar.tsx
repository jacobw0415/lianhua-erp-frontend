import { useState, useMemo, useEffect, useRef } from "react";
import {
    useTheme,
    useRedirect,
    SidebarToggleButton,
    useDataProvider,
    useLogout,
    useGetIdentity,
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
    ListItemIcon,
    ListItemText,
    Divider,
    alpha,
} from "@mui/material";

import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";

// Icons
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import LogoutIcon from "@mui/icons-material/Logout";

import { useColorMode } from "@/contexts/useColorMode";
import { menuGroups } from "@/layout/menuConfig";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import { useNotifications } from "@/hooks/useNotifications";
import { useIsMobile, useIsSmallScreen } from "@/hooks/useIsMobile";
import { Z_INDEX, APP_BAR_HEIGHT } from "@/constants/layoutConstants";

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
    const logout = useLogout();
    const { data: identity } = useGetIdentity();
    const isDark = muiTheme.palette.mode === "dark";
    const location = useLocation();
    const pathname = location.pathname;

    // 使用專案統一的 RWD hooks
    const isMobile = useIsMobile();
    const isSmallScreen = useIsSmallScreen();

    /* =====================================================
     * 📌 狀態管理
     * ===================================================== */
    const [accountingPeriod, setAccountingPeriod] = useState<string>(dayjs().format("YYYY-MM"));
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState<HTMLElement | null>(null);
    const periodButtonRef = useRef<HTMLDivElement | null>(null); // 會計期間按鈕的 ref，用於獲取寬度
    const [periodButtonWidth, setPeriodButtonWidth] = useState<number>(90); // 會計期間按鈕寬度
    const [notiAnchor, setNotiAnchor] = useState<HTMLElement | null>(null);
    const notiButtonRef = useRef<HTMLElement | null>(null); // 通知按鈕的 ref，統一作為 anchor
    const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);

    // 取得通知中心的 anchor 元素（統一邏輯）
    const getNotificationAnchor = (): HTMLElement | null => {
        // 優先使用通知按鈕的 ref
        if (notiButtonRef.current && isValidAnchor(notiButtonRef.current)) {
            return notiButtonRef.current;
        }
        // 其次使用 notiAnchor 狀態
        if (notiAnchor && isValidAnchor(notiAnchor)) {
            return notiAnchor;
        }
        return null;
    };

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly SearchResult[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    /* =====================================================
     * 🚀 解決 Console 報警與 ARIA 衝突
     * 只在斷點切換時關閉選單，而非每次 resize
     * ===================================================== */
    const prevIsMobileRef = useRef(isMobile);
    const prevIsSmallScreenRef = useRef(isSmallScreen);
    
    useEffect(() => {
        // 只在斷點切換時關閉選單
        if (prevIsMobileRef.current !== isMobile || prevIsSmallScreenRef.current !== isSmallScreen) {
            setNotiAnchor(null);
            setMoreMenuAnchor(null);
            setPeriodMenuAnchor(null);
            setUserAnchor(null);
            // 更新 ref 值
            prevIsMobileRef.current = isMobile;
            prevIsSmallScreenRef.current = isSmallScreen;
        }
    }, [isMobile, isSmallScreen]);

    // 驗證 anchorEl 是否有效（仍在 DOM 中且可見）
    const isValidAnchor = (el: HTMLElement | null): el is HTMLElement => {
        if (!el) return false;
        // 檢查元素是否仍在 DOM 中
        if (!el.isConnected || !document.body.contains(el)) return false;
        // 檢查元素是否可見（不是 display: none）
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    };

    // 監聽 anchor 元素有效性，無效時自動關閉選單
    useEffect(() => {
        if (notiAnchor && !isValidAnchor(notiAnchor)) setNotiAnchor(null);
        if (moreMenuAnchor && !isValidAnchor(moreMenuAnchor)) setMoreMenuAnchor(null);
        if (periodMenuAnchor && !isValidAnchor(periodMenuAnchor)) setPeriodMenuAnchor(null);
        if (userAnchor && !isValidAnchor(userAnchor)) setUserAnchor(null);
    }, [notiAnchor, moreMenuAnchor, periodMenuAnchor, userAnchor]);

    // 更新會計期間按鈕寬度（手機版時）
    useEffect(() => {
        if (isMobile && periodButtonRef.current) {
            setPeriodButtonWidth(periodButtonRef.current.offsetWidth);
        }
    }, [isMobile, accountingPeriod]); // 當裝置類型或會計期間改變時更新寬度

    const handleNotificationClick = async (noti: any) => {
        setNotiAnchor(null);
        const actualId = noti.id || noti.userNotificationId;
        if (!actualId) return;

        const success = await markAsRead({ ...noti, userNotificationId: actualId });

        if (success && noti.targetId) {
            switch (noti.targetType) {
                case 'purchases': redirect(`/purchases/${noti.targetId}/show`); break;
                case 'expenses': redirect(`/expenses/${noti.targetId}/show`); break;
                case 'orders': redirect(`/orders/${noti.targetId}/show`); break;
                default: console.info("💡 無跳轉目標:", noti.targetType);
            }
        }
    };

    /* =====================================================
     * 🔍 搜尋與主題邏輯
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

    const handleLogout = () => {
        setUserAnchor(null);
        // 透過 react-admin 的 logout 流程：
        // 1. 呼叫 authProvider.logout 清除 Token
        // 2. 自動導回登入頁
        logout();
    };

    return (
        <AppBar
            {...restProps}
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
                zIndex: Z_INDEX.appBar,
                backdropFilter: "blur(10px)",
                backgroundColor: isDark ? "rgba(46, 125, 50, 0.85)" : "rgba(56, 142, 60, 0.85)",
                borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
            }}
        >
            <Toolbar sx={{ 
                px: { xs: 0.5, sm: 2 }, 
                height: { xs: `${APP_BAR_HEIGHT.mobile}px`, sm: `${APP_BAR_HEIGHT.desktop}px` },
                minHeight: { xs: `${APP_BAR_HEIGHT.mobile}px`, sm: `${APP_BAR_HEIGHT.desktop}px` }
            }}>
                <SidebarToggleButton />

                <Box sx={{ display: "flex", alignItems: "center", mr: { xs: 0.5, sm: 2 }, ml: { xs: 0, sm: 1 }, flexShrink: 0 }}>
                    <ActiveIcon sx={{ color: "#fff", mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    {!isMobile && (
                        <Typography sx={{ backgroundColor: "rgba(255,255,255,0.22)", px: 1.5, py: 0.6, borderRadius: 1.5, fontWeight: 600, fontSize: "0.95rem", color: "#fff", whiteSpace: "nowrap" }}>
                            {activeTitle}
                        </Typography>
                    )}
                </Box>

                <Box
                    ref={periodButtonRef}
                    onClick={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        if (target && isMobile) {
                            // 點擊時更新寬度，確保選單寬度與按鈕一致
                            setPeriodButtonWidth(target.offsetWidth);
                        }
                        setPeriodMenuAnchor(target);
                    }}
                    sx={{
                        display: "flex", 
                        alignItems: "center", 
                        flexShrink: 0, 
                        backgroundColor: "rgba(255,255,255,0.22)", 
                        px: { xs: 0.8, sm: 1.5 }, 
                        height: "34px", // 與搜尋條高度一致
                        borderRadius: 1.5, 
                        color: "#fff", 
                        cursor: "pointer", 
                        transition: "0.2s",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" }, 
                        whiteSpace: "nowrap", 
                        mr: { xs: 0.5, sm: 0 }
                    }}
                >
                    <Typography variant="body2" sx={{ mr: 0.2, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {!isMobile 
                            ? `📅 ${accountingPeriod}` 
                            : accountingPeriod.replace('-', '/')}
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
                    sx={{ 
                        ml: isMobile ? 0.5 : (isSmallScreen ? 1 : 3), 
                        flexGrow: 1, 
                        maxWidth: isMobile ? '200px' : (isSmallScreen ? '300px' : '400px') 
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
                                    borderRadius: 1.5, padding: "0 8px !important",
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

                <Box sx={{ display: "flex", ml: "auto", alignItems: "center", flexShrink: 0 }}>
                    {!isSmallScreen ? (
                        <>
                            <Tooltip title="通知中心">
                                <IconButton
                                    ref={(el) => {
                                        notiButtonRef.current = el;
                                    }}
                                    onClick={(e) => {
                                        // 確保取得正確的 anchor 元素
                                        const target = e.currentTarget as HTMLElement;
                                        if (target && document.body.contains(target)) {
                                            setNotiAnchor(target);
                                        }
                                    }}
                                    sx={{ position: 'relative' }}
                                >
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon sx={{ color: "#fff" }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="切換模式">
                                <IconButton onClick={handleToggleTheme}>
                                    {isDark ? <Brightness7Icon sx={{ color: "#fff" }} /> : <Brightness4Icon sx={{ color: "#fff" }} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="重新整理">
                                <IconButton onClick={() => window.location.reload()}><RefreshIcon sx={{ color: "#fff" }} /></IconButton>
                            </Tooltip>
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

                {/* --- 🔔 通知中心彈窗 (統一使用 Menu 標準定位) --- */}
                <Menu
                    anchorEl={getNotificationAnchor()}
                    open={Boolean(getNotificationAnchor())}
                    onClose={() => {
                        setNotiAnchor(null);
                    }}
                    disableScrollLock={false}
                    // 統一使用 anchorOrigin 和 transformOrigin 進行定位
                    anchorOrigin={{ 
                        vertical: 'bottom', 
                        horizontal: isMobile ? 'center' : 'right' 
                    }}
                    transformOrigin={{ 
                        vertical: 'top', 
                        horizontal: isMobile ? 'center' : 'right' 
                    }}
                    // 統一使用 Portal，確保層級正確
                    disablePortal={false}
                    sx={{
                        zIndex: Z_INDEX.appBarMenu,
                        "& .MuiMenu-list": {
                            p: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            // 動態計算最大高度：視窗高度 - AppBar 高度 - 間距
                            maxHeight: `calc(100vh - ${APP_BAR_HEIGHT[isMobile ? 'mobile' : 'desktop']}px - ${muiTheme.spacing(2)})`,
                        }
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                // 使用 minWidth 和 maxWidth 而非固定 width，提供彈性
                                minWidth: isMobile ? 280 : 320,
                                maxWidth: isMobile ? '92vw' : 420,
                                mt: 0.5,
                                borderRadius: 4,
                                boxShadow: isDark ? '0px 12px 48px rgba(0,0,0,0.6)' : '0px 12px 32px rgba(0,0,0,0.12)',
                                overflow: 'hidden',
                                backgroundImage: 'none',
                                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                            }
                        }
                    }}
                >
                    {/* 1. 固定標題區 */}
                    <Box sx={{
                        p: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: isDark ? alpha('#fff', 0.02) : 'grey.50',
                        flexShrink: 0
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>通知中心</Typography>
                        {unreadCount > 0 && (
                            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }} />
                        )}
                    </Box>
                    <Divider />

                    {/* 2. ✨ 捲動內容區 ✨ */}
                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        minHeight: 0, // 允許 flex 子元素縮小
                        p: 1.5,
                        ...getScrollbarStyles(muiTheme) // 注入 Scrollbar 樣式
                    }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2, opacity: 0.4 }} />
                                <Typography variant="body1" color="text.secondary">暫無任何通知</Typography>
                            </Box>
                        ) : (
                            notifications.map((n) => {
                                const isUnread = !n.read;
                                return (
                                    <MenuItem
                                        key={n.id || n.userNotificationId}
                                        onClick={() => handleNotificationClick(n)}
                                        sx={{
                                            whiteSpace: 'normal',
                                            p: 2,
                                            mb: 1.5,
                                            borderRadius: 3,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            backgroundColor: isUnread
                                                ? (isDark ? alpha(muiTheme.palette.primary.main, 0.08) : '#f1f8e9')
                                                : (isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02)),
                                            borderLeft: isUnread ? `4px solid ${muiTheme.palette.success.main}` : '4px solid transparent',
                                            transition: '0.2s',
                                            '&:hover': {
                                                backgroundColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
                                            }
                                        }}
                                    >
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 800 }}>{n.title}</Typography>
                                                {isUnread && <FiberManualRecordIcon sx={{ color: 'success.main', fontSize: 12 }} />}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">{n.content}</Typography>
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled' }}>
                                                {dayjs(n.createdAt).format("YYYY-MM-DD HH:mm")}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                );
                            })
                        )}
                    </Box>

                    <Divider />

                    {/* 3. ✨ 加回的固定底部按鈕 ✨ */}
                    <Box sx={{ p: 1, flexShrink: 0, bgcolor: isDark ? alpha('#fff', 0.02) : 'grey.50' }}>
                        <MenuItem
                            sx={{ justifyContent: 'center', borderRadius: 2 }}
                            onClick={() => { setNotiAnchor(null); redirect('/notifications'); }}
                        >
                            <Typography variant="button" color="success.main" sx={{ fontWeight: 800 }}>
                                查看全部通知
                            </Typography>
                        </MenuItem>
                    </Box>
                </Menu>

                {/* --- 其他選單 --- */}
                <Menu 
                    anchorEl={isValidAnchor(moreMenuAnchor) ? moreMenuAnchor : null} 
                    open={Boolean(moreMenuAnchor && isValidAnchor(moreMenuAnchor))} 
                    onClose={() => setMoreMenuAnchor(null)} 
                    PaperProps={{ sx: { width: 180, mt: 1, borderRadius: 3, zIndex: Z_INDEX.appBarMoreButton } }}
                >
                    <MenuItem onClick={() => {
                        // 從更多選單打開通知中心：統一使用通知按鈕的 ref 作為 anchor
                        if (notiButtonRef.current) {
                            setNotiAnchor(notiButtonRef.current);
                        }
                        setMoreMenuAnchor(null);
                    }}>
                        <ListItemIcon><Badge badgeContent={unreadCount} color="error"><NotificationsIcon fontSize="small" /></Badge></ListItemIcon>
                        <ListItemText>通知中心</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleToggleTheme}>
                        <ListItemIcon>{isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}</ListItemIcon>
                        <ListItemText>{isDark ? '淺色模式' : '深色模式'}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => window.location.reload()}>
                        <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>重新整理</ListItemText>
                    </MenuItem>
                </Menu>

                <Menu 
                    anchorEl={isValidAnchor(periodMenuAnchor) ? periodMenuAnchor : null} 
                    open={Boolean(periodMenuAnchor && isValidAnchor(periodMenuAnchor))} 
                    onClose={() => setPeriodMenuAnchor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: isMobile ? 'center' : 'left', // 手機版居中對齊，桌面版左對齊
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: isMobile ? 'center' : 'left', // 手機版居中對齊，桌面版左對齊
                    }}
                    PaperProps={{ 
                        sx: { 
                            mt: 0.5, 
                            borderRadius: 3, 
                            maxHeight: 300,
                            // 手機版：與按鈕寬度一致，確保對齊
                            // 桌面版：根據內容自動調整寬度
                            ...(isMobile ? {
                                width: `${periodButtonWidth}px`,
                                minWidth: `${periodButtonWidth}px`,
                                maxWidth: `${periodButtonWidth}px`,
                            } : {
                                width: 'auto',
                                minWidth: 100,
                                maxWidth: 'none',
                            }),
                            ...getScrollbarStyles(muiTheme) 
                        } 
                    }}
                    sx={{
                        // 確保所有 MenuItem 寬度一致
                        "& .MuiMenuItem-root": {
                            width: "100%",
                            minWidth: "100%",
                            // 手機版：減少 padding，讓選單更緊湊
                            padding: isMobile ? "6px 8px" : "8px 16px",
                            margin: isMobile ? "1px 2px" : "2px 4px",
                            borderRadius: 1,
                            display: "flex",
                            justifyContent: "center", // 文字居中對齊
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: isMobile ? "0.75rem" : "0.875rem", // 手機版字體稍小
                            // 選中狀態的背景色也要保持相同寬度
                            "&.Mui-selected": {
                                backgroundColor: isDark ? alpha(muiTheme.palette.primary.main, 0.16) : alpha(muiTheme.palette.primary.main, 0.12),
                                width: "100%",
                                minWidth: "100%",
                                "&:hover": {
                                    backgroundColor: isDark ? alpha(muiTheme.palette.primary.main, 0.24) : alpha(muiTheme.palette.primary.main, 0.18),
                                },
                            },
                            "&:hover": {
                                backgroundColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                            },
                        },
                    }}
                >
                    {periodOptions.map((p) => (
                        <MenuItem 
                            key={p} 
                            selected={p === accountingPeriod} 
                            onClick={() => { 
                                setAccountingPeriod(p); 
                                setPeriodMenuAnchor(null); 
                            }}
                            sx={{
                                // 確保每個項目都有相同的寬度和樣式，文字居中
                                width: "100%",
                                minWidth: "100%",
                                justifyContent: "center",
                                textAlign: "center",
                            }}
                        >
                            {p}
                        </MenuItem>
                    ))}
                </Menu>

                <Menu
                    anchorEl={isValidAnchor(userAnchor) ? userAnchor : null}
                    open={Boolean(userAnchor && isValidAnchor(userAnchor))}
                    onClose={() => setUserAnchor(null)}
                    PaperProps={{ sx: { mt: 1, borderRadius: 3, minWidth: 180 } }}
                >
                    {identity && (
                        <MenuItem sx={{ py: 1.5, cursor: "default" }} disabled>
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {identity.fullName || identity.id}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    已登入
                                </Typography>
                            </Box>
                        </MenuItem>
                    )}
                    {identity && <Divider />}
                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            py: 1.5,
                            color: "error.main",
                            "&:hover": { backgroundColor: "action.hover" },
                        }}
                    >
                        <ListItemIcon sx={{ color: "error.main", minWidth: 36 }}>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="登出系統" />
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};