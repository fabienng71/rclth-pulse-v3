
import { format } from 'date-fns';
import { Activity } from '@/hooks/useActivitiesData';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getActivityTypeColor } from './utils/activityTypeUtils';

interface ActivityCardsProps {
  activities: Activity[];
  onActivityClick: (id: string) => void;
}

export const ActivityCards = ({ activities, onActivityClick }: ActivityCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.length === 0 ? (
        <div className="col-span-full text-center py-10 text-muted-foreground">
          No activities found. Create your first activity to get started.
        </div>
      ) : (
        activities.map((activity) => (
          <Card 
            key={activity.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onActivityClick(activity.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className={`${getActivityTypeColor(activity.activity_type)} text-white`}>
                  {activity.activity_type || 'N/A'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {activity.activity_date ? format(new Date(activity.activity_date), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
              <CardTitle className="text-base mt-2">{activity.search_name || activity.customer_name || 'No Customer'}</CardTitle>
              <CardDescription>
                Contact: {activity.contact_name || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activity.follow_up_date && (
                  <div className="flex items-center mt-3 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Follow-up: {format(new Date(activity.follow_up_date), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
