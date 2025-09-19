
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useSortableTable } from '@/hooks/useSortableTable';
import { ContactsHeader } from '@/components/crm/contacts/ContactsHeader';
import { EnhancedContactsSearchBar } from '@/components/crm/contacts/EnhancedContactsSearchBar';
import { ContactsFilters } from '@/components/crm/contacts/ContactsFilters';
import { ContactsStats } from '@/components/crm/contacts/ContactsStats';
import { ContactsBulkActions } from '@/components/crm/contacts/ContactsBulkActions';
import { PaginatedContactsList } from '@/components/crm/contacts/PaginatedContactsList';
import { ContactTagsProvider } from '@/contexts/ContactTagsContext';
import { Contact } from '@/hooks/useOptimizedContactsData';
import { useContactsStatistics } from '@/hooks/useContactsStatistics';
import { useProfilesList } from '@/hooks/useProfilesList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type SortField = 'first_name' | 'last_name' | 'account' | 'position' | 'email' | 'region' | 'status' | 'health_score';

const ContactsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);  
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('first_name');
  const { statistics, refetch: refetchStatistics } = useContactsStatistics();
  const queryClient = useQueryClient();

  // Fetch real salesperson data
  const { data: salespeopleData } = useProfilesList();
  // Create a map of spp_code to full_name for display purposes
  const salespersonNameMap = (salespeopleData || []).reduce((acc, profile) => {
    if (profile.spp_code && profile.full_name) {
      acc[profile.spp_code] = profile.full_name;
    }
    return acc;
  }, {} as Record<string, string>);
  
  // For the legacy interface (display names for UI)
  const salespersonOptions = Object.values(salespersonNameMap);

  // Fetch unique regions from contacts
  const { data: regionData } = useQuery({
    queryKey: ['contact-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('region')
        .not('region', 'is', null)
        .neq('region', '');
      
      if (error) throw error;
      
      const uniqueRegions = Array.from(
        new Set(data?.map(contact => contact.region).filter(Boolean))
      ).sort();
      
      return uniqueRegions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const regionOptions = regionData || [];

  // Fetch contacts for the filters component - get full contact objects
  const { data: contactsForFilters } = useQuery({
    queryKey: ['contacts-for-filters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .limit(1000); // Reasonable limit for filter data
      
      if (error) throw error;
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleClearAllFilters = () => {
    setSelectedSalesperson('all');
    setSelectedRegion('all');
    setSelectedStatus('all');
  };

  const handleContactsUpdated = () => {
    // Invalidate all contact-related queries for fresh data
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    queryClient.invalidateQueries({ queryKey: ['contacts-count'] });
    queryClient.invalidateQueries({ queryKey: ['contact-regions'] });
    queryClient.invalidateQueries({ queryKey: ['contacts-for-filters'] });
    setSelectedContacts([]);
    // Refetch statistics when contacts are updated
    refetchStatistics();
  };

  const handleSelectionClear = () => {
    setSelectedContacts([]);
  };

  return (
    <ContactTagsProvider>
      <Navigation />
      <main className="container py-6 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col space-y-6">
          <ContactsHeader 
            selectedContacts={selectedContacts}
          />
          
          <ContactsStats 
            totalContacts={statistics?.totalContacts || 0}
            activeContacts={statistics?.activeContacts || 0}
            highValueContacts={statistics?.highValueContacts || 0}
            recentlyAdded={statistics?.recentlyAdded || 0}
            isLoading={!statistics}
          />
          
          <EnhancedContactsSearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSalesperson={selectedSalesperson === 'all' ? 'all' : salespersonNameMap[selectedSalesperson] || selectedSalesperson}
            onSalespersonChange={(salesperson) => {
              if (salesperson === 'all') {
                setSelectedSalesperson('all');
              } else {
                // Convert from full name back to spp_code
                const sppCode = Object.keys(salespersonNameMap).find(code => salespersonNameMap[code] === salesperson);
                setSelectedSalesperson(sppCode || salesperson);
              }
            }}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            salespersonOptions={salespersonOptions}
            regionOptions={regionOptions}
            onClearFilters={handleClearAllFilters}
          />
          
          {showFilters && (
            <ContactsFilters 
              contacts={contactsForFilters || []}
              onSalespersonFilter={setSelectedSalesperson}
              onRegionFilter={setSelectedRegion}
              selectedSalesperson={selectedSalesperson}
              selectedRegion={selectedRegion}
            />
          )}

          <PaginatedContactsList
            searchQuery={searchQuery}
            sortField={sortField}
            sortDirection={sortDirection}
            selectedSalesperson={selectedSalesperson}
            selectedRegion={selectedRegion}
            selectedStatus={selectedStatus}
            view={view}
            selectedContacts={selectedContacts}
            onSelectionChange={setSelectedContacts}
            onContactUpdate={handleContactsUpdated}
            onSort={handleSort}
          />
        </div>

        <ContactsBulkActions
          selectedContacts={selectedContacts}
          onContactsUpdated={handleContactsUpdated}
          onSelectionClear={handleSelectionClear}
        />
      </main>
    </ContactTagsProvider>
  );
};

export default ContactsList;
