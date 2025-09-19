
import { supabase } from '@/lib/supabase';
import { NotificationState, Notification } from './types';

export const subscribeToNotifications = async (
  set: (partial: Partial<NotificationState> | ((state: NotificationState) => Partial<NotificationState>)) => void,
  get: () => NotificationState
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return () => {};
  }

  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Notification change received:', payload);
        
        const state = get();
        let updatedNotifications = [...state.notifications];
        
        switch (payload.eventType) {
          case 'INSERT':
            // Type cast the new notification
            const newNotification: Notification = {
              ...payload.new as any,
              type: payload.new.type as Notification['type']
            };
            updatedNotifications.unshift(newNotification);
            break;
          case 'UPDATE':
            updatedNotifications = updatedNotifications.map(notification =>
              notification.id === payload.new.id 
                ? { ...payload.new as any, type: payload.new.type as Notification['type'] }
                : notification
            );
            break;
          case 'DELETE':
            updatedNotifications = updatedNotifications.filter(
              notification => notification.id !== payload.old.id
            );
            break;
        }
        
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        set({
          notifications: updatedNotifications,
          unreadCount
        });
      }
    )
    .subscribe();

  set({ realtimeChannel: channel, isSubscribed: true });

  return () => {
    supabase.removeChannel(channel);
    set({ realtimeChannel: null, isSubscribed: false });
  };
};

export const cleanup = (
  set: (partial: Partial<NotificationState> | ((state: NotificationState) => Partial<NotificationState>)) => void,
  get: () => NotificationState
) => {
  const state = get();
  if (state.realtimeChannel) {
    supabase.removeChannel(state.realtimeChannel);
  }
  set({
    realtimeChannel: null,
    isSubscribed: false
  });
};
