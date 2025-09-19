import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Settings, Mail, Bell } from 'lucide-react';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  leave_request_submitted: boolean;
  leave_request_approved: boolean;
  leave_request_denied: boolean;
  leave_request_deleted: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  push_notifications: true,
  leave_request_submitted: true,
  leave_request_approved: true,
  leave_request_denied: true,
  leave_request_deleted: true,
};

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences) {
        setPreferences({ ...defaultPreferences, ...data.notification_preferences });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about leave requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Methods */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Delivery Methods
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the application
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(value) => updatePreference('push_notifications', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(value) => updatePreference('email_notifications', value)}
              />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leave-submitted">Leave Request Submitted</Label>
                <p className="text-sm text-muted-foreground">
                  When someone submits a new leave request (admins only)
                </p>
              </div>
              <Switch
                id="leave-submitted"
                checked={preferences.leave_request_submitted}
                onCheckedChange={(value) => updatePreference('leave_request_submitted', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leave-approved">Leave Request Approved</Label>
                <p className="text-sm text-muted-foreground">
                  When your leave request is approved
                </p>
              </div>
              <Switch
                id="leave-approved"
                checked={preferences.leave_request_approved}
                onCheckedChange={(value) => updatePreference('leave_request_approved', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leave-denied">Leave Request Denied</Label>
                <p className="text-sm text-muted-foreground">
                  When your leave request is denied
                </p>
              </div>
              <Switch
                id="leave-denied"
                checked={preferences.leave_request_denied}
                onCheckedChange={(value) => updatePreference('leave_request_denied', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leave-deleted">Leave Request Deleted</Label>
                <p className="text-sm text-muted-foreground">
                  When a leave request is deleted (admins only)
                </p>
              </div>
              <Switch
                id="leave-deleted"
                checked={preferences.leave_request_deleted}
                onCheckedChange={(value) => updatePreference('leave_request_deleted', value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};