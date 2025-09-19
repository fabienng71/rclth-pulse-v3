
export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type: 'sample_request' | 'return_request' | 'leave_request' | 'customer_request' | 'activity_follow_up';
  reference_id?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  realtimeChannel: unknown;
  isSubscribed: boolean;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => Promise<() => void>;
  cleanup: () => void;
}
