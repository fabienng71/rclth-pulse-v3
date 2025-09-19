import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { FollowupsHeader } from '@/components/crm/followups/FollowupsHeader';
import { FollowupsFilters } from '@/components/crm/followups/FollowupsFilters';
import { FollowupCard } from '@/components/crm/followups/FollowupCard';
import { FollowupsTable } from '@/components/crm/followups/FollowupsTable';
import { FollowupDetailModal } from '@/components/crm/followups/FollowupDetailModal';
import { useFollowupsData } from '@/hooks/useFollowupsData';
import { Activity } from '@/hooks/useActivitiesData';

interface Followup {
  id: string;
  customer_name: string;
  follow_up_date: string;
  notes: string;
  pipeline_stage: string;
  priority: string;
  salesperson_name: string;
}

const FollowupsList = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentView, setCurrentView] = useState<'table' | 'grid' | 'calendar'>('grid');
  const [filterType, setFilterType] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Convert selectedWeek to date range (mirroring ActivityList pattern)
  useEffect(() => {
    if (selectedWeek !== null) {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Calculate the start of the selected week
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
      const firstMonday = new Date(currentYear, 0, 1 + daysToFirstMonday);
      
      // Calculate the start and end of the selected week
      const weekStart = new Date(firstMonday.getTime() + (selectedWeek - 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      setFromDate(weekStart);
      setToDate(weekEnd);
      
      console.log(`Week ${selectedWeek} selected:`, {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0]
      });
    }
  }, [selectedWeek]);

  const { followups, salespersonOptions, statusOptions, isLoading, error, stats } = useFollowupsData({
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    priorityFilter: priorityFilter === 'all' ? undefined : priorityFilter,
    salespersonFilter: salespersonFilter === 'all' ? undefined : salespersonFilter,
    searchTerm,
    fromDate,
    toDate,
  });

  // Transform followups to match Activity interface for FollowupsHeader
  const activitiesForHeader: Activity[] = followups.map(followup => ({
    id: followup.id,
    activity_date: followup.follow_up_date,
    activity_type: 'follow-up',
    customer_name: followup.customer_name,
    customer_code: null,
    contact_name: null,
    salesperson_name: followup.salesperson_name,
    salesperson_id: null,
    notes: followup.notes,
    follow_up_date: followup.follow_up_date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    search_name: null,
    sample_items_description: null,
    is_lead: false,
    lead_id: null,
    lead_name: null,
    sample_request_id: null,
    project_id: null,
    pipeline_stage: followup.pipeline_stage,
    is_done: followup.is_done,
    completed_at: followup.completed_at,
  }));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSalespersonFilter('all');
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedWeek(null);
  };

  const handleViewDetails = (followup: Followup) => {
    setSelectedFollowup(followup);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFollowup(null);
  };

  const handleEdit = (followup: Followup) => {
    // TODO: Implement edit functionality
    console.log('Edit followup:', followup);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="text-2xl mb-2">⏰</div>
            <p className="text-lg text-muted-foreground">Loading follow-ups...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-destructive">Failed to load follow-ups: {error.message}</p>
        </div>
      );
    }

    if (followups.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No follow-ups found</h3>
          <p className="text-muted-foreground">
            {searchTerm || priorityFilter !== 'all' || salespersonFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate
              ? 'No follow-ups match your current filters.'
              : 'No follow-ups scheduled at this time.'}
          </p>
        </div>
      );
    }

    switch (currentView) {
      case 'grid':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {followups.map((followup) => (
              <FollowupCard 
                key={followup.id}
                activity={{
                  id: followup.id,
                  customer_name: followup.customer_name,
                  follow_up_date: followup.follow_up_date,
                  notes: followup.notes,
                  salesperson_name: followup.salesperson_name,
                  pipeline_stage: followup.pipeline_stage,
                  activity_date: followup.follow_up_date,
                  activity_type: 'follow-up',
                  customer_code: null,
                  contact_name: null,
                  salesperson_id: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  search_name: null,
                  sample_items_description: null,
                  is_lead: false,
                  lead_id: null,
                  lead_name: null,
                  sample_request_id: null,
                  project_id: null,
                  is_done: followup.is_done,
                  completed_at: followup.completed_at,
                }}
                onClick={() => handleViewDetails(followup)}
                onDelete={() => {}}
              />
            ))}
          </div>
        );
      case 'table':
        return (
          <FollowupsTable
            followups={followups}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        );
      case 'calendar':
        return (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Calendar view coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navigation />
      <main className="container py-6 space-y-6">
        <FollowupsHeader 
          activities={activitiesForHeader}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <FollowupsFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filterType={filterType}
          onTypeChange={setFilterType}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          onClearFilters={handleClearFilters}
          selectedSalesperson={salespersonFilter}
          onSalespersonChange={setSalespersonFilter}
          salespersonOptions={salespersonOptions}
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />

        {renderContent()}

        <FollowupDetailModal
          followup={selectedFollowup}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={handleEdit}
        />
      </main>
    </>
  );
};

export default FollowupsList;
