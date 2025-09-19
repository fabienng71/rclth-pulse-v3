
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from '../form/forecastFormSchema';

interface ForecastSummaryCardProps {
  results: ForecastResult[];
  formData: ForecastFormData;
}

const ForecastSummaryCard: React.FC<ForecastSummaryCardProps> = ({ results, formData }) => {
  // Add debugging for incoming stock calculations
  console.log(`[ForecastSummaryCard] Processing ${results.length} results for summary`);
  
  const totalPredicted = results.reduce((sum, result) => sum + result.predicted_quantity, 0);
  const averageConfidence = results.reduce((sum, result) => sum + result.confidence_score, 0) / results.length;
  const criticalStockItems = results.filter(r => r.stock_status === 'critical').length;
  const lowStockItems = results.filter(r => r.stock_status === 'low').length;
  const totalIncomingStock = results.reduce((sum, result) => sum + (result.incoming_stock_total || 0), 0);

  // Enhanced debugging for each item
  results.forEach((result) => {
    if (result.item_code === 'IPS0WW0000547' || result.incoming_stock_total > 0) {
      console.log(`[ForecastSummaryCard] Item ${result.item_code}:`, {
        incoming_stock_total: result.incoming_stock_total,
        incoming_stock_items_count: result.incoming_stock_items?.length || 0,
        stock_status: result.stock_status,
        has_incoming_stock: (result.incoming_stock_total || 0) > 0
      });
    }
  });

  console.log(`[ForecastSummaryCard] Summary totals:`, {
    totalIncomingStock,
    criticalStockItems,
    lowStockItems
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Enhanced Forecast Preview: {formData.title}</span>
          <div className="flex items-center gap-2">
            {averageConfidence >= 0.7 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="text-sm font-normal">
              Avg. Confidence: {Math.round(averageConfidence * 100)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-sm text-gray-600">Items Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalPredicted.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Order Qty</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formData.time_period_months}</div>
            <div className="text-sm text-gray-600">Months Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formData.lead_time_days}</div>
            <div className="text-sm text-gray-600">Lead Time (Days)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{formData.shipping_time_days}</div>
            <div className="text-sm text-gray-600">Shipping Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{formData.target_stock_days}</div>
            <div className="text-sm text-gray-600">Target Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{totalIncomingStock.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Incoming Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalStockItems}</div>
            <div className="text-sm text-gray-600">Critical Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastSummaryCard;
