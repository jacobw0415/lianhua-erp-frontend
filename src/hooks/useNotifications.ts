import { useState, useEffect, useCallback } from 'react';

import { getApiUrl } from '@/config/apiUrl';
import { applyAcceptLanguageHeader, appendLangQueryIfMissing } from '@/utils/apiLocale';
import { logger } from '@/utils/logger';

const API_BASE_URL = getApiUrl();
const TEST_USER_ID = 1;

// 與 dataProvider 一致：自動附加 Authorization Bearer Token
const buildAuthHeaders = () => {
    const headers = new Headers();
    applyAcceptLanguageHeader(headers);
    headers.set("Accept", "application/json");

    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    if (token) {
        headers.set("Authorization", `${tokenType} ${token}`);
    }

    return headers;
};

export interface NotificationItem {
    id: number;
    userNotificationId: number; 
    title: string;
    content: string;
    targetType: string;
    targetId: number;
    createdAt: string;
    read: boolean;
}

export const useNotifications = (refreshInterval = 5000) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        // 登出後 token 已清除，Layout 卸載前 interval 仍會觸發；無 token 時不發請求，避免 403
        if (!localStorage.getItem("token")) return;

        try {
            const [listRes, countRes] = await Promise.all([
                fetch(
                    appendLangQueryIfMissing(`${API_BASE_URL}/notifications/unread?userId=${TEST_USER_ID}`),
                    { headers: buildAuthHeaders() }
                ),
                fetch(
                    appendLangQueryIfMissing(`${API_BASE_URL}/notifications/unread-count?userId=${TEST_USER_ID}`),
                    { headers: buildAuthHeaders() }
                )
            ]);

            // 403/401 等可能回傳空或 HTML，直接 .json() 會 SyntaxError；先檢查 ok 再解析
            const safeJson = async (res: Response): Promise<Record<string, unknown>> => {
                if (!res.ok) {
                    await res.text().catch(() => "");
                    return {};
                }
                const text = await res.text();
                if (!text.trim()) return {};
                try {
                    return JSON.parse(text) as Record<string, unknown>;
                } catch {
                    return {};
                }
            };

            const listJson = await safeJson(listRes);
            const countJson = await safeJson(countRes);

            // 🚀 修正 1：確保 listJson.data 存在且為陣列，避免 map/filter 報錯
            if (listJson?.data && Array.isArray(listJson.data)) {
                setNotifications(listJson.data);
            } else {
                setNotifications([]);
            }

            const count = countJson.data && typeof countJson.data === "object" && "unreadCount" in countJson.data
                ? Number((countJson.data as { unreadCount?: number }).unreadCount)
                : typeof countJson.data === "number"
                    ? countJson.data
                    : 0;
            setUnreadCount(Number(count));
        } catch (err) {
            logger.devError("❌ 獲取通知失敗:", err);
        }
    }, []);

    // 標記已讀邏輯 (含樂觀更新)
    const markAsRead = useCallback(async (noti: NotificationItem) => {
        // 🚀 修正 2：防呆檢查，避免傳入無效物件導致崩潰
        if (!noti || !noti.userNotificationId) {
            logger.devError("❌ 無效的通知物件，無法標記已讀:", noti);
            return false;
        }

        // 1. 樂觀更新
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => 
            // 🚀 修正 3：加入 item 存在性檢查，徹底解決 TypeError
            prev.filter(item => item && item.userNotificationId !== noti.userNotificationId)
        );

        try {
            const response = await fetch(
                appendLangQueryIfMissing(`${API_BASE_URL}/notifications/${noti.userNotificationId}/read`),
                {
                    method: 'PATCH',
                    headers: (() => {
                        const headers = buildAuthHeaders();
                        headers.set('Content-Type', 'application/json');
                        return headers;
                    })(),
                    keepalive: true,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 報錯: ${response.status} - ${errorText}`);
            }
            return true;
        } catch (err) {
            logger.devError("❌ 已讀請求失敗:", err);
            // 失敗時回滾：重新從後端抓取正確數據
            fetchNotifications(); 
            return false;
        }
    }, [fetchNotifications]);

    useEffect(() => {
        if (!localStorage.getItem("token")) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchNotifications, refreshInterval]);

    return { notifications, unreadCount, markAsRead, refresh: fetchNotifications };
};