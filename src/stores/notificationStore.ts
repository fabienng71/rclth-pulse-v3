
import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    // Mock implementation for now
    console.log('Fetching notifications...');
    set({ notifications: [], unreadCount: 0 });
  },
  
  markAsRead: async (id: string) => {
    const { notifications } = get();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    set({ 
      notifications: updated,
      unreadCount: updated.filter(n => !n.read).length
    });
  },
  
  markAllAsRead: async () => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, read: true }));
    set({ 
      notifications: updated,
      unreadCount: 0
    });
  }
}));
