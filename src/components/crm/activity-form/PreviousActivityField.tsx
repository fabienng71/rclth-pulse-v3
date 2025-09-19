
import React, { useState, useEffect } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Link, Link2Off } from 'lucide-react';
import DOMPurify from 'dompurify';

interface PreviousActivityFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
  customerCode?: string;
  leadId?: string;
  isLead?: boolean;
  currentActivityId?: string;
}

interface Activity {
  id: string;
  activity_date: string;
  activity_type: string;
  notes?: string;
  pipeline_stage?: string;
}

const stripHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

const truncateText = (text: string, maxLength: number = 80): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const PreviousActivityField = <T extends FieldValues = FieldValues>({ 
  control, 
  name, 
  customerCode, 
  leadId, 
  isLead,
  currentActivityId
}: PreviousActivityFieldProps<T>) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('PreviousActivityField render:', {
    customerCode,
    leadId,
    isLead,
    currentActivityId
  });

  useEffect(() => {
    const fetchPreviousActivities = async () => {
      if (!customerCode && !leadId) {
        console.log('No customer or lead selected, skipping activities fetch');
        setActivities([]);
        return;
      }
      
      console.log('=== FETCHING PREVIOUS ACTIVITIES ===');
      console.log('Parameters:', { customerCode, leadId, isLead, currentActivityId });
      
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('activities')
          .select('id, activity_date, activity_type, notes, pipeline_stage')
          .order('activity_date', { ascending: false })
          .limit(20);

        if (isLead && leadId) {
          query = query.eq('lead_id', leadId);
          console.log('Filtering by lead_id:', leadId);
        } else if (customerCode) {
          query = query.eq('customer_code', customerCode);
          console.log('Filtering by customer_code:', customerCode);
        }

        if (currentActivityId) {
          query = query.neq('id', currentActivityId);
          console.log('Excluding current activity:', currentActivityId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching previous activities:', error);
          throw error;
        }
        
        console.log('Fetched activities:', data);
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching previous activities:', error);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousActivities();
  }, [customerCode, leadId, isLead, currentActivityId]);

  if (!customerCode && !leadId) {
    console.log('PreviousActivityField: No entity selected, not rendering');
    return null;
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Previous Activity (Optional)
          </FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log('Previous activity selected:', value);
              // Handle the "none" option by setting undefined/null
              const selectedValue = value === 'none' ? undefined : value;
              field.onChange(selectedValue);
            }}
            value={field.value || 'none'}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger className="min-h-[40px]">
                <SelectValue 
                  placeholder={
                    loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground" />
                        Loading activities...
                      </div>
                    ) : error ? (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Error loading activities
                      </div>
                    ) : (
                      "Select previous activity to link"
                    )
                  } 
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* None option to unlink */}
              <SelectItem value="none" className="py-3">
                <div className="flex items-center gap-2">
                  <Link2Off className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">None (No linked activity)</span>
                </div>
              </SelectItem>
              
              {loading ? (
                <div className="p-2">
                  <Skeleton className="h-12 w-full mb-2" />
                  <Skeleton className="h-12 w-full mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : error ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                  {error}
                </div>
              ) : activities.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No previous activities found
                </div>
              ) : (
                activities.map((activity) => {
                  const cleanNotes = activity.notes ? stripHtml(activity.notes) : '';
                  const truncatedNotes = truncateText(cleanNotes);
                  
                  return (
                    <SelectItem key={activity.id} value={activity.id} className="py-3">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs font-medium shrink-0">
                            {activity.activity_type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {format(new Date(activity.activity_date), 'MMM dd, yyyy')}
                          </span>
                          {activity.pipeline_stage && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.pipeline_stage}
                            </Badge>
                          )}
                        </div>
                        {truncatedNotes && (
                          <div className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                            {truncatedNotes}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
          {field.value && field.value !== 'none' && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Link className="h-3 w-3" />
              Activity linked successfully
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
