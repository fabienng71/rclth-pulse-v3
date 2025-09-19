import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileX, Calendar, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { useQuery } from '@tanstack/react-query';
import { WriteoffRequestService } from '@/services/writeoff-requests';
import { WRITEOFF_REASONS } from '@/services/writeoff-requests/types';

const WriteoffRequestView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: writeoffRequest, isLoading, error } = useQuery({
    queryKey: ['writeoff-request', id],
    queryFn: () => WriteoffRequestService.getWriteoffRequest(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-4xl py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading write-off request...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !writeoffRequest) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/forms/writeoff')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Write-off Requests
            </Button>
          </div>
          <div className="text-center py-12">
            <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Write-off Request Not Found</h2>
            <p className="text-muted-foreground">The requested write-off request could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedReason = WRITEOFF_REASONS.find(r => r.value === writeoffRequest.reason);
  const totalCost = writeoffRequest.writeoff_request_items?.reduce((sum, item) => sum + item.total_cost, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/forms/writeoff')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Write-off Requests
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileX className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Write-off Request</h1>
              <p className="text-muted-foreground">
                Created on {format(new Date(writeoffRequest.created_at), 'PP')}
              </p>
            </div>
          </div>
          <Badge variant={writeoffRequest.status === 'approved' ? 'default' : 'secondary'}>
            {writeoffRequest.status === 'approved' ? 'Approved' : 'Submitted'}
          </Badge>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-xl font-semibold">{writeoffRequest.writeoff_request_items?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-semibold">THB {Math.round(totalCost).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="text-lg font-semibold">{selectedReason?.label}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Write-off Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Reason for Write-off</h4>
              <Badge variant="secondary">{selectedReason?.label}</Badge>
            </div>
            
            {writeoffRequest.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {writeoffRequest.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Items Written Off</CardTitle>
          </CardHeader>
          <CardContent>
            {writeoffRequest.writeoff_request_items && writeoffRequest.writeoff_request_items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Expiry Date</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writeoffRequest.writeoff_request_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        {format(new Date(item.exp_date), 'PP')}
                      </TableCell>
                      <TableCell className="text-right">{Math.round(item.cogs_unit || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{Math.round(item.total_cost).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={5} className="font-medium">Total</TableCell>
                    <TableCell className="text-right font-bold">{Math.round(totalCost).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No items found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WriteoffRequestView;