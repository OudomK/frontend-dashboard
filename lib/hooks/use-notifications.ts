import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api-client";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<Notification[]>("/api/v1/notifications/");
      setNotifications(response.data);
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setError(err?.response?.data?.detail || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Optional: Refresh notifications every minute
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
      // Revert optimistic update on failure by refetching
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await apiClient.patch(`/api/v1/notifications/read-all`);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      // Revert optimistic update on failure by refetching
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}
