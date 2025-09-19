import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Clock, Calendar, UserPlus, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'sample_request' | 'return_request' | 'leave_request' | 'customer_request' | 'info' | 'warning' | 'success' | 'urgent';
  created_at: string;
  read: boolean;
  reference_id?: string;
  recipient_id: string;
  sender_id?: string;
}

export const CRMNotificationsPanel = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Type assertion to ensure the data matches our interface
      const typedNotifications = (data || []).map(notification => ({
        ...notification,
        type: notification.type as Notification['type']
      }));
      
      setNotifications(typedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and reference_id
    switch (notification.type) {
      case 'sample_request':
        if (notification.reference_id) {
          navigate(`/forms/sample-requests/${notification.reference_id}`);
        }
        break;
      case 'return_request':
        if (notification.reference_id) {
          navigate(`/forms/return-requests/${notification.reference_id}`);
        }
        break;
      case 'customer_request':
        if (notification.reference_id) {
          navigate(`/forms/customer-requests/${notification.reference_id}`);
        }
        break;
      case 'leave_request':
        navigate('/admin');
        break;
      default:
        // For generic notifications without specific references
        break;
    }
  };

  const handleViewAllClick = () => {
    navigate('/crm/notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sample_request':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'return_request':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'leave_request':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'customer_request':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'sample_request':
      case 'customer_request':
        return 'default';
      case 'return_request':
      case 'warning':
        return 'secondary';
      case 'leave_request':
      case 'success':
        return 'default';
      case 'urgent':
        return 'destructive';
      case 'info':
      default:
        return 'outline';
    }
  };

  const getDisplayType = (type: string) => {
    switch (type) {
      case 'sample_request':
        return 'Sample';
      case 'return_request':
        return 'Return';
      case 'leave_request':
        return 'Leave';
      case 'customer_request':
        return 'Customer';
      default:
        return type;
    }
  };

  // Mock notifications for demo (when no real notifications exist)
  const mockNotifications: Notification[] = [
    {
      id: 'mock-1',
      title: 'Follow-up Due',
      message: 'Follow-up with John Doe is due today for the ABC Corp project.',
      type: 'warning',
      created_at: new Date().toISOString(),
      read: false,
      recipient_id: user?.id || ''
    },
    {
      id: 'mock-2',
      title: 'New Lead Assigned',
      message: 'You have been assigned a new lead: XYZ Manufacturing.',
      type: 'info',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      recipient_id: user?.id || ''
    },
    {
      id: 'mock-3',
      title: 'Sample Request Approved',
      message: 'Sample request SR-2024-001 has been approved and shipped.',
      type: 'sample_request',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      recipient_id: user?.id || ''
    },
    {
      id: 'mock-4',
      title: 'Meeting Reminder',
      message: 'Quarterly review meeting scheduled for tomorrow at 2 PM.',
      type: 'info',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
      recipient_id: user?.id || ''
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;
  const unreadCount = displayNotifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Stay updated with important CRM activities
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleViewAllClick}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {displayNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 border rounded-lg transition-all cursor-pointer hover:shadow-sm ${
                    !notification.read
                      ? 'bg-muted/50 border-primary/20 hover:bg-muted/70'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                          {getDisplayType(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(notification.created_at), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
