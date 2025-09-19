
import { supabase } from '@/lib/supabase';
import { NotificationState, Notification } from './types';

export const fetchNotifications = async (
  set: (partial: Partial<NotificationState> | ((state: NotificationState) => Partial<NotificationState>)) => void,
  get: () => NotificationState
) => {
  try {
    set({ isLoading: true, error: null });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type cast the notifications to match our interface
    const notifications: Notification[] = (data || []).map(notification => ({
      ...notification,
      type: notification.type as Notification['type']
    }));
    
    const unreadCount = notifications.filter(n => !n.read).length;

    set({
      notifications,
      unreadCount,
      isLoading: false,
      error: null
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    set({
      isLoading: false,
      error: error as Error,
      notifications: [],
      unreadCount: 0
    });
  }
};
