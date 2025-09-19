import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LoadingState,
  SampleRequestsFilters,
  ViewModeControls,
  MonthGroupView,
  useSampleRequestsList
} from './enhanced-sample-requests';
import DeleteSampleRequestDialog from './DeleteSampleRequestDialog';

const EnhancedSampleRequestsList = () => {
  const {
    // Data
    requests,
    filteredRequests,
    loading,
    filteredMonthGroups,
    uniqueCreators,
    
    // UI State
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    dateRange,
    setDateRange,
    creatorFilter,
    handleCreatorFilterChange,
    hasActiveFilters,
    
    // Dialog State
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRequest,
    
    // Handlers
    handleMonthToggle,
    handleExpandAllMonths,
    handleCollapseAllMonths,
    handleViewRequest,
    handleEditRequest,
    handleNewRequest,
    handleDeleteClick,
    handleExport,
    handleDeleteRequest,
    
    // Utilities
    formatDate,
    formatItemDescriptions,
    refetch,
    
    // Sorting state
    sortField,
    sortDirection,
    handleSort,
    creatorFilter: tableCreatorFilter
  } = useSampleRequestsList();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <ViewModeControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        totalRequests={requests?.length || 0}
        filteredCount={filteredRequests.length}
        hasActiveFilters={hasActiveFilters}
        handleExpandAllMonths={handleExpandAllMonths}
        handleCollapseAllMonths={handleCollapseAllMonths}
        handleNewRequest={handleNewRequest}
        handleExport={handleExport}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <SampleRequestsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              creatorFilter={creatorFilter}
              handleCreatorFilterChange={handleCreatorFilterChange}
              uniqueCreators={uniqueCreators}
              dateRange={dateRange}
              setDateRange={setDateRange}
              showFilters={showFilters}
            />
          </div>
        </CardContent>
      </Card>

      <MonthGroupView
        filteredMonthGroups={filteredMonthGroups}
        viewMode={viewMode}
        handleMonthToggle={handleMonthToggle}
        formatDate={formatDate}
        formatItemDescriptions={formatItemDescriptions}
        handleViewRequest={handleViewRequest}
        handleEditRequest={handleEditRequest}
        handleDeleteClick={handleDeleteClick}
        creatorFilter={tableCreatorFilter}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <DeleteSampleRequestDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        request={selectedRequest}
        onDeleteSuccess={() => {
          setDeleteDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default EnhancedSampleRequestsList;