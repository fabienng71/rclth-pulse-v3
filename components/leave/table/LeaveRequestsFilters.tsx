import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DateRangePicker from '@/components/procurement/filters/DateRangePicker';
import { DateRange } from 'react-day-picker';

interface LeaveRequestsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  leaveTypeFilter: string;
  onLeaveTypeFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  showUserFilter: boolean;
  userFilter: string;
  onUserFilterChange: (value: string) => void;
  totalRequests: number;
  filteredRequests: number;
}

export const LeaveRequestsFilters: React.FC<LeaveRequestsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  leaveTypeFilter,
  onLeaveTypeFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  showUserFilter,
  userFilter,
  onUserFilterChange,
  totalRequests,
  filteredRequests,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Denied':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter && statusFilter !== 'all') count++;
    if (dateRange?.from || dateRange?.to) count++;
    if (leaveTypeFilter && leaveTypeFilter !== 'all') count++;
    if (departmentFilter && departmentFilter !== 'all') count++;
    if (userFilter && userFilter !== 'all') count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Primary Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, employee ID, or reason..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">
                <Badge className={getStatusColor('Pending')} variant="secondary">
                  Pending
                </Badge>
              </SelectItem>
              <SelectItem value="Approved">
                <Badge className={getStatusColor('Approved')} variant="secondary">
                  Approved
                </Badge>
              </SelectItem>
              <SelectItem value="Denied">
                <Badge className={getStatusColor('Denied')} variant="secondary">
                  Denied
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker
            from={dateRange?.from}
            to={dateRange?.to}
            onFromChange={(date) => onDateRangeChange({ from: date, to: dateRange?.to })}
            onToChange={(date) => onDateRangeChange({ from: dateRange?.from, to: date })}
            placeholder="Filter by date range"
            label="Date Range"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdvancedFilters}
            className="whitespace-nowrap"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Leave Type</label>
            <Select value={leaveTypeFilter} onValueChange={onLeaveTypeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Annual">Annual Leave</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Business Leave">Business Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Department</label>
            <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="HR">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showUserFilter && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">User</label>
              <Select value={userFilter} onValueChange={onUserFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredRequests} of {totalRequests} requests
        </div>
        {getActiveFiltersCount() > 0 && (
          <div className="flex items-center gap-2">
            <span>{getActiveFiltersCount()} filter(s) applied</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onStatusFilterChange('all');
                onDateRangeChange(undefined);
                onLeaveTypeFilterChange('all');
                onDepartmentFilterChange('all');
                onUserFilterChange('all');
              }}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};