
import { supabase } from '@/lib/supabase';
import { NotificationState } from './types';

export const markAsRead = async (
  id: string,
  set: (partial: Partial<NotificationState> | ((state: NotificationState) => Partial<NotificationState>)) => void,
  get: () => NotificationState
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;

    const state = get();
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    const unreadCount = updatedNotifications.filter(n => !n.read).length;

    set({
      notifications: updatedNotifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllAsRead = async (
  set: (partial: Partial<NotificationState> | ((state: NotificationState) => Partial<NotificationState>)) => void,
  get: () => NotificationState
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', user.id)
      .eq('read', false);

    if (error) throw error;

    const state = get();
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      read: true
    }));

    set({
      notifications: updatedNotifications,
      unreadCount: 0
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};
