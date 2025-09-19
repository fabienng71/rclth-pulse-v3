import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileX, Plus, ArrowLeft, Eye, Calendar, Package, Trash2, Search, ExpandIcon, ShrinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { WriteoffRequestService } from '@/services/writeoff-requests';
import { WRITEOFF_REASONS } from '@/services/writeoff-requests/types';
import { useToast } from '@/hooks/use-toast';
import { groupRequestsByMonth, filterMonthGroups, toggleMonthExpansion, setAllMonthsExpanded, MonthGroup } from '@/utils/monthGrouping';
import MonthHeader from '@/components/forms/MonthHeader';

const WriteoffRequestsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [monthGroups, setMonthGroups] = useState<MonthGroup<Record<string, unknown>>[]>([]);

  const { data: writeoffRequests, isLoading, error } = useQuery({
    queryKey: ['writeoff-requests'],
    queryFn: WriteoffRequestService.getWriteoffRequests,
  });

  // Create month groups when requests change
  React.useEffect(() => {
    if (writeoffRequests && writeoffRequests.length > 0) {
      const grouped = groupRequestsByMonth(writeoffRequests);
      setMonthGroups(grouped);
    }
  }, [writeoffRequests]);

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
    mutationFn: WriteoffRequestService.deleteWriteoffRequest,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Write-off request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['writeoff-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete write-off request",
        variant: "destructive",
      });
    },
  });

  const getReasonLabel = (reason: string) => {
    return WRITEOFF_REASONS.find(r => r.value === reason)?.label || reason;
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this write-off request?')) {
      deleteMutation.mutate(id);
    }
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
            <FileX className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Write-off Requests</h1>
              <p className="text-muted-foreground">Manage inventory write-off requests</p>
            </div>
          </div>
          <Button onClick={() => navigate('/forms/writeoff/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Write-off Request
          </Button>
        </div>

        {/* Write-off Requests List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Write-off Requests</CardTitle>
                <CardDescription>
                  View and manage all write-off requests
                </CardDescription>
              </div>
              
              {/* Bulk expand/collapse controls */}
              {writeoffRequests && writeoffRequests.length > 0 && (
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
            {writeoffRequests && writeoffRequests.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search write-off requests..."
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
                <span className="ml-3">Loading write-off requests...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FileX className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-medium mb-2 text-destructive">Error loading requests</p>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the write-off requests. Please try again.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : !writeoffRequests || writeoffRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No write-off requests yet</p>
                <p className="text-muted-foreground mb-4">
                  Create your first write-off request to get started
                </p>
                <Button onClick={() => navigate('/forms/writeoff/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Write-off Request
                </Button>
              </div>
            ) : filteredMonthGroups.length === 0 ? (
              <div className="text-center py-8">
                <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No write-off requests found matching your search
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
                                      {request.writeoff_request_items?.length || 0}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  THB {Math.round(request.total_cost).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/forms/writeoff/view/${request.id}`)}
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

export default WriteoffRequestsList;