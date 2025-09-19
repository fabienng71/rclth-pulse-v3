
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Building2, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Activity } from '@/types/activity';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { SafeHtml } from '@/utils/htmlSanitizer';

interface ActivitySelectionTableProps {
  linkedActivityIds: string[];
  onLinkActivities: (activityIds: string[]) => void;
  onClose: () => void;
}

export const ActivitySelectionTable: React.FC<ActivitySelectionTableProps> = ({
  linkedActivityIds,
  onLinkActivities,
  onClose,
}) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['available-activities', debouncedSearchTerm],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select(`
          id,
          activity_type,
          activity_date,
          customer_name,
          contact_name,
          salesperson_name,
          status,
          notes
        `)
        .is('lead_center_id', null);

      if (debouncedSearchTerm) {
        query = query.ilike('customer_name', `%${debouncedSearchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      return data as Activity[];
    },
  });

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleLinkSelected = () => {
    if (selectedActivities.length > 0) {
      onLinkActivities(selectedActivities);
      setSelectedActivities([]);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Link Activities to Lead</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {isLoading ? (
             <div className="text-center py-8 text-muted-foreground flex-grow flex flex-col items-center justify-center">
                Loading activities...
             </div>
          ) :!activities || activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex-grow flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No available activities match your search</p>
              <p className="text-sm">Try a different search term or clear the search.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select activities to link to this lead ({selectedActivities.length} selected)
                </p>
                <Button 
                  onClick={handleLinkSelected}
                  disabled={selectedActivities.length === 0}
                >
                  Link Selected ({selectedActivities.length})
                </Button>
              </div>

              <div className="space-y-2 flex-grow overflow-y-auto">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50"
                  >
                    <Checkbox
                      className="mt-1"
                      checked={selectedActivities.includes(activity.id)}
                      onCheckedChange={() => handleActivityToggle(activity.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{activity.activity_type}</Badge>
                        {activity.status && (
                          <Badge variant="secondary">{activity.status}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
