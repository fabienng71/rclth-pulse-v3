import React, { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { RegionFilters } from '@/components/reports/region/RegionFilters';
import { RegionTable } from '@/components/reports/region/RegionTable';
import { RegionSummaryCards } from '@/components/reports/region/RegionSummaryCards';
import { RegionExportButton } from '@/components/reports/region/RegionExportButton';
import { useRegionTurnoverData } from '@/hooks/useRegionTurnoverData';
import { useAuthStore } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const RegionReport = () => {
  const { user, isAdmin, profile } = useAuthStore();
  
  // Get current date and 6 months ago as default date range
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const [fromDate, setFromDate] = useState(sixMonthsAgo);
  const [toDate, setToDate] = useState(today);
  // Initialize salesperson code based on current auth state
  const [salespersonCode, setSalespersonCode] = useState(() => {
    // If user is not admin and has spp_code, use it; otherwise default to 'all'
    return !isAdmin && profile?.spp_code ? profile.spp_code : 'all';
  });
  const [shouldFetch, setShouldFetch] = useState(false);
  
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
  }, [isAdmin, profile?.spp_code]);
  
  // Memoize query parameters
  const queryParams = useMemo(() => {
    if (!shouldFetch || !fromDate || !toDate) {
      return {
        fromDate: undefined,
        toDate: undefined,
        salespersonCode: undefined
      };
    }
    
    const effectiveSalespersonCode = isAdmin ? salespersonCode : (profile?.spp_code || null);
    
    return {
      fromDate,
      toDate,
      salespersonCode: effectiveSalespersonCode
    };
  }, [shouldFetch, fromDate, toDate, salespersonCode, isAdmin, profile?.spp_code]);
  
  const { data, isLoading: loading, error } = useRegionTurnoverData(
    queryParams.fromDate,
    queryParams.toDate,
    queryParams.salespersonCode
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
          <h1 className="text-2xl font-bold md:text-3xl">Region Report</h1>
          <RegionExportButton 
            data={data || null} 
            disabled={loading}
            className="ml-4"
          />
        </div>
        
        <div className="space-y-6">
          <RegionFilters
            fromDate={fromDate}
            toDate={toDate}
            salespersonCode={salespersonCode}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onSalespersonChange={setSalespersonCode}
            onViewReport={handleViewReport}
            loading={loading}
            isAdmin={isAdmin}
            userProfile={profile}
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {data && (
            <>
              <RegionSummaryCards data={data} />
              <RegionTable data={data} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegionReport;