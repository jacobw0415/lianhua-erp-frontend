import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
    useTheme,
    useRedirect,
    SidebarToggleButton,
    useDataProvider,
    useLogout,
    useGetIdentity,
    useRefresh,
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { menuGroups } from "@/layout/menuConfig";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import { useNotifications } from "@/hooks/useNotifications";
import { useIsMobile, useIsSmallScreen } from "@/hooks/useIsMobile";
import { logger } from "@/utils/logger";

import dayjs from "dayjs";
import type { ElementType } from "react";
import { useTranslation } from "react-i18next";

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
    const { t, i18n: i18nInstance } = useTranslation("common");

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

    const isMobile = useIsMobile();
    const isTablet = useIsSmallScreen();

    /* =====================================================
     * 📌 狀態管理
     * ===================================================== */
    const [accountingPeriod, setAccountingPeriod] = useState<string>(dayjs().format("YYYY-MM"));
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState<HTMLElement | null>(null);
    const [notiAnchor, setNotiAnchor] = useState<HTMLElement | null>(null);
    const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly SearchResult[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const moreMenuButtonRef = useRef<HTMLElement | null>(null);
    const periodButtonRef = useRef<HTMLDivElement | null>(null);
    const [periodMenuWidth, setPeriodMenuWidth] = useState<number | undefined>(undefined);
    const refresh = useRefresh();

    /* =====================================================
     * 🚀 解決 Console 報警與 ARIA 衝突
     * ===================================================== */
    useEffect(() => {
        const handleForceClose = () => {
            setNotiAnchor(null);
            setMoreMenuAnchor(null);
            setPeriodMenuAnchor(null);
            setUserAnchor(null);
        };
        window.addEventListener('resize', handleForceClose);
        return () => window.removeEventListener('resize', handleForceClose);
    }, []);

    /* =====================================================
     * 📏 更新月曆選單寬度
     * ===================================================== */
    useEffect(() => {
        if (periodMenuAnchor && periodButtonRef.current) {
            setPeriodMenuWidth(periodButtonRef.current.offsetWidth);
        }
    }, [periodMenuAnchor]);

    const handleNotificationClick = useCallback(
        async (noti: any) => {
            setNotiAnchor(null);
            const actualId = noti.id || noti.userNotificationId;
            if (!actualId) return;

            // 1. 執行跳轉
            if (noti.targetId) {
                const targetPath = `/${noti.targetType}/${noti.targetId}/show`;
                redirect(targetPath);
            }

            // 2. 背景標記已讀，避免阻塞
            try {
                await markAsRead({ ...noti, userNotificationId: actualId });
            } catch (e) {
                logger.warn("Failed to mark as read", e);
            }
        },
        [markAsRead, redirect]
    );

    /* =====================================================
     * 🔍 搜尋邏輯與 Meta 資料
     * ===================================================== */
    const periodOptions = useMemo(() => {
        const res = [];
        for (let i = -6; i <= 3; i++) {
            res.push(dayjs().add(i, 'month').format("YYYY-MM"));
        }
        return res;
    }, []);

    const routeMetaMap = useMemo(() => {
        const map: Record<string, { titleKey: string; icon: ElementType }> = {};
        menuGroups.forEach((group) => {
            group.items.forEach((item) => {
                const resolvedIcon: ElementType =
                    typeof item.icon?.type === "string" ? CalendarMonthIcon : item.icon?.type ?? CalendarMonthIcon;
                map[item.to] = { titleKey: item.labelKey, icon: resolvedIcon };
            });
        });
        return map;
    }, []);

    const matched = Object.keys(routeMetaMap)
        .filter((p) => pathname.startsWith(p))
        .sort((a, b) => b.length - a.length)[0];

    const activeMeta = matched ? routeMetaMap[matched] : null;
    const ActiveIcon = activeMeta?.icon ?? CalendarMonthIcon;
    const activeTitle = activeMeta ? t(activeMeta.titleKey) : t("menu.fallbackTitle");

    // 搜尋防抖處理
    useEffect(() => {
        if (!inputValue.trim()) {
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

    const handleToggleTheme = useCallback(() => {
        const next = isDark ? "light" : "dark";
        setMode(next);
        setRaTheme(next);
        setMoreMenuAnchor(null);
    }, [isDark, setMode, setRaTheme]);

    const handleLogout = useCallback(() => {
        setUserAnchor(null);
        logout();
    }, [logout]);

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
                borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
            }}
        >
            <Toolbar sx={{ px: { xs: 0.5, sm: 2 }, height: "52px !important", minHeight: "52px !important" }}>
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
                        setPeriodMenuAnchor(e.currentTarget);
                        if (periodButtonRef.current) {
                            setPeriodMenuWidth(periodButtonRef.current.offsetWidth);
                        }
                    }}
                    sx={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, backgroundColor: "rgba(255,255,255,0.22)", 
                        px: { xs: 1, sm: 1.5 }, height: "34px", borderRadius: 1.5, color: "#fff", 
                        cursor: "pointer", transition: "0.2s", "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" }, 
                        whiteSpace: "nowrap", mr: { xs: 0.5, sm: 0 }, minWidth: { xs: '90px', sm: '110px' }, width: 'fit-content'
                    }}
                >
                    <Typography variant="body2" sx={{ mr: 0.5, fontWeight: 500, fontSize: "0.85rem", lineHeight: 1 }}>
                        {(() => {
                            const [year, month] = accountingPeriod.split('-');
                            return `${year}/${parseInt(month)}`;
                        })()}
                    </Typography>
                    <ArrowDropDownIcon sx={{ fontSize: '1rem', flexShrink: 0 }} />
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
                                {option.subTitle}{" "}
                                {option.type === "進貨" || option.type === "Purchase"
                                    ? `| ${t("search.typePurchase")}`
                                    : ""}
                            </Typography>
                        </Box>
                    )}
                />

                <Box sx={{ display: "flex", ml: "auto", alignItems: "center", flexShrink: 0 }}>
                    {!isTablet ? (
                        <>
                            <Box sx={{ display: "flex", alignItems: "center", mr: 0.25 }}>
                                <LanguageSwitcher />
                            </Box>
                            <Tooltip title={t("appBar.notifications")}>
                                <IconButton onClick={(e) => setNotiAnchor(e.currentTarget)}>
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon sx={{ color: "#fff" }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("appBar.toggleTheme")}>
                                <IconButton onClick={handleToggleTheme}>
                                    {isDark ? <Brightness7Icon sx={{ color: "#fff" }} /> : <Brightness4Icon sx={{ color: "#fff" }} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("appBar.refresh")}>
                                <IconButton onClick={() => refresh()}>
                                    <RefreshIcon sx={{ color: "#fff" }} />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <IconButton 
                            onClick={(e) => {
                                moreMenuButtonRef.current = e.currentTarget;
                                setMoreMenuAnchor(e.currentTarget);
                            }}
                        >
                            <Badge badgeContent={unreadCount} color="error" variant="dot">
                                <MoreVertIcon sx={{ color: "#fff" }} />
                            </Badge>
                        </IconButton>
                    )}

                    <Tooltip title={t("appBar.userMenu")}>
                        <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} sx={{ ml: { xs: 0, sm: 1 } }}>
                            <AccountCircleIcon sx={{ color: "#fff" }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* --- 🔔 通知中心彈窗 --- */}
                <Menu
                    anchorEl={notiAnchor}
                    open={Boolean(notiAnchor)}
                    onClose={() => setNotiAnchor(null)}
                    disableScrollLock 
                    anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: isMobile ? 'center' : 'right' }}
                    sx={{ "& .MuiMenu-list": { p: 0, display: 'flex', flexDirection: 'column', maxHeight: 520 } }}
                    slotProps={{
                        paper: {
                            sx: {
                                width: isMobile ? '92vw' : 380, maxWidth: '420px', mt: 1.5, borderRadius: 4,
                                boxShadow: isDark ? '0px 12px 48px rgba(0,0,0,0.6)' : '0px 12px 32px rgba(0,0,0,0.12)',
                                overflow: 'hidden', backgroundImage: 'none', backgroundColor: isDark ? '#1e1e1e' : '#fff',
                                ...(isMobile && { left: '4vw !important', right: '4vw !important' }),
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDark ? alpha('#fff', 0.02) : 'grey.50', flexShrink: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{t("appBar.notifications")}</Typography>
                        {unreadCount > 0 && <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }} />}
                    </Box>
                    <Divider />

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 340, p: 1.5, ...getScrollbarStyles(muiTheme) }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2, opacity: 0.4 }} />
                                <Typography variant="body1" color="text.secondary">{t("appBar.noNotifications")}</Typography>
                            </Box>
                        ) : (
                            notifications.map((n) => {
                                const isUnread = !n.read;
                                
                                // ✅ 關鍵修改：直接使用內容，不再手動插入標籤與換行，交給 CSS pre-line
                                const contentText = n.content || "";

                                return (
                                    <MenuItem
                                        key={n.id || n.userNotificationId}
                                        onClick={() => handleNotificationClick(n)}
                                        sx={{
                                            whiteSpace: 'normal', p: 2, mb: 1.5, borderRadius: 3, display: 'flex', alignItems: 'flex-start',
                                            backgroundColor: isUnread 
                                                ? (isDark ? alpha(muiTheme.palette.primary.main, 0.08) : '#f1f8e9')
                                                : (isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02)),
                                            borderLeft: isUnread ? `4px solid ${muiTheme.palette.success.main}` : '4px solid transparent',
                                            transition: '0.2s', '&:hover': { backgroundColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05) }
                                        }}
                                    >
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 800 }}>{n.title}</Typography>
                                                {isUnread && <FiberManualRecordIcon sx={{ color: 'success.main', fontSize: 12 }} />}
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                                            >
                                                {contentText}
                                            </Typography>
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
                    <Box sx={{ p: 1, flexShrink: 0, bgcolor: isDark ? alpha('#fff', 0.02) : 'grey.50' }}>
                        <MenuItem sx={{ justifyContent: 'center', borderRadius: 2 }} onClick={() => { setNotiAnchor(null); redirect('/notifications'); }}>
                            <Typography variant="button" color="success.main" sx={{ fontWeight: 800 }}>{t("appBar.viewAllNotifications")}</Typography>
                        </MenuItem>
                    </Box>
                </Menu>

                {/* --- 其他選單 --- */}
                <Menu anchorEl={moreMenuAnchor} open={Boolean(moreMenuAnchor)} onClose={() => setMoreMenuAnchor(null)} PaperProps={{ sx: { width: 200, mt: 1, borderRadius: 3 } }}>
                    <MenuItem onClick={() => { if (moreMenuButtonRef.current) setNotiAnchor(moreMenuButtonRef.current); setMoreMenuAnchor(null); }}>
                        <ListItemIcon><Badge badgeContent={unreadCount} color="error"><NotificationsIcon fontSize="small" /></Badge></ListItemIcon>
                        <ListItemText>{t("appBar.notifications")}</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            void i18nInstance.changeLanguage("zh-TW");
                            setMoreMenuAnchor(null);
                        }}
                        selected={!i18nInstance.language.startsWith("en")}
                    >
                        <ListItemText>{t("lang.zhTW")}</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            void i18nInstance.changeLanguage("en");
                            setMoreMenuAnchor(null);
                        }}
                        selected={i18nInstance.language.startsWith("en")}
                    >
                        <ListItemText>{t("lang.en")}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleToggleTheme}>
                        <ListItemIcon>{isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}</ListItemIcon>
                        <ListItemText>{isDark ? t("appBar.lightMode") : t("appBar.darkMode")}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { refresh(); setMoreMenuAnchor(null); }}>
                        <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>{t("appBar.refresh")}</ListItemText>
                    </MenuItem>
                </Menu>

                <Menu 
                    anchorEl={periodMenuAnchor} 
                    open={Boolean(periodMenuAnchor)} 
                    onClose={() => setPeriodMenuAnchor(null)}
                    slotProps={{
                        paper: { 
                            sx: { 
                                mt: 1, borderRadius: 3, 
                                width: periodMenuWidth ? `${periodMenuWidth}px` : { xs: '120px', sm: '150px' },
                                maxHeight: 300, ...getScrollbarStyles(muiTheme) 
                            } 
                        }
                    }}
                >
                    {periodOptions.map((p) => (
                        <MenuItem 
                            key={p} selected={p === accountingPeriod} 
                            onClick={() => { setAccountingPeriod(p); setPeriodMenuAnchor(null); }}
                            sx={{
                                minHeight: '34px', height: '34px', py: 0, px: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                '&.Mui-selected': {
                                    backgroundColor: alpha(muiTheme.palette.primary.main, isDark ? 0.2 : 0.1),
                                    '&:hover': { backgroundColor: alpha(muiTheme.palette.primary.main, isDark ? 0.3 : 0.15) }
                                }
                            }}
                        >
                            {p}
                        </MenuItem>
                    ))}
                </Menu>

                <Menu 
                    anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}
                    PaperProps={{ sx: { mt: 1, borderRadius: 3, minWidth: 180 } }}
                >
                    {identity && (
                        <MenuItem sx={{ py: 1.5, cursor: "default" }} disabled>
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{identity.fullName || identity.id}</Typography>
                                <Typography variant="caption" color="text.secondary">{t("appBar.loggedIn")}</Typography>
                            </Box>
                        </MenuItem>
                    )}
                    {identity && <Divider />}
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main", "&:hover": { backgroundColor: "action.hover" } }}>
                        <ListItemIcon sx={{ color: "error.main", minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary={t("appBar.logout")} />
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};