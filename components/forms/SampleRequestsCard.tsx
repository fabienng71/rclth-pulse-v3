
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { SampleRequestFilter } from './sample/SampleRequestFilter';
import DeleteSampleRequestDialog from './sample/DeleteSampleRequestDialog';
import SampleRequestsLoading from './sample/SampleRequestsLoading';
import SampleRequestsEmpty from './sample/SampleRequestsEmpty';
import SampleRequestsTable from './sample/SampleRequestsTable';
import { useSampleRequests } from './sample/hooks/useSampleRequests';

const SampleRequestsCard = () => {
  const {
    requests,
    filteredRequests,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRequest,
    creatorFilter,
    sortField,
    sortDirection,
    handleSort,
    handleCreatorFilterChange,
    handleViewRequest,
    handleEditRequest,
    handleDeleteClick,
    formatItemDescriptions,
    formatDate,
    loadSampleRequests
  } = useSampleRequests();
  
  if (loading) {
    return <SampleRequestsLoading />;
  }
  
  if (requests.length === 0) {
    return <SampleRequestsEmpty />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sample Requests</CardTitle>
        <CardDescription>View and manage sample requests you've submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <SampleRequestFilter 
            value={creatorFilter} 
            onCreatorChange={handleCreatorFilterChange} 
          />
        </div>
        
        <SampleRequestsTable
          requests={filteredRequests}
          formatDate={formatDate}
          formatItemDescriptions={formatItemDescriptions}
          onViewRequest={handleViewRequest}
          onEditRequest={handleEditRequest}
          onDeleteClick={handleDeleteClick}
          creatorFilter={creatorFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        
        {selectedRequest && (
          <DeleteSampleRequestDialog
            requestId={selectedRequest.id}
            customerName={selectedRequest.customer_name}
            isOpen={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDeleted={loadSampleRequests}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SampleRequestsCard;
