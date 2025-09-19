import React from 'react';
import { GridViewCard } from './GridViewCard';
import { SampleRequest } from '@/services/sample-requests';

interface GridViewProps {
  requests: SampleRequest[];
  formatDate: (date: string) => string;
  formatItemDescriptions: (items: any[]) => string;
  handleViewRequest: (id: string) => void;
  handleEditRequest: (id: string) => void;
  handleDeleteClick: (request: SampleRequest) => void;
}

export const GridView: React.FC<GridViewProps> = ({
  requests,
  formatDate,
  formatItemDescriptions,
  handleViewRequest,
  handleEditRequest,
  handleDeleteClick
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <GridViewCard
          key={request.id}
          request={request}
          formatDate={formatDate}
          formatItemDescriptions={formatItemDescriptions}
          handleViewRequest={handleViewRequest}
          handleEditRequest={handleEditRequest}
          handleDeleteClick={handleDeleteClick}
        />
      ))}
    </div>
  );
};