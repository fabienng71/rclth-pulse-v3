import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Settings, Plus, ArrowLeft, Eye, Calendar, Package, Trash2, Search, ExpandIcon, ShrinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { AdjustmentRequestService } from '@/services/adjustment-requests';
import { ADJUSTMENT_REASONS } from '@/services/adjustment-requests/types';
import { useToast } from '@/hooks/use-toast';
import { groupRequestsByMonth, filterMonthGroups, toggleMonthExpansion, setAllMonthsExpanded, MonthGroup } from '@/utils/monthGrouping';
import MonthHeader from '@/components/forms/MonthHeader';

const AdjustmentRequestsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [monthGroups, setMonthGroups] = useState<MonthGroup<Record<string, unknown>>[]>([]);

  const { data: adjustmentRequests, isLoading, error } = useQuery({
    queryKey: ['adjustment-requests'],
    queryFn: AdjustmentRequestService.getAdjustmentRequests,
  });

  // Create month groups when requests change
  React.useEffect(() => {
    if (adjustmentRequests && adjustmentRequests.length > 0) {
      const grouped = groupRequestsByMonth(adjustmentRequests);
      setMonthGroups(grouped);
    }
  }, [adjustmentRequests]);

  // Month expansion handlers
  const handleMonthToggle = (monthKey: string) => {
    setMonthGroups(prev => toggleMonthExpansion(prev, monthKey));
  };

  const handleExpandAllMonths = () => {
    setMonthGroups(prev => setAllMonthsExpanded(prev, true));
  };

  const handleCollapseAllMonths = () => {
    setMonthGroups(prev => setAllMonthsExpanded(prev, false));
  };

  // Create filtered month groups for search results
  const filteredMonthGroups = useMemo(() => {
    return filterMonthGroups(monthGroups, searchQuery);
  }, [monthGroups, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: AdjustmentRequestService.deleteAdjustmentRequest,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adjustment request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['adjustment-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete adjustment request",
        variant: "destructive",
      });
    },
  });

  const getReasonLabel = (reason: string) => {
    return ADJUSTMENT_REASONS.find(r => r.value === reason)?.label || reason;
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this adjustment request?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-6xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/forms')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Adjustment Requests</h1>
              <p className="text-muted-foreground">Manage inventory adjustment requests</p>
            </div>
          </div>
          <Button onClick={() => navigate('/forms/adjustment/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment Request
          </Button>
        </div>

        {/* Adjustment Requests List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Adjustment Requests</CardTitle>
                <CardDescription>
                  View and manage all adjustment requests
                </CardDescription>
              </div>
              
              {/* Bulk expand/collapse controls */}
              {adjustmentRequests && adjustmentRequests.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandAllMonths}
                    className="text-xs"
                  >
                    <ExpandIcon className="h-3 w-3 mr-1" />
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapseAllMonths}
                    className="text-xs"
                  >
                    <ShrinkIcon className="h-3 w-3 mr-1" />
                    Collapse All
                  </Button>
                </div>
              )}
            </div>
            
            {/* Search Bar */}
            {adjustmentRequests && adjustmentRequests.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search adjustment requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading adjustment requests...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-medium mb-2 text-destructive">Error loading requests</p>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the adjustment requests. Please try again.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : !adjustmentRequests || adjustmentRequests.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No adjustment requests yet</p>
                <p className="text-muted-foreground mb-4">
                  Create your first adjustment request to get started
                </p>
                <Button onClick={() => navigate('/forms/adjustment/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Adjustment Request
                </Button>
              </div>
            ) : filteredMonthGroups.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No adjustment requests found matching your search
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMonthGroups.map((monthGroup) => (
                  <div key={monthGroup.monthKey} className="border rounded-lg overflow-hidden">
                    <MonthHeader
                      monthGroup={monthGroup}
                      onToggleExpansion={handleMonthToggle}
                    />
                    
                    {monthGroup.isExpanded && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-center">Items</TableHead>
                              <TableHead className="text-right">Total Cost</TableHead>
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {monthGroup.requests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {format(new Date(request.created_at), 'PP')}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getReasonLabel(request.reason)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                                    {request.status === 'approved' ? 'Approved' : 'Submitted'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {request.adjustment_request_items?.length || 0}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`font-medium ${request.total_cost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(request.total_cost)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/forms/adjustment/view/${request.id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(request.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustmentRequestsList;