
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notifications';
import { toast } from 'sonner';

export function useNotificationsSetup() {
  const { user, isAdmin } = useAuthStore();
  const { fetchNotifications, subscribeToNotifications } = useNotificationStore();
  
  useEffect(() => {
    if (!user) {
      console.log('useNotificationsSetup: No user logged in');
      return;
    }
    
    console.log('Setting up notifications for user:', user.id);
    if (isAdmin) {
      console.log('Current user is an admin, should receive notifications');
    }
    
    // Initial fetch of notifications
    fetchNotifications()
      .then(() => console.log('Initial notifications fetch completed'))
      .catch(err => console.error('Error during initial notifications fetch:', err));
    
    // Subscribe to realtime updates - need to await the promise
    let unsubscribe: (() => void) | null = null;
    
    subscribeToNotifications()
      .then((unsubscribeFn) => {
        unsubscribe = unsubscribeFn;
      })
      .catch(err => console.error('Error setting up notifications subscription:', err));
    
    // Create a separate channel explicitly for the notifications table
    console.log('Setting up realtime channel for notifications table');
    
    try {
      const channel = supabase.channel('notifications-table-changes')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        }, (payload) => {
          console.log('📣 Notification change detected via notifications-table-changes:', payload);
          
          // Show toast for new notifications
          if (payload.eventType === 'INSERT') {
            const notification = payload.new;
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          }
          
          // When any change is detected, refresh the notifications
          fetchNotifications();
        })
        .subscribe((status) => {
          console.log('Realtime subscription status for notifications table:', status);
        });
      
      // Test the connection by logging a message
      console.log('Notification channels active:', [
        channel.topic,
        'notification-changes'
      ]);
      
      return () => {
        // Clean up subscriptions
        console.log('Cleaning up notification subscriptions');
        if (unsubscribe) {
          unsubscribe();
        }
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up notification channels:', error);
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [user, fetchNotifications, subscribeToNotifications, isAdmin]);
  
  return null;
}
