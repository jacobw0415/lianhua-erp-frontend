import { useState, useEffect, useCallback } from 'react';
// 集中管理 API 地址
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TEST_USER_ID = 1;

export interface NotificationItem {
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
        try {
            const [listRes, countRes] = await Promise.all([
                fetch(`${API_BASE_URL}/notifications/unread?userId=${TEST_USER_ID}`),
                fetch(`${API_BASE_URL}/notifications/unread-count?userId=${TEST_USER_ID}`)
            ]);

            const listJson = await listRes.json();
            const countJson = await countRes.json();

            if (listJson?.data) setNotifications(listJson.data);
            const count = countJson.data?.unreadCount ?? countJson.data ?? 0;
            setUnreadCount(Number(count));
        } catch (err) {
            console.error("❌ 獲取通知失敗:", err);
        }
    }, []);

    // 標記已讀邏輯 (含樂觀更新)
    const markAsRead = useCallback(async (noti: NotificationItem) => {
        // 1. 樂觀更新
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.filter(item => item.userNotificationId !== noti.userNotificationId));

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${noti.userNotificationId}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                keepalive: true 
            });
            if (!response.ok) throw new Error("API 更新失敗");
            return true;
        } catch (err) {
            console.error("❌ 已讀請求失敗:", err);
            fetchNotifications(); // 失敗時回滾，重新同步後端數據
            return false;
        }
    }, [fetchNotifications]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchNotifications, refreshInterval]);

    return { notifications, unreadCount, markAsRead, refresh: fetchNotifications };
};