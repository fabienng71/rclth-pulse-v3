import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LeaveRequest, LeaveRequestFilters } from '@/types/leave';
import { useUserRole } from '@/hooks/useUserRole';
import {
  LeaveRequestsFilters,
  LeaveRequestsActions,
  LeaveRequestsTableHeader,
  LeaveRequestsTableRow,
  LeaveRequestsLoadingState,
  LeaveRequestsEmptyState,
  LeaveRequestsTablePagination,
  useLeaveRequestsTable,
} from './table';
import { DenialDialog, DetailsDialog, useLeaveRequestsActions } from './dialogs';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  showActions?: boolean;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

// Badge color utility functions
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Denied':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getLeaveTypeColor = (type: string): string => {
  switch (type) {
    case 'Sick Leave':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Annual Leave':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Personal Leave':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Emergency Leave':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  requests = [],
  showActions = false,
  isLoading = false,
  title = 'Leave Requests',
  description = 'View and manage leave requests'
}) => {
  const { role } = useUserRole();
  
  const {
    handleApprove,
    handleDeny,
    handleDelete,
    handleRevert,
    handleView,
    handleEdit,
    handleCreateRequest,
    handleExportToCSV,
    handleExportToPDF,
    handleDenyAction,
    selectedRequest,
    showDetails,
    showDenialDialog,
    isSubmitting,
    setShowDetails,
    setShowDenialDialog,
  } = useLeaveRequestsActions();

  const {
    filteredRequests,
    filteredCount,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    clearFilters,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    handlePageChange,
    selectedRequests,
    setSelectedRequests,
    selectAll,
    handleSelectAll,
    isProcessing,
    setIsProcessing,
    handleBulkApprove,
    handleBulkDeny,
  } = useLeaveRequestsTable(requests);

  if (isLoading) {
    return <LeaveRequestsLoadingState showActions={showActions} />;
  }

  if (filteredCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveRequestsEmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LeaveRequestsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            clearFilters={clearFilters}
            totalCount={requests.length}
            filteredCount={filteredCount}
          />

          {showActions && (
            <LeaveRequestsActions
              selectedCount={selectedRequests.size}
              onCreateRequest={handleCreateRequest}
              onExportToCSV={handleExportToCSV}
              onExportToPDF={handleExportToPDF}
              onBulkApprove={handleBulkApprove}
              onBulkDeny={handleBulkDeny}
              isProcessing={isProcessing}
              canApprove={role === 'Admin'}
            />
          )}

          <div className="border rounded-lg">
            <Table>
              <LeaveRequestsTableHeader
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                showCheckboxes={showActions}
                canApprove={role === 'Admin'}
              />
              <TableBody>
                {filteredRequests.map((request) => (
                  <LeaveRequestsTableRow
                    key={request.id}
                    request={request}
                    isSelected={selectedRequests.has(request.id)}
                    onSelect={(id, selected) => {
                      const newSelected = new Set(selectedRequests);
                      if (selected) {
                        newSelected.add(id);
                      } else {
                        newSelected.delete(id);
                      }
                      setSelectedRequests(newSelected);
                    }}
                    onView={handleView}
                    onEdit={handleEdit}
                    onApprove={handleApprove}
                    onDeny={handleDenyAction}
                    onDelete={handleDelete}
                    onRevert={handleRevert}
                    showCheckboxes={showActions}
                    canApprove={role === 'Admin'}
                    getStatusColor={getStatusColor}
                    getLeaveTypeColor={getLeaveTypeColor}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <LeaveRequestsTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={filteredCount}
          />
        </CardContent>
      </Card>

      <DenialDialog
        isOpen={showDenialDialog}
        onClose={() => setShowDenialDialog(false)}
        onConfirm={handleDeny}
        selectedRequest={selectedRequest}
        isSubmitting={isSubmitting}
      />

      <DetailsDialog
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        selectedRequest={selectedRequest}
        getLeaveTypeColor={getLeaveTypeColor}
        getStatusColor={getStatusColor}
      />
    </>
  );
};