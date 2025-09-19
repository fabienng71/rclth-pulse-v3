
import React, { useState } from 'react';
import { useOptimizedLeadsData, useLeadsCount, Lead } from '@/hooks/useOptimizedLeadsData';
import { useSortableTable } from '@/hooks/useSortableTable';
import { LeadsTable } from './LeadsTable';
import { LeadsGrid } from './LeadsGrid';
import { LeadsViewToggle } from './LeadsViewToggle';
import { EnhancedPaginationControls } from '@/components/crm/contacts/EnhancedPaginationControls';
import { PageSizeSelector } from '@/components/crm/contacts/PageSizeSelector';
import { LeadsSkeleton } from './LeadsSkeleton';

type SortField = 'customer_name' | 'contact_name' | 'email' | 'status' | 'full_name' | 'updated_at';

interface PaginatedLeadsListProps {
  searchQuery: string;
  selectedSalesperson: string;
  selectedStatus: string;
  view: 'table' | 'grid';
  selectedLeads: Lead[];
  onSelectionChange: (leads: Lead[]) => void;
  onLeadUpdate: () => void;
}

export const PaginatedLeadsList = ({
  searchQuery,
  selectedSalesperson,
  selectedStatus,
  view,
  selectedLeads,
  onSelectionChange,
  onLeadUpdate
}: PaginatedLeadsListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('updated_at');

  const { leads, loading, refetch } = useOptimizedLeadsData(
    searchQuery,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    selectedSalesperson,
    selectedStatus
  );

  const { data: totalCount = 0 } = useLeadsCount(
    searchQuery,
    selectedSalesperson,
    selectedStatus
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onSelectionChange([]); // Clear selection when changing pages
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page
    onSelectionChange([]); // Clear selection
  };

  const handleLeadUpdate = () => {
    refetch();
    onLeadUpdate();
  };

  if (loading) {
    return <LeadsSkeleton view={view} />;
  }

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {leads.length} of {totalCount.toLocaleString()} leads
          {selectedLeads.length > 0 && (
            <span className="ml-2 font-medium">
              ({selectedLeads.length} selected)
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <PageSizeSelector 
            pageSize={pageSize} 
            onPageSizeChange={handlePageSizeChange}
          />
          <LeadsViewToggle view={view} onViewChange={() => {}} />
        </div>
      </div>

      {/* Leads Display */}
      {view === 'table' ? (
        <LeadsTable
          leads={leads}
          selectedLeads={selectedLeads}
          onSelectionChange={onSelectionChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onLeadUpdate={handleLeadUpdate}
        />
      ) : (
        <LeadsGrid
          leads={leads}
          onDelete={() => handleLeadUpdate()}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <EnhancedPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalItems={totalCount}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};
