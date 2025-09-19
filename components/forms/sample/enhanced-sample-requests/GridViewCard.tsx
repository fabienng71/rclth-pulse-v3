import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Building, Package, Clock, User } from 'lucide-react';
import { SampleRequest } from '@/services/sample-requests';

interface GridViewCardProps {
  request: SampleRequest;
  formatDate: (date: string) => string;
  formatItemDescriptions: (items: any[]) => string;
  handleViewRequest: (id: string) => void;
  handleEditRequest: (id: string) => void;
  handleDeleteClick: (request: SampleRequest) => void;
}

export const GridViewCard: React.FC<GridViewCardProps> = ({
  request,
  formatDate,
  formatItemDescriptions,
  handleViewRequest,
  handleEditRequest,
  handleDeleteClick
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{request.customers?.search_name || request.customers?.customer_name || request.customer_code}</h3>
            {/* Show customer_name below if different from search_name */}
            {request.customers?.search_name && request.customers?.customer_name && 
             request.customers.search_name !== request.customers.customer_name && (
              <div className="text-xs text-muted-foreground">
                {request.customers.customer_name}
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Building className="h-3 w-3" />
              <span>{request.customer_code}</span>
            </div>
          </div>
          <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
            {request.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{formatItemDescriptions(request.items || request.sample_request_items)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{request.created_by}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Created {formatDate(request.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewRequest(request.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRequest(request.id)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(request)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};