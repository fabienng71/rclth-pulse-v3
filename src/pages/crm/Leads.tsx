
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "../../components/Navigation";
import { Lead } from '@/hooks/useOptimizedLeadsData';
import { useLeadsStatistics } from '@/hooks/useLeadsStatistics';
import { LeadsHeader } from '@/components/crm/leads/LeadsHeader';
import { LeadsStats } from '@/components/crm/leads/LeadsStats';
import { EnhancedLeadsSearchBar } from '@/components/crm/leads/EnhancedLeadsSearchBar';
import { PaginatedLeadsList } from '@/components/crm/leads/PaginatedLeadsList';
import { LeadsBulkActions } from '@/components/crm/leads/LeadsBulkActions';
import { useQueryClient } from '@tanstack/react-query';

const fetchSalespeople = async () => {
  const { data, error } = await supabase
    .from("leads")
    .select("full_name")
    .not("full_name", "is", null)
    .order("full_name");
  
  if (error) throw error;
  
  const uniqueSalespeople = Array.from(new Set(data.map(d => d.full_name)));
  return uniqueSalespeople;
};

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  
  const { statistics, loading: statsLoading, refetch: refetchStats } = useLeadsStatistics();
  const queryClient = useQueryClient();

  const { data: salespeople = [] } = useQuery({
    queryKey: ["leads-salespeople"],
    queryFn: fetchSalespeople,
  });

  const handleClearFilters = () => {
    setSelectedSalesperson('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const handleLeadsUpdated = () => {
    // Invalidate all lead-related queries for fresh data
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['leads-count'] });
    setSelectedLeads([]);
    // Refetch statistics when leads are updated
    refetchStats();
  };

  const handleSelectionClear = () => {
    setSelectedLeads([]);
  };

  return (
    <>
      <Navigation />
      <main className="container py-6 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col space-y-6">
          <LeadsHeader selectedLeads={selectedLeads} />
          
          <LeadsStats 
            totalLeads={statistics?.totalLeads || 0}
            activeLeads={statistics?.activeLeads || 0}
            convertedLeads={statistics?.convertedLeads || 0}
            recentlyAdded={statistics?.recentlyAdded || 0}
            isLoading={statsLoading}
          />
          
          <EnhancedLeadsSearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSalesperson={selectedSalesperson}
            onSalespersonChange={setSelectedSalesperson}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            salespersonOptions={salespeople}
            onClearFilters={handleClearFilters}
          />

          <PaginatedLeadsList
            searchQuery={searchQuery}
            selectedSalesperson={selectedSalesperson}
            selectedStatus={selectedStatus}
            view={view}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
            onLeadUpdate={handleLeadsUpdated}
          />
        </div>

        <LeadsBulkActions
          selectedLeads={selectedLeads}
          onLeadsUpdated={handleLeadsUpdated}
          onSelectionClear={handleSelectionClear}
        />
      </main>
    </>
  );
};

export default Leads;
