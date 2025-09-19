
import { supabase } from '@/lib/supabase';

interface NotificationResult {
  success: boolean;
  message?: string;
}

export const testNotificationCreation = async (): Promise<NotificationResult> => {
  try {
    console.log('🧪 Testing notification creation...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'No authenticated user found' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: user.id,
        title: 'Test Notification',
        message: 'This is a test notification created from the debug interface.',
        type: 'customer_request'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating test notification:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Test notification created successfully:', data);
    return { success: true, message: 'Test notification created successfully' };
  } catch (error: any) {
    console.error('❌ Unexpected error in testNotificationCreation:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
};

/**
 * Create a notification for activity follow-up creation
 * Notifies the original activity creator when someone adds a follow-up
 */
export const createActivityFollowUpNotification = async (
  activityId: string,
  followUpNote: string,
  followUpCreatedBy: string
): Promise<NotificationResult> => {
  try {
    console.log('📧 Creating activity follow-up notification:', { activityId, followUpCreatedBy });
    
    // Get the activity details to find the original creator (salesperson)
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('id, salesperson_id, salesperson_name, activity_type, customer_name, lead_name')
      .eq('id', activityId)
      .single();

    if (activityError) {
      console.error('❌ Error fetching activity:', activityError);
      return { success: false, message: activityError.message };
    }

    if (!activity || !activity.salesperson_id) {
      console.log('⚠️ Activity not found or no salesperson assigned');
      return { success: false, message: 'Activity not found or no salesperson assigned' };
    }

    // Don't notify if the follow-up creator is the same as the activity creator
    if (activity.salesperson_id === followUpCreatedBy) {
      console.log('ℹ️ Skip notification - follow-up creator is the same as activity creator');
      return { success: true, message: 'Notification skipped - same user' };
    }

    // Get the follow-up creator's name for the notification
    const { data: creatorProfile, error: creatorError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', followUpCreatedBy)
      .single();

    const creatorName = creatorProfile?.full_name || 'Someone';

    // Construct notification content
    const entityName = activity.customer_name || activity.lead_name || 'Unknown';
    const title = 'New Follow-up Added to Your Activity';
    const previewText = followUpNote.length > 100 
      ? `${followUpNote.substring(0, 100)}...` 
      : followUpNote;
    
    const message = `${creatorName} added a follow-up to your ${activity.activity_type} activity with ${entityName}: "${previewText}"`;

    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: activity.salesperson_id,
        sender_id: followUpCreatedBy,
        title,
        message,
        type: 'activity_follow_up',
        reference_id: activityId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating follow-up notification:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Activity follow-up notification created successfully:', data);
    return { success: true, message: 'Follow-up notification created successfully' };
  } catch (error: any) {
    console.error('❌ Unexpected error in createActivityFollowUpNotification:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
};

export const createAdminNotification = async (
  type: string,
  entityId: string,
  title: string,
  message: string
): Promise<NotificationResult> => {
  try {
    console.log('📧 Creating admin notification:', { type, entityId, title, message });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'No authenticated user found' };
    }

    // Get all admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ Error fetching admin users:', adminError);
      return { success: false, message: adminError.message };
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️ No admin users found');
      return { success: false, message: 'No admin users found' };
    }

    // Create notifications for all admin users
    const notifications = adminUsers.map(admin => ({
      recipient_id: admin.id,
      sender_id: user.id,
      title,
      message,
      type: type as any, // Type assertion for the enum
      reference_id: entityId
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('❌ Error creating admin notifications:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Admin notifications created successfully:', data);
    return { success: true, message: `Created ${data?.length || 0} admin notifications` };
  } catch (error: any) {
    console.error('❌ Unexpected error in createAdminNotification:', error);
    return { success: false, message: error.message || 'Unexpected error occurred' };
  }
};
