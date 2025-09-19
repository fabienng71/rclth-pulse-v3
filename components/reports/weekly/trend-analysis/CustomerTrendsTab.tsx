import React from 'react';
import { CustomerInsight } from '@/hooks/useEnhancedWeeklyData';
import { CustomerSummaryCards } from './CustomerSummaryCards';
import { CustomerTrendsTable } from './CustomerTrendsTable';

interface CustomerTrendsTabProps {
  customerInsights: CustomerInsight[];
  growingCustomers: CustomerInsight[];
  atRiskCustomers: CustomerInsight[];
  newCustomers: CustomerInsight[];
  reactivatedCustomers: CustomerInsight[];
  formatCurrency: (amount: number) => string;
  formatPercentage: (percentage: number) => string;
}

export const CustomerTrendsTab: React.FC<CustomerTrendsTabProps> = ({
  customerInsights,
  growingCustomers,
  atRiskCustomers,
  newCustomers,
  reactivatedCustomers,
  formatCurrency,
  formatPercentage
}) => {
  return (
    <div className="space-y-6">
      <CustomerSummaryCards
        customerInsights={customerInsights}
        growingCustomers={growingCustomers}
        atRiskCustomers={atRiskCustomers}
        newCustomers={newCustomers}
        reactivatedCustomers={reactivatedCustomers}
      />

      <div className="space-y-4">
        <CustomerTrendsTable
          customers={growingCustomers}
          title="Growing Customers"
          emoji="🚀"
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        <CustomerTrendsTable
          customers={atRiskCustomers}
          title="At Risk Customers"
          emoji="⚠️"
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        <CustomerTrendsTable
          customers={newCustomers}
          title="New Customers"
          emoji="⭐"
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        {reactivatedCustomers.length > 0 && (
          <CustomerTrendsTable
            customers={reactivatedCustomers}
            title="Reactivated Customers"
            emoji="✨"
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        )}
      </div>
    </div>
  );
};