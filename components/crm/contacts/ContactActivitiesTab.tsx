
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  FileText,
  Video,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useContactActivities } from '@/hooks/useContactActivities';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ContactActivitiesTabProps {
  contactId: string;
  customerCode?: string;
  customerName?: string;
}

const activityIcons = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  whatsapp: MessageCircle,
  follow_up: Clock,
  video: Video,
  visit: User,
  proposal: FileText,
  demo: Video,
};

const pipelineStageColors = {
  'Lead': 'bg-blue-100 text-blue-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Proposal': 'bg-yellow-100 text-yellow-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Closed Won': 'bg-emerald-100 text-emerald-800',
  'Closed Lost': 'bg-red-100 text-red-800',
};

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

export const ContactActivitiesTab: React.FC<ContactActivitiesTabProps> = ({
  contactId,
  customerCode,
  customerName
}) => {
  const navigate = useNavigate();
  const { activities, loading, refetch } = useContactActivities(customerCode);

  const handleAddActivity = () => {
    const params = new URLSearchParams();
    if (customerCode) params.set('customer_code', customerCode);
    if (customerName) params.set('customer_name', customerName);
    
    navigate(`/crm/activities/new?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activities Timeline</h3>
        <Button onClick={handleAddActivity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {!customerCode ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Customer Linked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This contact is not linked to a customer. Link to a customer to see activities.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No activities yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking interactions with this customer
              </p>
              <Button onClick={handleAddActivity}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || FileText;
            const pipelineColor = pipelineStageColors[activity.pipeline_stage as keyof typeof pipelineStageColors] || 'bg-gray-100 text-gray-800';
            const statusColor = statusColors[activity.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

            return (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${activity.is_done ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {activity.is_done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium capitalize">
                            {activity.activity_type ? activity.activity_type.replace('_', ' ') : 'Activity'}
                          </h4>
                          {activity.pipeline_stage && (
                            <Badge className={`text-xs ${pipelineColor}`}>
                              {activity.pipeline_stage}
                            </Badge>
                          )}
                          <Badge className={`text-xs ${statusColor}`}>
                            {activity.status ? activity.status.replace('_', ' ') : 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.activity_date), { addSuffix: true })}
                        </div>
                      </div>
                      
                      {activity.notes && (
                        <div 
                          className="text-sm text-muted-foreground mb-3 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: activity.notes }}
                        />
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {activity.contact_name && (
                            <span>Contact: {activity.contact_name}</span>
                          )}
                          
                          {activity.salesperson_name && (
                            <span>By: {activity.salesperson_name}</span>
                          )}
                        </div>
                        
                        {activity.is_done && activity.completed_at && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                      
                      {activity.follow_up_date && !activity.is_done && (
                        <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-orange-600" />
                            <span className="font-medium text-orange-800">Follow-up scheduled:</span>
                          </div>
                          <p className="text-sm text-orange-700 mt-1">
                            {new Date(activity.follow_up_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
