
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface Creator {
  created_by_name: string;
}

interface SampleRequestFilterProps {
  onCreatorChange: (value: string) => void;
  value: string;
}

export const SampleRequestFilter = ({ onCreatorChange, value }: SampleRequestFilterProps) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('sample_requests')
          .select('created_by_name')
          .not('created_by_name', 'is', null)
          .order('created_by_name');
          
        if (error) {
          console.error('Error fetching creators:', error);
          return;
        }

        console.log('Fetched creators data:', data);

        // Filter out any duplicate created_by_name to ensure unique values
        // Also ensure no empty strings
        const uniqueCreators = data?.reduce<Creator[]>((acc, curr) => {
          if (curr.created_by_name && 
              curr.created_by_name.trim() !== '' && 
              !acc.some(cr => cr.created_by_name === curr.created_by_name)) {
            acc.push(curr);
          }
          return acc;
        }, []) || [];

        setCreators(uniqueCreators);
      } catch (error) {
        console.error('Error in fetchCreators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // Ensure we're handling string values for the Select component
  const handleValueChange = (newValue: string) => {
    console.log('Selected creator value:', newValue);
    onCreatorChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="creator-filter" className="whitespace-nowrap text-sm font-medium">
        Filter by Salesperson:
      </Label>
      <Select value={value} onValueChange={handleValueChange} disabled={loading}>
        <SelectTrigger id="creator-filter" className="w-[220px]">
          <SelectValue placeholder="All Salespersons" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Salespersons</SelectItem>
          {creators.map((creator, index) => {
            // Ensure we never have an empty string value
            const creatorValue = creator.created_by_name?.trim() 
              ? creator.created_by_name 
              : `creator-${index}-${Date.now()}`;
              
            return (
              <SelectItem 
                key={index} 
                value={creatorValue}
              >
                {creator.created_by_name || "Unnamed Creator"}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
