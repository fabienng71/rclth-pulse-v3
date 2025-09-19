import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import MonthHeader from './MonthHeader';
import {
  ReturnRequestsHeader,
  ReturnRequestsLoadingState,
  ReturnRequestsEmptyState,
  ReturnRequestsTable,
  ReturnRequestDeleteDialog,
  useReturnRequests,
} from './return-requests';

const EnhancedReturnRequestsCard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();

  const {
    // State
    requests,
    loading,
    searchQuery,
    expandedRows,
    itemDetails,
    deleteDialogOpen,
    deleteInProgress,
    filteredMonthGroups,

    // Handlers
    setSearchQuery,
    handleMonthToggle,
    handleExpandAllMonths,
    handleCollapseAllMonths,
    toggleRowExpansion,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Utilities
    getStatusBadgeClass,
    getPriorityBadgeClass,
    formatDate,
  } = useReturnRequests({ user, isAdmin });

  // Navigation handlers
  const handleView = (id: string) => {
    navigate(`/forms/return/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/forms/return/edit/${id}`);
  };

  if (loading) {
    return <ReturnRequestsLoadingState />;
  }

  return (
    <>
      <Card>
        <ReturnRequestsHeader
          totalCount={requests.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExpandAll={handleExpandAllMonths}
          onCollapseAll={handleCollapseAllMonths}
        />
        
        <CardContent>
          {filteredMonthGroups.length === 0 ? (
            <ReturnRequestsEmptyState hasSearchQuery={!!searchQuery} />
          ) : (
            <div className="space-y-4">
              {filteredMonthGroups.map((monthGroup) => (
                <div key={monthGroup.monthKey} className="border rounded-lg overflow-hidden">
                  <MonthHeader
                    monthGroup={monthGroup}
                    onToggleExpansion={handleMonthToggle}
                  />
                  
                  {monthGroup.isExpanded && (
                    <ReturnRequestsTable
                      monthGroup={monthGroup}
                      expandedRows={expandedRows}
                      itemDetails={itemDetails}
                      onToggleExpansion={toggleRowExpansion}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      getPriorityBadgeClass={getPriorityBadgeClass}
                      getStatusBadgeClass={getStatusBadgeClass}
                      formatDate={formatDate}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReturnRequestDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteInProgress}
      />
    </>
  );
};

export default EnhancedReturnRequestsCard;