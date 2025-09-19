
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';

interface OverdueFollowup {
  id: string;
  customer_name?: string;
  lead_name?: string;
  follow_up_date: string;
  activity_type: string;
  is_lead: boolean;
}

interface OverdueFollowupsPanelProps {
  isLoading: boolean;
}

export const OverdueFollowupsPanel = ({ isLoading: parentLoading }: OverdueFollowupsPanelProps) => {
  const [overdueFollowups, setOverdueFollowups] = useState<OverdueFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverdueFollowups = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const baseFilter = isAdmin ? {} : { salesperson_id: user.id };
        
        // First, try to get activities with search_name from related tables
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select(`
            id, 
            customer_name, 
            customer_code,
            lead_name, 
            follow_up_date, 
            activity_type, 
            is_lead
          `)
          .match(baseFilter)
          .not('follow_up_date', 'is', null)
          .lte('follow_up_date', today)
          .order('follow_up_date', { ascending: true });

        if (activitiesError) throw activitiesError;

        // Get search_name for customers that have activities
        const customerCodes = activitiesData
          ?.filter(activity => !activity.is_lead && activity.customer_code)
          .map(activity => activity.customer_code) || [];

        let customerSearchNames: Record<string, string> = {};
        
        if (customerCodes.length > 0) {
          const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('customer_code, search_name')
            .in('customer_code', customerCodes);

          if (!customersError && customersData) {
            customerSearchNames = customersData.reduce((acc, customer) => {
              acc[customer.customer_code] = customer.search_name;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        // Map activities with search_name where available
        const enrichedActivities = activitiesData?.map(activity => ({
          ...activity,
          display_name: activity.is_lead 
            ? activity.lead_name 
            : customerSearchNames[activity.customer_code || ''] || activity.customer_name
        })) || [];

        setOverdueFollowups(enrichedActivities);
      } catch (error) {
        console.error('Error fetching overdue follow-ups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueFollowups();
  }, [user, isAdmin]);

  const handleViewAllClick = () => {
    navigate('/crm/activity/followups');
  };

  const handleCardClick = () => {
    navigate('/crm/activity/followups');
  };

  if (parentLoading || loading) {
    return (
      <Card className="section-background backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = overdueFollowups.length;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow section-background backdrop-blur-sm border-border/50"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Overdue Follow-ups</span>
            {overdueCount > 0 && (
              <span className="bg-red-100 text-red-700 border-red-200 text-xs px-2 py-1 rounded-full border">
                {overdueCount}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Follow-ups that need immediate attention
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewAllClick();
          }}
        >
          View All
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {overdueCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No overdue follow-ups</p>
            <p className="text-sm">Great job staying on top of your tasks!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-800">
                  {overdueCount} overdue follow-up{overdueCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {overdueFollowups.slice(0, 3).map((followup) => (
              <div 
                key={followup.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {(followup as any).display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {followup.activity_type} • Due: {format(new Date(followup.follow_up_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
            
            {overdueCount > 3 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  +{overdueCount - 3} more overdue follow-ups
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
