
import { create } from 'zustand';
import { NotificationState } from './types';
import { fetchNotifications } from './fetchOperations';
import { markAsRead, markAllAsRead } from './markOperations';
import { subscribeToNotifications, cleanup } from './realtimeOperations';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  realtimeChannel: null,
  isSubscribed: false,
  
  fetchNotifications: () => fetchNotifications(set, get),
  markAsRead: (id: string) => markAsRead(id, set, get),
  markAllAsRead: () => markAllAsRead(set, get),
  subscribeToNotifications: () => subscribeToNotifications(set, get),
  cleanup: () => cleanup(set, get),
}));
