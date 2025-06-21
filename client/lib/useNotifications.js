import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        // Append for pagination
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setUnreadCount(response.data.unreadCount);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch notifications:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
      return response.data.count;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      throw err;
    }
  }, []);
  // Real-time polling for new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 15000); // Poll every 15 seconds for more real-time updates

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchNotifications(1)
  };
};
