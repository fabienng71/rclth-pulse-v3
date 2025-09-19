import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, TrendingUp, Package, Clock, Truck, Info } from 'lucide-react';
import type { ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from './form/forecastFormSchema';

interface ForecastSummaryProps {
  results: ForecastResult[];
  formData: ForecastFormData;
}

const ForecastSummary: React.FC<ForecastSummaryProps> = ({ results, formData }) => {
  // Enhanced debugging for incoming stock
  console.log(`[ForecastSummary] Processing ${results.length} forecast results`);
  results.forEach((result, index) => {
    console.log(`[ForecastSummary] Item ${index + 1} (${result.item_code}):`, {
      incoming_stock_total: result.incoming_stock_total,
      incoming_stock_total_type: typeof result.incoming_stock_total,
      incoming_stock_items_count: result.incoming_stock_items?.length || 0,
      incoming_stock_items: result.incoming_stock_items,
      stock_status: result.stock_status,
      has_incoming_check: Number(result.incoming_stock_total) > 0
    });
  });

  const criticalItems = results.filter(r => r.stock_status === 'critical').length;
  const lowStockItems = results.filter(r => r.stock_status === 'low').length;
  
  // Fixed calculation - ensure proper number conversion
  const totalIncomingStock = results.reduce((sum, r) => {
    const incomingTotal = Number(r.incoming_stock_total) || 0;
    return sum + incomingTotal;
  }, 0);
  
  const averageConfidence = results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length;
  
  // Fixed filtering - use Number() to ensure proper type conversion
  const itemsWithIncomingStock = results.filter(r => {
    const incomingTotal = Number(r.incoming_stock_total) || 0;
    const hasIncoming = incomingTotal > 0;
    
    if (r.item_code === 'IPS0WW0000547') {
      console.log(`[ForecastSummary] IPS0WW0000547 incoming check:`, {
        raw_incoming_stock_total: r.incoming_stock_total,
        converted_number: incomingTotal,
        hasIncoming
      });
    }
    
    return hasIncoming;
  }).length;
  
  // Enhanced calculation for items without incoming stock that are at risk
  const itemsWithoutIncomingStockAtRisk = results.filter(r => {
    const incomingTotal = Number(r.incoming_stock_total) || 0;
    const hasNoIncoming = incomingTotal === 0;
    const isAtRisk = r.stock_status === 'critical' || r.stock_status === 'low';
    return hasNoIncoming && isAtRisk;
  }).length;

  console.log(`[ForecastSummary] Summary calculations:`, {
    totalIncomingStock,
    itemsWithIncomingStock,
    itemsWithoutIncomingStockAtRisk,
    criticalItems,
    lowStockItems
  });

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'moving_average':
        return 'Uses the average of historical sales data to predict future demand. Best for stable demand patterns.';
      case 'trend_analysis':
        return 'Analyzes sales trends to project future demand based on growth or decline patterns.';
      case 'seasonal_adjustment':
        return 'Considers seasonal patterns and monthly variations in historical data.';
      default:
        return 'Standard forecasting method applied.';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Calculation Method Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Calculation Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Forecasting Method</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium capitalize">{formData.forecast_method.replace('_', ' ')}</span>
              </p>
              <p className="text-xs text-gray-500">{getMethodDescription(formData.forecast_method)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Analysis Parameters</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Time Period:</span>
                  <span className="font-medium">{formData.time_period_months} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence Threshold:</span>
                  <span className="font-medium">{Math.round(formData.confidence_threshold * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Lead Time:</span>
                  <span className="font-medium">{formData.lead_time_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Time:</span>
                  <span className="font-medium">{formData.shipping_time_days} days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Stock Analysis & Incoming Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-600">Items Analyzed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{itemsWithIncomingStock}</div>
              <div className="text-sm text-gray-600">Items with Incoming Stock</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{totalIncomingStock.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Incoming Quantity</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(averageConfidence * 100)}%</div>
              <div className="text-sm text-gray-600">Average Confidence</div>
            </div>
          </div>

          {/* Items with Incoming Stock Details */}
          {itemsWithIncomingStock > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700">Incoming Stock Details</h4>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Incoming Qty</TableHead>
                      <TableHead>Next Delivery</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Transport</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      .filter(r => {
                        const incomingTotal = Number(r.incoming_stock_total) || 0;
                        return incomingTotal > 0;
                      })
                      .map((result) => {
                        console.log(`[ForecastSummary] Rendering incoming stock row for ${result.item_code}:`, {
                          incoming_stock_items: result.incoming_stock_items,
                          incoming_stock_total: result.incoming_stock_total
                        });
                        
                        const nextDelivery = result.incoming_stock_items
                          ?.filter(item => item.eta && item.eta.trim() !== '')
                          .sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())[0];
                        
                        return (
                          <TableRow key={result.item_code}>
                            <TableCell className="font-mono text-sm">{result.item_code}</TableCell>
                            <TableCell className="font-medium">{Number(result.incoming_stock_total || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              {nextDelivery ? formatDate(nextDelivery.eta) : '-'}
                            </TableCell>
                            <TableCell>{nextDelivery?.vendor_name || '-'}</TableCell>
                            <TableCell>
                              {nextDelivery?.transport_mode && (
                                <Badge variant="outline" className="text-xs">
                                  {nextDelivery.transport_mode.toUpperCase()}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Debug information for troubleshooting */}
          {itemsWithIncomingStock === 0 && totalIncomingStock > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-sm text-yellow-800 mb-2">Debug Information</h4>
              <p className="text-xs text-yellow-700">
                Warning: Total incoming stock is {totalIncomingStock} but no items show incoming stock. 
                This may indicate a data inconsistency.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
              <div className="text-sm text-gray-600">Critical Stock Items</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <div className="text-sm text-gray-600">Low Stock Items</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{itemsWithoutIncomingStockAtRisk}</div>
              <div className="text-sm text-gray-600">At Risk Without Incoming Stock</div>
              <div className="text-xs text-gray-500 mt-1">Critical/Low stock items with no incoming shipments</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Key Risk Factors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Timing Dependencies</span>
                </div>
                <p className="text-gray-600 text-xs">
                  {itemsWithIncomingStock} items depend on incoming shipments. 
                  Monitor delivery schedules closely to avoid stockouts.
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Confidence Levels</span>
                </div>
                <p className="text-gray-600 text-xs">
                  Average confidence: {Math.round(averageConfidence * 100)}%. 
                  Lower confidence items require more frequent monitoring.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            Key Variables & Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">Procurement Timeline Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Total Lead Time:</span>
                    <span className="font-medium">{formData.lead_time_days + formData.shipping_time_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Safety Buffer:</span>
                    <span className="font-medium">7 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Critical Threshold:</span>
                    <span className="font-medium text-red-600">≤ {formData.lead_time_days + formData.shipping_time_days} days stock</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">Consumption & Trends</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Increasing Trends:</span>
                    <span className="font-medium text-green-600">
                      {results.filter(r => r.trend === 'increasing').length} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Decreasing Trends:</span>
                    <span className="font-medium text-red-600">
                      {results.filter(r => r.trend === 'decreasing').length} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stable Trends:</span>
                    <span className="font-medium text-gray-600">
                      {results.filter(r => r.trend === 'stable').length} items
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-blue-800 mb-2">Enhanced Forecast Impact</h4>
              <p className="text-xs text-blue-700">
                This forecast integrates incoming shipment data to provide more accurate stock projections. 
                Items with incoming stock show "Effective Days Until Stockout" which considers expected deliveries, 
                potentially extending safe stock periods and optimizing order timing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastSummary;
