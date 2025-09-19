
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { testNotificationCreation, createAdminNotification } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const NotificationTester = () => {
  const [isTestingCreate, setIsTestingCreate] = useState(false);
  const [isTestingAdmin, setIsTestingAdmin] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();
  const { user, isAdmin } = useAuthStore();

  const handleTestCreate = async () => {
    setIsTestingCreate(true);
    try {
      const result = await testNotificationCreation();
      if (result.success) {
        toast.success('Test notification created successfully!');
        // Refresh notifications
        await fetchNotifications();
      } else {
        toast.error(`Failed to create test notification: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing notification creation:', error);
      toast.error('Failed to create test notification');
    } finally {
      setIsTestingCreate(false);
    }
  };

  const handleTestAdminNotification = async () => {
    setIsTestingAdmin(true);
    try {
      const result = await createAdminNotification(
        'customer_request',
        'TEST-001',
        'Test Admin Notification',
        'This is a test notification sent to all administrators.'
      );
      if (result.success) {
        toast.success(result.message || 'Admin notification created successfully!');
        // Refresh notifications
        await fetchNotifications();
      } else {
        toast.error(`Failed to create admin notification: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing admin notification creation:', error);
      toast.error('Failed to create admin notification');
    } finally {
      setIsTestingAdmin(false);
    }
  };

  const handleFetchNotifications = async () => {
    setIsFetching(true);
    try {
      await fetchNotifications();
      toast.success('Notifications refreshed');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsFetching(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Information about the logged-in user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Testing</CardTitle>
          <CardDescription>Test notification creation and management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleTestCreate} 
                disabled={isTestingCreate || !user}
                variant="default"
              >
                {isTestingCreate ? 'Creating...' : 'Create Test Notification'}
              </Button>
              
              <Button 
                onClick={handleTestAdminNotification} 
                disabled={isTestingAdmin || !user}
                variant="secondary"
              >
                {isTestingAdmin ? 'Creating...' : 'Create Admin Notification'}
              </Button>
              
              <Button 
                onClick={handleFetchNotifications} 
                disabled={isFetching || !user}
                variant="outline"
              >
                {isFetching ? 'Fetching...' : 'Refresh Notifications'}
              </Button>
              
              {unreadCount > 0 && (
                <Button 
                  onClick={handleMarkAllAsRead} 
                  disabled={!user}
                  variant="ghost"
                >
                  Mark All Read
                </Button>
              )}
            </div>
            
            {!user && (
              <p className="text-sm text-muted-foreground">
                Please log in to test notifications
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Status</CardTitle>
          <CardDescription>Current notification state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{notifications.length - unreadCount}</div>
              <div className="text-sm text-muted-foreground">Read</div>
            </div>
            <div className="text-center">
              <Badge variant={isLoading ? "secondary" : "default"}>
                {isLoading ? "Loading" : "Ready"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No notifications found. Try creating a test notification above.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    !notification.read ? 'bg-muted/50 border-primary/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 px-2 text-xs"
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;
