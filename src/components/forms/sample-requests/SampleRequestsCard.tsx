import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useSampleRequests } from './useSampleRequests';
import MonthHeader from '../MonthHeader';
import SampleRequestsTable from '../sample/SampleRequestsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Expand, Minimize, Plus } from 'lucide-react';

const SampleRequestsCard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();

  const {
    // Data
    requests,
    loading,
    searchQuery,
    filteredMonthGroups,

    // Handlers
    setSearchQuery,
    handleMonthToggle,
    handleExpandAllMonths,
    handleCollapseAllMonths,
    handleDeleteClick,

    // Utilities
    getStatusBadgeClass,
    getPriorityBadgeClass,
    formatDate,
  } = useSampleRequests({ user, isAdmin });

  // Debug logging
  console.log('SampleRequestsCard Debug:', {
    user,
    isAdmin,
    loading,
    requestsCount: requests.length,
    filteredMonthGroupsCount: filteredMonthGroups.length,
    searchQuery,
    requests: requests.slice(0, 3), // Log first 3 requests
    filteredMonthGroups: filteredMonthGroups.slice(0, 2) // Log first 2 month groups
  });

  // Navigation handlers
  const handleView = (id: string) => {
    navigate(`/forms/sample/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/forms/sample/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/forms/sample/create');
  };

  // Format item descriptions for table display
  const formatItemDescriptions = (items?: any[]) => {
    if (!items || items.length === 0) return 'No items';
    const itemCount = items.length;
    const descriptions = items.map(item => item.item_code || item.description).join(', ');
    return `${descriptions} (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading sample requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Sample Requests ({requests.length})
              </h2>
              {filteredMonthGroups.length !== requests.length && (
                <span className="text-sm text-muted-foreground">
                  ({filteredMonthGroups.reduce((acc, group) => acc + group.requests.length, 0)} filtered)
                </span>
              )}
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Sample Request
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sample requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAllMonths}
                className="flex items-center gap-2"
              >
                <Expand className="h-4 w-4" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAllMonths}
                className="flex items-center gap-2"
              >
                <Minimize className="h-4 w-4" />
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>

        <CardContent>
          {filteredMonthGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'No sample requests found matching your search.' 
                  : 'No sample requests found.'
                }
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Debug Info:</p>
                <p>Total Requests: {requests.length}</p>
                <p>Month Groups: {filteredMonthGroups.length}</p>
                <p>User ID: {(user as any)?.id || 'Not logged in'}</p>
                <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
                <p>Search Query: "{searchQuery}"</p>
              </div>
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
                    <SampleRequestsTable
                      requests={monthGroup.requests}
                      formatDate={formatDate}
                      formatItemDescriptions={formatItemDescriptions}
                      onViewRequest={handleView}
                      onEditRequest={handleEdit}
                      onDeleteClick={handleDeleteClick}
                      creatorFilter="all"
                      sortField="created_at"
                      sortDirection="desc"
                      onSort={() => {}} // Simple implementation, no sorting needed
                      showHeader={false}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SampleRequestsCard;