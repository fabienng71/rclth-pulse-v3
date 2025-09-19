
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Bell, Clock, Calendar, UserPlus, AlertTriangle, CheckCircle, X, MessageSquare } from 'lucide-react';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import type { Notification } from '@/stores/notifications/types';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

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
        } else {
          // Fallback to sample requests list if no specific ID
          navigate('/forms/sample-requests');
        }
        break;
      case 'return_request':
        if (notification.reference_id) {
          navigate(`/forms/return-requests/${notification.reference_id}`);
        } else {
          // Fallback to return requests list if no specific ID
          navigate('/forms/return-requests');
        }
        break;
      case 'customer_request':
        if (notification.reference_id) {
          navigate(`/forms/customer-requests/${notification.reference_id}`);
        } else {
          // Fallback to customer requests list if no specific ID
          navigate('/forms/customer-requests');
        }
        break;
      case 'leave_request':
        if (notification.reference_id) {
          navigate(`/forms/leave-requests/${notification.reference_id}`);
        } else {
          // Fallback to admin page for leave requests
          navigate('/admin');
        }
        break;
      case 'activity_follow_up':
        if (notification.reference_id) {
          // Navigate to activity form/detail page
          navigate(`/crm/activity/${notification.reference_id}`);
        } else {
          // Fallback to activities list
          navigate('/crm/activities');
        }
        break;
      default:
        // For generic notifications without specific references, stay on notifications page
        console.log('Notification clicked but no specific navigation defined:', notification);
        break;
    }
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
      case 'activity_follow_up':
        return <MessageSquare className="h-4 w-4 text-cyan-500" />;
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
        return 'secondary';
      case 'leave_request':
        return 'default';
      case 'activity_follow_up':
        return 'default';
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
      case 'activity_follow_up':
        return 'Follow-up';
      default:
        return type;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/crm')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with important CRM activities</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              Click on any notification to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p>You're all caught up! New notifications will appear here.</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
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
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                              {getDisplayType(notification.type)}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
