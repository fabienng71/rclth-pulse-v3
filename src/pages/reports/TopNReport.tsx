
import React, { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { TopNFilters } from '@/components/reports/top-n/TopNFilters';
import { TopNTable } from '@/components/reports/top-n/TopNTable';
import { VirtualizedTopNTable } from '@/components/reports/top-n/VirtualizedTopNTable';
import { TopNSummaryCards } from '@/components/reports/top-n/TopNSummaryCards';
import { TopNExportButton } from '@/components/reports/top-n/TopNExportButton';
import { TopNTableToggle } from '@/components/reports/top-n/TopNTableToggle';
import { TopNDataInfo } from '@/components/reports/top-n/TopNDataInfo';
import { useTopNCustomersData } from '@/hooks/useTopNCustomersData';
import { useAuthStore } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { formatDateForAPI } from '@/utils/formatters';

// Debug utility - only logs in development
const debugLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

const TopNReport = () => {
  const { user, isAdmin, profile } = useAuthStore();
  
  // Get current date and 6 months ago as default date range
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const [fromDate, setFromDate] = useState(sixMonthsAgo);
  const [toDate, setToDate] = useState(today);
  const [topN, setTopN] = useState(50);
  // Initialize salesperson code based on current auth state
  const [salespersonCode, setSalespersonCode] = useState(() => {
    // If user is not admin and has spp_code, use it; otherwise default to 'all'
    return !isAdmin && profile?.spp_code ? profile.spp_code : 'all';
  });
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'virtualized'>('standard');
  
  // Sync salesperson code only when auth state changes (not when user manually selects)
  useEffect(() => {
    if (!isAdmin && profile?.spp_code) {
      // Non-admin users should be restricted to their spp_code
      setSalespersonCode(profile.spp_code);
    } else if (!isAdmin && !profile?.spp_code) {
      // Non-admin users without spp_code get 'all' 
      setSalespersonCode('all');
    }
    // Admin users keep their manual selection - no auto-reset
  }, [isAdmin, profile?.spp_code]); // Removed salespersonCode from dependencies
  
  // Memoize query parameters
  const queryParams = useMemo(() => {
    if (!shouldFetch || !fromDate || !toDate) {
      return {
        fromDate: undefined,
        toDate: undefined,
        topN: undefined,
        salespersonCode: undefined,
        channelCode: undefined
      };
    }
    
    const fromDateString = formatDateForAPI(fromDate);
    const toDateString = formatDateForAPI(toDate);
    const effectiveSalespersonCode = isAdmin ? salespersonCode : (profile?.spp_code || null);
    
    debugLog('=== Top N Report Parameters ===');
    debugLog('Date objects:', {
      fromDate: fromDate.toDateString(),
      toDate: toDate.toDateString()
    });
    debugLog('Formatted date strings:', {
      fromDateString,
      toDateString
    });
    debugLog('Other filters:', {
      topN,
      salespersonCode,
      effectiveSalespersonCode,
      selectedChannel,
      isAdmin,
      userSppCode: profile?.spp_code
    });
    
    return {
      fromDate: fromDateString,
      toDate: toDateString,
      topN,
      salespersonCode: effectiveSalespersonCode,
      channelCode: selectedChannel
    };
  }, [shouldFetch, fromDate, toDate, topN, salespersonCode, selectedChannel, isAdmin, profile?.spp_code]);
  
  const { data, loading, error } = useTopNCustomersData(
    queryParams.fromDate,
    queryParams.toDate,
    queryParams.topN,
    queryParams.salespersonCode,
    queryParams.channelCode
  );
  
  const handleViewReport = () => {
    if (!fromDate || !toDate) {
      return;
    }
    setShouldFetch(true);
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Top N Customer Report</h1>
          <TopNExportButton 
            data={data} 
            disabled={loading}
            className="ml-4"
          />
        </div>
        
        <div className="space-y-6">
          <TopNFilters
            fromDate={fromDate}
            toDate={toDate}
            topN={topN}
            salespersonCode={salespersonCode}
            selectedChannel={selectedChannel}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTopNChange={setTopN}
            onSalespersonChange={setSalespersonCode}
            onChannelChange={setSelectedChannel}
            onViewReport={handleViewReport}
            loading={loading}
            isAdmin={isAdmin}
            userProfile={profile}
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {data && (
            <>
              <TopNSummaryCards data={data} topN={topN} />
              
              <TopNDataInfo data={data} topN={topN} />
              
              <div className="flex items-center justify-between mb-4">
                <TopNTableToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  recordCount={data.customers.length}
                />
              </div>
              
              {viewMode === 'virtualized' ? (
                <VirtualizedTopNTable data={data} height={600} />
              ) : (
                <TopNTable data={data} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TopNReport;
