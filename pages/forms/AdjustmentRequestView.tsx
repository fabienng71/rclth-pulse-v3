import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Settings, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { AdjustmentRequestService } from '@/services/adjustment-requests';
import { ADJUSTMENT_REASONS } from '@/services/adjustment-requests/types';

const AdjustmentRequestView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['adjustment-request', id],
    queryFn: () => AdjustmentRequestService.getAdjustmentRequest(id!),
    enabled: !!id,
  });

  const getReasonLabel = (reason: string) => {
    return ADJUSTMENT_REASONS.find(r => r.value === reason)?.label || reason;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-4xl py-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading adjustment request...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-4xl py-6">
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-2 text-destructive">Request not found</p>
            <p className="text-muted-foreground mb-4">
              The adjustment request you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/forms/adjustment')}>
              Back to Adjustment Requests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/forms/adjustment')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Adjustment Requests
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Adjustment Request Details</h1>
            <p className="text-muted-foreground">View adjustment request information</p>
          </div>
        </div>

        {/* Request Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Date Created</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(request.created_at), 'PPP')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                  {request.status === 'approved' ? 'Approved' : 'Submitted'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Reason</div>
                <Badge variant="outline">{getReasonLabel(request.reason)}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Cost Impact</div>
                <div className={`text-lg font-semibold ${request.total_cost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(request.total_cost)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <div className="text-sm bg-muted/50 p-3 rounded-md">
                {request.notes || 'No notes provided'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Adjustment Items</CardTitle>
          </CardHeader>
          <CardContent>
            {request.adjustment_request_items && request.adjustment_request_items.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Current Stock</TableHead>
                      <TableHead className="text-center">Adjustment</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {request.adjustment_request_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.current_stock.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${item.adjustment_value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.adjustment_value > 0 ? '+' : ''}{item.adjustment_value.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_cost)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={item.adjustment_value >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(item.total_cost)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Summary */}
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-right space-y-2">
                    <div className="text-sm text-muted-foreground">Total Adjustment Cost</div>
                    <div className={`text-xl font-bold ${request.total_cost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(request.total_cost)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.total_cost >= 0 ? 'Positive adjustment (increase)' : 'Negative adjustment (decrease)'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items in this adjustment request
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustmentRequestView;