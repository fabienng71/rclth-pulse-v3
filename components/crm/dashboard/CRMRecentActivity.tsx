
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentActivity {
  id: string;
  activity_type: string;
  customer_name?: string;
  lead_name?: string;
  activity_date: string;
  status: string;
  is_lead: boolean;
}

interface CRMRecentActivityProps {
  isLoading: boolean;
}

export const CRMRecentActivity = ({ isLoading: parentLoading }: CRMRecentActivityProps) => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const baseFilter = isAdmin ? {} : { salesperson_id: user.id };
        
        const { data, error } = await supabase
          .from('activities')
          .select('id, activity_type, customer_name, lead_name, activity_date, status, is_lead')
          .match(baseFilter)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [user, isAdmin]);

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'call':
        return 'bg-purple-100 text-purple-800';
      case 'email':
        return 'bg-green-100 text-green-800';
      case 'follow-up':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (parentLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activities</CardTitle>
          <CardDescription>Latest customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16" />
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
          <CardTitle className="text-lg">Recent Activities</CardTitle>
          <CardDescription>Latest customer interactions</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/crm/activities')}
        >
          View All
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activities found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/crm/activity/new')}
            >
              Create First Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/crm/activity/${activity.id}`)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Badge className={getActivityTypeColor(activity.activity_type)}>
                    {activity.activity_type}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {activity.is_lead ? activity.lead_name : activity.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.activity_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status || 'Unknown'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
