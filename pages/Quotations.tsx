
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, Table } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useQuotations } from '@/hooks/useQuotations';
import { Skeleton } from '@/components/ui/skeleton';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import { EnhancedQuotationsTable } from '@/components/quotations/EnhancedQuotationsTable';
import { GroupedQuotationsTable } from '@/components/quotations/GroupedQuotationsTable';
import { QuotationsFilters, QuotationsFiltersState } from '@/components/quotations/QuotationsFilters';
import { Quotation } from '@/types/quotations';

const Quotations = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('grouped');
  
  const [filters, setFilters] = useState<QuotationsFiltersState>({
    search: '',
    status: 'all',
    dateRange: undefined,
    sortField: 'created_at',
    sortDirection: 'desc',
    customerType: 'all',
  });

  const { quotations, isLoading, error, deleteQuotation, toggleArchive } = useQuotations();
  const { profile } = useAuthStore();
  
  const handleDelete = async () => {
    if (deleteId) {
      await deleteQuotation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleArchive = async (id: string, currentStatus: boolean) => {
    await toggleArchive.mutateAsync({ id, archive: !currentStatus });
  };


  const handleFiltersChange = (newFilters: Partial<QuotationsFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateRange: undefined,
      sortField: 'created_at',
      sortDirection: 'desc',
      customerType: 'all',
    });
  };

  // Apply filters to quotations
  const filteredQuotations = quotations?.filter(q => {
    // Archive filter
    const matchesArchiveFilter = showArchived ? q.archive : !q.archive;
    
    // Salesperson filter
    const matchesSalesperson = selectedSalesperson === 'all' || q.salesperson_code === selectedSalesperson;
    
    // Search filter
    const matchesSearch = !filters.search || 
      q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      q.lead_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      q.quote_number?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === 'all' || q.status === filters.status;
    
    // Customer type filter
    const matchesCustomerType = filters.customerType === 'all' || 
      (filters.customerType === 'lead' && q.is_lead) ||
      (filters.customerType === 'customer' && !q.is_lead);
    
    // Date range filter
    const matchesDateRange = !filters.dateRange?.from || !filters.dateRange?.to ||
      (new Date(q.created_at) >= filters.dateRange.from && new Date(q.created_at) <= filters.dateRange.to);
    
    return matchesArchiveFilter && matchesSalesperson && matchesSearch && 
           matchesStatus && matchesCustomerType && matchesDateRange;
  }) || [];

  // Sort quotations
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    const direction = filters.sortDirection === 'asc' ? 1 : -1;
    
    switch (filters.sortField) {
      case 'created_at':
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'quote_number':
        return direction * ((a.quote_number || '').localeCompare(b.quote_number || ''));
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'status':
        return direction * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold md:text-3xl">Quotations</h1>
              <p className="text-muted-foreground">
                Manage your quotations and proposals
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <SalespersonFilter
                  value={selectedSalesperson}
                  onChange={setSelectedSalesperson}
                />
              )}

              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grouped' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grouped')}
                  className="rounded-r-none"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Grouped
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-l-none"
                >
                  <Table className="mr-2 h-4 w-4" />
                  Table
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowArchived(!showArchived)}
                size="sm"
              >
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>

              <Button asChild>
                <Link to="/quotations/new">
                  <Plus className="mr-2 h-4 w-4" /> New Quotation
                </Link>
              </Button>
            </div>
          </div>
        </div>


        {/* Filters */}
        <QuotationsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          showAdvanced={showAdvancedFilters}
          onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />
        
        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load quotations</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : sortedQuotations.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-lg font-medium mb-2">
              {filteredQuotations.length === 0 && quotations?.length === 0 
                ? "No quotations yet" 
                : "No quotations match your filters"
              }
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredQuotations.length === 0 && quotations?.length === 0 
                ? "Create your first quotation to get started."
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {filteredQuotations.length === 0 && quotations?.length === 0 ? (
              <Button asChild>
                <Link to="/quotations/new">
                  <Plus className="mr-2 h-4 w-4" /> Create New Quotation
                </Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'grouped' ? (
          <GroupedQuotationsTable
            quotations={sortedQuotations}
            onDelete={setDeleteId}
            onArchive={handleArchive}
          />
        ) : (
          <EnhancedQuotationsTable
            quotations={sortedQuotations}
            onDelete={setDeleteId}
            onArchive={handleArchive}
          />
        )}
      </main>
      
      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quotation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quotation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteQuotation.isPending}>
              {deleteQuotation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotations;
