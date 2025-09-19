import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GridView } from './GridView';
import { MonthGroup } from '@/utils/monthGrouping';
import { SampleRequest } from '@/services/sample-requests';
import MonthHeader from '../../MonthHeader';
import SampleRequestsTable, { SampleRequestsSortField } from '../SampleRequestsTable';
import { SortDirection } from '@/hooks/useSortableTable';

interface MonthGroupViewProps {
  filteredMonthGroups: MonthGroup[];
  viewMode: 'table' | 'grid' | 'compact';
  handleMonthToggle: (monthKey: string) => void;
  formatDate: (date: string) => string;
  formatItemDescriptions: (items: any[]) => string;
  handleViewRequest: (id: string) => void;
  handleEditRequest: (id: string) => void;
  handleDeleteClick: (request: SampleRequest) => void;
  // Sorting props for table view
  creatorFilter: string;
  sortField: SampleRequestsSortField;
  sortDirection: SortDirection;
  onSort: (field: SampleRequestsSortField) => void;
}

export const MonthGroupView: React.FC<MonthGroupViewProps> = ({
  filteredMonthGroups,
  viewMode,
  handleMonthToggle,
  formatDate,
  formatItemDescriptions,
  handleViewRequest,
  handleEditRequest,
  handleDeleteClick,
  creatorFilter,
  sortField,
  sortDirection,
  onSort
}) => {
  if (filteredMonthGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No sample requests found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredMonthGroups.map((group) => (
        <div key={group.monthKey} className="border rounded-lg overflow-hidden">
          <MonthHeader
            monthGroup={group}
            onToggleExpansion={handleMonthToggle}
          />
          
          {group.isExpanded && (
            <>
              {viewMode === 'table' ? (
                <SampleRequestsTable
                  requests={group.requests}
                  formatDate={formatDate}
                  formatItemDescriptions={formatItemDescriptions}
                  onViewRequest={handleViewRequest}
                  onEditRequest={handleEditRequest}
                  onDeleteClick={handleDeleteClick}
                  creatorFilter={creatorFilter}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  showHeader={false}
                />
              ) : (
                <div className="p-4">
                  <GridView
                    requests={group.requests}
                    formatDate={formatDate}
                    formatItemDescriptions={formatItemDescriptions}
                    handleViewRequest={handleViewRequest}
                    handleEditRequest={handleEditRequest}
                    handleDeleteClick={handleDeleteClick}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};