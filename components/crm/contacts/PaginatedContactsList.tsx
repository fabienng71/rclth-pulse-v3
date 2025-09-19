import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOptimizedContactsData, useContactsCount } from '@/hooks/useOptimizedContactsData';
import { useAllFilteredContactsData } from '@/hooks/useAllFilteredContactsData';
import { ContactsTable } from './ContactsTable';
import { ContactsGrid } from './ContactsGrid';
import { ContactsTableSkeleton, ContactsGridSkeleton } from './ContactsSkeleton';
import { PageSizeSelector } from './PageSizeSelector';
import { Contact } from '@/hooks/useOptimizedContactsData';

interface PaginatedContactsListProps {
  searchQuery: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  selectedSalesperson: string;
  selectedRegion: string;
  selectedStatus: string;
  view: 'table' | 'grid';
  selectedContacts: Contact[];
  onSelectionChange: (contacts: Contact[]) => void;
  onContactUpdate: () => void;
  onSort: (field: string) => void;
}

export const PaginatedContactsList: React.FC<PaginatedContactsListProps> = ({
  searchQuery,
  sortField,
  sortDirection,
  selectedSalesperson,
  selectedRegion,
  selectedStatus,
  view,
  selectedContacts,
  onSelectionChange,
  onContactUpdate,
  onSort
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25); // Reduced from 50 to 25 for better performance
  const [loadAllFiltered, setLoadAllFiltered] = useState(false);
  
  // Use server-side filtering
  const { contacts, loading } = useOptimizedContactsData(
    searchQuery, 
    sortField, 
    sortDirection as 'asc' | 'desc',
    currentPage,
    pageSize,
    selectedSalesperson,
    selectedRegion,
    selectedStatus
  );

  const { data: totalCount = 0 } = useContactsCount(
    searchQuery,
    selectedSalesperson,
    selectedRegion,
    selectedStatus
  );

  // Hook to fetch all filtered contacts when needed (with batch fetching)
  const { contacts: allFilteredContacts, loading: loadingAllFiltered } = useAllFilteredContactsData({
    searchQuery,
    selectedSalesperson,
    selectedRegion,
    selectedStatus,
    enabled: loadAllFiltered
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onSelectionChange([]); // Clear selection when changing pages
    setLoadAllFiltered(false);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page when changing page size
    onSelectionChange([]);
    setLoadAllFiltered(false);
  };

  const handleSelectAllFiltered = () => {
    console.log('Starting select all filtered contacts process...');
    setLoadAllFiltered(true);
  };

  // Auto-select when all filtered contacts are loaded
  React.useEffect(() => {
    if (loadAllFiltered && !loadingAllFiltered && allFilteredContacts.length > 0) {
      console.log(`Batch loading completed! Got ${allFilteredContacts.length} contacts.`);
      onSelectionChange(allFilteredContacts);
      setLoadAllFiltered(false);
    }
  }, [loadAllFiltered, loadingAllFiltered, allFilteredContacts, onSelectionChange]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
        {view === 'table' ? <ContactsTableSkeleton /> : <ContactsGridSkeleton />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show batch loading feedback */}
      {loadingAllFiltered && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <div className="animate-spin h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full"></div>
            <span className="font-medium">Loading all filtered contacts...</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            This may take a moment as we fetch all {totalCount} contacts from the database.
          </p>
        </div>
      )}

      {view === 'table' ? (
        <ContactsTable 
          contacts={contacts}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          selectedContacts={selectedContacts}
          onSelectionChange={onSelectionChange}
          onContactUpdate={onContactUpdate}
          totalFilteredCount={totalCount}
          onSelectAllFiltered={handleSelectAllFiltered}
          isSelectingAllFiltered={loadingAllFiltered}
        />
      ) : (
        <ContactsGrid contacts={contacts} />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} contacts
              {selectedContacts.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({selectedContacts.length} selected)
                </span>
              )}
            </div>
            <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, currentPage - 2) + i;
                if (pageNum >= totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
