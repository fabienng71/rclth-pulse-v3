import { useMemo } from 'react';
import { CreditMemoSummary, DeliveryFeeSummary } from '@/types/dashboard';

interface UseRevenueCalculationsProps {
  totalTurnover: number;
  creditMemoSummary: CreditMemoSummary | null;
  deliveryFeeSummary: DeliveryFeeSummary | null;
  includeDeliveryFees: boolean;
}

export const useRevenueCalculations = ({
  totalTurnover,
  creditMemoSummary,
  deliveryFeeSummary,
  includeDeliveryFees
}: UseRevenueCalculationsProps) => {
  
  // Centralized currency formatting
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Trend icon helper
  const getTrendIcon = (trend: 'up' | 'down' | 'stable', type: 'credit' | 'delivery' = 'credit') => {
    const colorClass = type === 'credit' ? 'text-red-500' : 'text-orange-500';
    const positiveClass = type === 'credit' ? 'text-green-500' : 'text-green-500';
    
    switch (trend) {
      case 'up':
        return `trending-up ${colorClass}`;
      case 'down':
        return `trending-down ${positiveClass}`;
      default:
        return 'stable text-gray-400';
    }
  };

  // Impact severity calculation
  const getImpactSeverity = (percentage: number) => {
    if (percentage >= 15) return 'high';
    if (percentage >= 8) return 'medium';
    return 'low';
  };

  // Impact color classes
  const getImpactColorClass = (percentage: number) => {
    const severity = getImpactSeverity(percentage);
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  // Revenue calculations
  const calculations = useMemo(() => {
    const creditMemoAmount = creditMemoSummary?.totalAmount || 0;
    const deliveryFeeAmount = deliveryFeeSummary?.totalAmount || 0;
    
    // Base calculations
    const grossRevenue = totalTurnover;
    const grossWithDelivery = includeDeliveryFees ? grossRevenue : grossRevenue + deliveryFeeAmount;
    
    // Net calculations
    const netAfterCredits = grossRevenue - creditMemoAmount;
    const netAfterDeliveryFees = includeDeliveryFees ? grossRevenue : grossRevenue - deliveryFeeAmount;
    const netAfterBoth = grossRevenue - creditMemoAmount - (includeDeliveryFees ? 0 : deliveryFeeAmount);
    
    // Impact percentages
    const creditMemoImpact = grossWithDelivery > 0 ? (creditMemoAmount / grossWithDelivery) * 100 : 0;
    const deliveryFeeImpact = grossWithDelivery > 0 ? (deliveryFeeAmount / grossWithDelivery) * 100 : 0;
    const totalAdjustmentImpact = creditMemoImpact + (includeDeliveryFees ? 0 : deliveryFeeImpact);
    
    return {
      // Base amounts
      grossRevenue,
      grossWithDelivery,
      creditMemoAmount,
      deliveryFeeAmount,
      
      // Net calculations
      netAfterCredits,
      netAfterDeliveryFees,
      netAfterBoth,
      
      // Impact percentages
      creditMemoImpact,
      deliveryFeeImpact,
      totalAdjustmentImpact,
      
      // Flags
      hasCreditMemos: creditMemoAmount > 0,
      hasDeliveryFees: deliveryFeeAmount > 0,
      hasSignificantCreditImpact: creditMemoImpact > 10,
      hasSignificantDeliveryImpact: deliveryFeeImpact > 10,
      hasSignificantTotalImpact: totalAdjustmentImpact > 15
    };
  }, [totalTurnover, creditMemoSummary, deliveryFeeSummary, includeDeliveryFees]);

  return {
    calculations,
    formatCurrency,
    getTrendIcon,
    getImpactSeverity,
    getImpactColorClass
  };
};