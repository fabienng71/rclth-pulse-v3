/**
 * Utility functions for grouping return requests by month
 */

export interface MonthGroup<T = Record<string, unknown>> {
  monthKey: string;        // "2024-01"
  displayName: string;     // "January 2024"
  requests: T[];
  isExpanded: boolean;
  summary: {
    totalRequests: number;
    statusBreakdown: Record<string, number>;
    priorityBreakdown: Record<string, number>;
  };
}

/**
 * Gets the month key from a date string (YYYY-MM format)
 */
export const getMonthKey = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Gets display name for a month key
 */
export const getMonthDisplayName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Calculates summary statistics for a group of requests
 */
export const calculateGroupSummary = <T extends { status: string; priority?: string }>(
  requests: T[]
) => {
  const statusBreakdown: Record<string, number> = {};
  const priorityBreakdown: Record<string, number> = {};

  requests.forEach(request => {
    // Status breakdown
    statusBreakdown[request.status] = (statusBreakdown[request.status] || 0) + 1;
    
    // Priority breakdown
    if (request.priority) {
      priorityBreakdown[request.priority] = (priorityBreakdown[request.priority] || 0) + 1;
    }
  });

  return {
    totalRequests: requests.length,
    statusBreakdown,
    priorityBreakdown
  };
};

/**
 * Groups requests by month based on created_at date
 */
export const groupRequestsByMonth = <T extends { created_at: string; status: string; priority?: string }>(
  requests: T[],
  defaultExpandedMonths: string[] = []
): MonthGroup<T>[] => {
  // Group requests by month
  const monthGroups: Record<string, T[]> = {};
  
  requests.forEach(request => {
    const monthKey = getMonthKey(request.created_at);
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }
    monthGroups[monthKey].push(request);
  });

  // Convert to MonthGroup array and sort
  const currentMonthKey = getMonthKey(new Date().toISOString());
  
  return Object.entries(monthGroups)
    .map(([monthKey, requests]) => ({
      monthKey,
      displayName: getMonthDisplayName(monthKey),
      requests: requests.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      isExpanded: monthKey === currentMonthKey || defaultExpandedMonths.includes(monthKey),
      summary: calculateGroupSummary(requests)
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey)); // Sort by month descending
};

/**
 * Filters month groups based on search query
 */
export const filterMonthGroups = <T extends { customer_code: string; customers?: { customer_name?: string; search_name?: string } | null }>(
  monthGroups: MonthGroup<T>[],
  searchQuery: string
): MonthGroup<T>[] => {
  if (!searchQuery.trim()) {
    return monthGroups;
  }

  const lowercaseQuery = searchQuery.toLowerCase();
  
  return monthGroups
    .map(group => {
      const filteredRequests = group.requests.filter(request => {
        const customerName = request.customers?.customer_name?.toLowerCase() || '';
        const searchName = request.customers?.search_name?.toLowerCase() || '';
        const customerCode = request.customer_code.toLowerCase();
        
        return customerName.includes(lowercaseQuery) ||
               searchName.includes(lowercaseQuery) ||
               customerCode.includes(lowercaseQuery);
      });

      return {
        ...group,
        requests: filteredRequests,
        summary: calculateGroupSummary(filteredRequests),
        // Auto-expand groups with search results
        isExpanded: filteredRequests.length > 0 ? true : group.isExpanded
      };
    })
    .filter(group => group.requests.length > 0); // Only include groups with results
};

/**
 * Toggles month expansion state
 */
export const toggleMonthExpansion = (
  monthGroups: MonthGroup[],
  monthKey: string
): MonthGroup[] => {
  return monthGroups.map(group =>
    group.monthKey === monthKey
      ? { ...group, isExpanded: !group.isExpanded }
      : group
  );
};

/**
 * Expands or collapses all months
 */
export const setAllMonthsExpanded = (
  monthGroups: MonthGroup[],
  expanded: boolean
): MonthGroup[] => {
  return monthGroups.map(group => ({
    ...group,
    isExpanded: expanded
  }));
};

/**
 * Gets formatted summary text for a month group
 */
export const getMonthSummaryText = (summary: MonthGroup['summary']): string => {
  const { statusBreakdown, totalRequests } = summary;
  
  if (totalRequests === 0) return '';
  
  const parts: string[] = [];
  
  Object.entries(statusBreakdown)
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .forEach(([status, count]) => {
      if (count > 0) {
        parts.push(`${count} ${status.charAt(0).toUpperCase() + status.slice(1)}`);
      }
    });
  
  return parts.join(', ');
};