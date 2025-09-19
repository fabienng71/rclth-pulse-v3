import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SalespersonFilter } from '@/components/dashboard/SalespersonFilter';
import ChannelFilter from '@/components/reports/channel/ChannelFilter';
import { CustomerReportFilters } from '@/hooks/useCustomerReportEnhanced';

interface CustomerFiltersSectionProps {
  filters: CustomerReportFilters;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  customers: any[];
  isAdmin: boolean;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
  handleFilterChange: (key: keyof CustomerReportFilters, value: any) => void;
}

export const CustomerFiltersSection: React.FC<CustomerFiltersSectionProps> = ({
  filters,
  searchTerm,
  setSearchTerm,
  showAdvancedFilters,
  setShowAdvancedFilters,
  customers,
  isAdmin,
  error,
  isLoading,
  refetch,
  handleFilterChange
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle>Enhanced Customer Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="customer-search">Search Customers</Label>
              <Input
                id="customer-search"
                placeholder="Search by code, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <ChannelFilter 
            selectedChannel={filters.channelCode}
            onChannelChange={(channel) => handleFilterChange('channelCode', channel)}
          />

          {isAdmin && (
            <SalespersonFilter
              value={filters.salespersonCode || 'all'}
              onChange={(value) => handleFilterChange('salespersonCode', value)}
            />
          )}
        </div>
        
        {/* Advanced Filters Toggle */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </Button>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>RFM Segment</Label>
              <Select
                value={filters.rfmSegment || 'all'}
                onValueChange={(value) => handleFilterChange('rfmSegment', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All segments</SelectItem>
                  <SelectItem value="champions">Champions</SelectItem>
                  <SelectItem value="loyal_customers">Loyal Customers</SelectItem>
                  <SelectItem value="potential_loyalists">Potential Loyalists</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="hibernating">Hibernating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Growth Trend</Label>
              <Select
                value={filters.growthTrend || 'all'}
                onValueChange={(value) => handleFilterChange('growthTrend', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All trends" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All trends</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="declining">Declining</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Min Health Score</Label>
              <Select
                value={filters.healthScoreMin?.toString() || 'all'}
                onValueChange={(value) => handleFilterChange('healthScoreMin', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any score</SelectItem>
                  <SelectItem value="80">80+ (Champions)</SelectItem>
                  <SelectItem value="60">60+ (Loyal+)</SelectItem>
                  <SelectItem value="40">40+ (Potential+)</SelectItem>
                  <SelectItem value="20">20+ (At Risk+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="at-risk-filter"
                checked={filters.isAtRisk || false}
                onCheckedChange={(checked) => handleFilterChange('isAtRisk', checked || undefined)}
              />
              <Label htmlFor="at-risk-filter">At Risk Only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-customer-filter"
                checked={filters.isNewCustomer || false}
                onCheckedChange={(checked) => handleFilterChange('isNewCustomer', checked || undefined)}
              />
              <Label htmlFor="new-customer-filter">New Customers Only</Label>
            </div>
          </div>
        )}
        
        {/* Filter Summary */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {customers.length} customers shown
            </Badge>
            {filters.rfmSegment && (
              <Badge variant="secondary">
                Segment: {filters.rfmSegment}
              </Badge>
            )}
            {filters.growthTrend && (
              <Badge variant="secondary">
                Trend: {filters.growthTrend}
              </Badge>
            )}
            {filters.isAtRisk && (
              <Badge variant="destructive">
                At Risk Only
              </Badge>
            )}
            {filters.isNewCustomer && (
              <Badge variant="default">
                New Customers
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <div className="border rounded-lg p-6 bg-destructive/10 border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Error Loading Customer Data</h3>
            </div>
            <p className="text-sm text-destructive/80 mb-4">
              {error.message || 'An unexpected error occurred while loading customer analytics.'}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isLoading}
              >
                Retry
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/reports')}
              >
                Back to Reports
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};