
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check, Plus } from 'lucide-react';
import { Control, useFormContext, FieldValues } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { CreateLeadModal } from '@/components/crm/lead-form/CreateLeadModal';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  customer_name: string;
  contact_name?: string | null;
  status?: string | null;
}

interface LeadFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const LeadField = <T extends FieldValues = FieldValues>({ control }: LeadFieldProps<T>) => {
  const { watch, setValue } = useFormContext();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [openLeadSearch, setOpenLeadSearch] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createLeadModalOpen, setCreateLeadModalOpen] = useState(false);

  // Watch form values properly
  const leadId = watch('lead_id');
  const leadName = watch('lead_name');

  console.log('LeadField render - leadId:', leadId, 'leadName:', leadName);

  // Fetch lead data based on ID if already selected
  useEffect(() => {
    const fetchLeadData = async () => {
      if (leadId && !selectedLead) {
        console.log('Fetching lead data for ID:', leadId);
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('id, customer_name, contact_name, status')
            .eq('id', leadId)
            .single();
            
          if (error) {
            console.error('Error fetching lead data:', error);
            return;
          }
          
          if (data) {
            console.log('Lead data fetched:', data);
            setSelectedLead(data);
          }
        } catch (err) {
          console.error('Error in lead data fetch:', err);
        }
      }
    };

    fetchLeadData();
  }, [leadId, selectedLead]);

  // Search for leads
  useEffect(() => {
    const searchLeads = async () => {
      if (debouncedSearchTerm.length < 2) {
        setLeads([]);
        return;
      }
      
      console.log('Searching leads with term:', debouncedSearchTerm);
      setIsSearching(true);
      
      try {
        let query = supabase
          .from('leads')
          .select('id, customer_name, contact_name, status')
          .order('customer_name', { ascending: true });
        
        // Filter by search term
        query = query.ilike('customer_name', `%${debouncedSearchTerm}%`);
        
        console.log('Executing lead search query...');
        const { data, error } = await query.limit(10);
        
        if (error) {
          console.error('Lead search query error:', error);
          throw error;
        }
        
        console.log('Lead search results:', data);
        setLeads(data || []);
      } catch (error) {
        console.error('Error searching leads:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    searchLeads();
  }, [debouncedSearchTerm]);

  // Show search dropdown when typing
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setOpenLeadSearch(true);
    } else {
      setOpenLeadSearch(false);
    }
  }, [debouncedSearchTerm]);

  const handleSelectLead = (lead: Lead) => {
    console.log('Selecting lead:', lead);
    setSelectedLead(lead);
    
    // Set form values using proper react-hook-form methods
    setValue('lead_id', lead.id);
    setValue('lead_name', lead.customer_name);
    
    // Close search dropdown and clear search
    setOpenLeadSearch(false);
    setSearchTerm('');
    
    console.log('Lead selected - ID:', lead.id, 'Name:', lead.customer_name);
  };

  const handleLeadCreated = (lead: Lead) => {
    console.log('New lead created:', lead);
    setSelectedLead(lead);
    setValue('lead_id', lead.id);
    setValue('lead_name', lead.customer_name);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchTerm(value);
    
    // Clear selection if user starts typing again
    if (value !== '' && selectedLead) {
      setSelectedLead(null);
      setValue('lead_id', '');
      setValue('lead_name', '');
    }
  };

  const handleSearchInputClick = () => {
    if (searchTerm.length >= 2) {
      console.log('Opening search dropdown');
      setOpenLeadSearch(true);
    }
  };

  return (
    <FormField
      control={control}
      name="lead_id"
      render={({ field }) => (
        <FormItem className="flex flex-col relative">
          <div className="relative">
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onClick={handleSearchInputClick}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          
          {field.value && selectedLead && (
            <div className="text-sm text-muted-foreground mt-1 bg-amber-50 p-2 rounded-md">
              Selected: {selectedLead.customer_name}
              {selectedLead.status && ` (${selectedLead.status})`}
            </div>
          )}
          
          <FormMessage />
          
          {openLeadSearch && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              <div className="p-1">
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <span className="text-sm text-muted-foreground">🔍 Searching leads...</span>
                  </div>
                ) : searchTerm.length < 2 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                ) : leads.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No leads found for "{searchTerm}"
                  </div>
                ) : (
                  <Command className="border-none">
                    <CommandList>
                      <CommandGroup>
                        {leads.map((lead) => (
                          <CommandItem
                            key={lead.id}
                            value={lead.id}
                            onSelect={() => {
                              field.onChange(lead.id);
                              handleSelectLead(lead);
                            }}
                            className="cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                            <div className="flex flex-col">
                              <span>{lead.customer_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {lead.contact_name || 'No contact'} ({lead.status || 'Unknown'})
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
              </div>
            </div>
          )}
          
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => setCreateLeadModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Create New Lead
          </Button>
          
          <CreateLeadModal
            open={createLeadModalOpen}
            onOpenChange={setCreateLeadModalOpen}
            onLeadCreated={handleLeadCreated}
          />
          
          {/* Hidden input for lead_name */}
          <FormField
            control={control}
            name="lead_name"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </FormItem>
      )}
    />
  );
};
