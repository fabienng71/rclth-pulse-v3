import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ReturnRequestTable from './ReturnRequestTable';
import ReturnRequestFilter from './ReturnRequestFilter';
import { useReturnRequests } from './hooks/useReturnRequests';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ReturnRequestsCard = () => {
  const {
    returnRequests,
    loading,
    fetchReturnRequests,
    deleteReturnRequest
  } = useReturnRequests();
  
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const navigate = useNavigate();
  const { user, userEmail } = useAuthStore();
  
  const adminEmails = ['fabien@repertoire.co.th', 'store@repertoire.co.th'];
  const isAdmin = user?.app_metadata?.role === 'admin' || (userEmail && adminEmails.includes(userEmail));
  
  // Fetch return requests on component mount - remove fetchReturnRequests from dependency array
  useEffect(() => {
    fetchReturnRequests();
  }, []); // Empty dependency array to prevent infinite loop

  const handleViewRequest = (id: string) => {
    navigate(`/forms/return/view/${id}`);
  };

  const handleEditRequest = (id: string) => {
    navigate(`/forms/return/edit/${id}`);
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this return request?')) {
      setDeleteInProgress(true);
      try {
        await deleteReturnRequest(id);
      } finally {
        setDeleteInProgress(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Recent Return Requests</CardTitle>
        <CardDescription>View and manage product return requests</CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin && (
          <ReturnRequestFilter
            nameFilter={nameFilter}
            onNameFilterChange={setNameFilter}
          />
        )}
        <ReturnRequestTable
          returnRequests={returnRequests}
          loading={loading}
          deleteInProgress={deleteInProgress}
          onViewRequest={handleViewRequest}
          onEditRequest={handleEditRequest}
          onDeleteRequest={handleDeleteRequest}
          formatDate={formatDate}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      </CardContent>
    </Card>
  );
};

export default ReturnRequestsCard;
