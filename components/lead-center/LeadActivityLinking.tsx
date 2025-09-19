
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Trash2, Building2, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ActivitySelectionTable } from './ActivitySelectionTable';
import { useActivityLinking } from '@/hooks/useActivityLinking';
import { getChannelInfo, getSalesStageInfo } from '@/utils/channelMapping';
import { SafeHtml } from '@/utils/htmlSanitizer';

interface LeadActivityLinkingProps {
  leadId: string;
  leadData?: {
    customer_channel?: string;
    sales_stage?: string;
    channel_compatibility_score?: number;
  };
}

export const LeadActivityLinking: React.FC<LeadActivityLinkingProps> = ({ leadId, leadData }) => {
  const [showSelectionTable, setShowSelectionTable] = useState(false);
  const { linkedActivities, isLoading, linkActivities, unlinkActivity } = useActivityLinking(leadId);

  const handleLinkActivities = async (activityIds: string[]) => {
    await linkActivities(activityIds);
    setShowSelectionTable(false);
  };

  const handleUnlinkActivity = async (activityId: string) => {
    await unlinkActivity(activityId);
  };

  // Helper function to get activity relevance based on channel
  const getActivityRelevance = (activityType: string, customerChannel?: string) => {
    if (!customerChannel) return null;
    
    const channelInfo = getChannelInfo(customerChannel);
    if (!channelInfo) return null;

    // Define activity relevance based on channel category
    const relevanceMap: Record<string, Record<string, { level: 'high' | 'medium' | 'low'; reason: string }>> = {
      'hotel': {
        'call': { level: 'high', reason: 'Hotels prefer direct communication' },
        'meeting': { level: 'high', reason: 'Face-to-face meetings are crucial for hotels' },
        'email': { level: 'medium', reason: 'Good for follow-up and documentation' },
        'sample': { level: 'high', reason: 'Hotels need to test ingredients before bulk orders' }
      },
      'restaurant': {
        'call': { level: 'high', reason: 'Restaurants appreciate quick communication' },
        'meeting': { level: 'high', reason: 'Chef meetings are essential for restaurants' },
        'email': { level: 'medium', reason: 'Good for sharing recipes and specifications' },
        'sample': { level: 'high', reason: 'Chefs need to test flavor profiles' }
      },
      'retail': {
        'call': { level: 'medium', reason: 'Retail owners prefer scheduled calls' },
        'meeting': { level: 'high', reason: 'In-person meetings build trust with retail owners' },
        'email': { level: 'high', reason: 'Retail owners appreciate detailed email communications' },
        'sample': { level: 'high', reason: 'Retail businesses need samples for testing' }
      },
      'other': {
        'call': { level: 'medium', reason: 'Good for initial contact' },
        'meeting': { level: 'high', reason: 'Meetings are important for all business types' },
        'email': { level: 'high', reason: 'Professional communication' },
        'sample': { level: 'medium', reason: 'May need samples depending on business type' }
      }
    };

    return relevanceMap[channelInfo.category]?.[activityType.toLowerCase()] || null;
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading activities...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Linked Activities ({linkedActivities.length})
            </CardTitle>
            <Button onClick={() => setShowSelectionTable(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Link Activities
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkedActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No activities linked to this lead</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowSelectionTable(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Link Your First Activity
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {linkedActivities.map(activity => {
                const relevance = getActivityRelevance(activity.activity_type, leadData?.customer_channel);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{activity.activity_type}</Badge>
                        {activity.status && (
                          <Badge variant="secondary">{activity.status}</Badge>
                        )}
                        {relevance && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              relevance.level === 'high' ? 'bg-green-100 text-green-800 border-green-200' :
                              relevance.level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {relevance.level} relevance
                          </Badge>
                        )}
                      </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.activity_date ? format(new Date(activity.activity_date), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                      {activity.customer_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {activity.customer_name}
                        </span>
                      )}
                      {activity.contact_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.contact_name}
                        </span>
                      )}
                      {activity.salesperson_name && (
                        <span>Sales: {activity.salesperson_name}</span>
                      )}
                    </div>
                    {activity.notes && (
                      <SafeHtml 
                        content={activity.notes}
                        className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none"
                        fallbackToText={true}
                      />
                    )}
                    {relevance && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        💡 {relevance.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkActivity(activity.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showSelectionTable && (
        <ActivitySelectionTable
          linkedActivityIds={linkedActivities.map(activity => activity.id)}
          onLinkActivities={handleLinkActivities}
          onClose={() => setShowSelectionTable(false)}
        />
      )}
    </>
  );
};
