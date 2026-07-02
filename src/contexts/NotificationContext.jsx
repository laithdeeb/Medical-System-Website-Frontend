import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectSocket, getSocket, disconnectSocket } from '../socket';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = getSocket();

  // جلب الإشعارات السابقة من API
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  // إضافة إشعار جديد (من Socket)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) setUnreadCount(prev => prev + 1);
  };

  // تحديث إشعار كمقروء
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      // الاتصال بـ Socket
      connectSocket(user._id);
      const socketInstance = getSocket();
      socketInstance.on('new_notification', addNotification);
      fetchNotifications();
    } else {
      disconnectSocket();
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};