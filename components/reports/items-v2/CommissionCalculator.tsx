import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Target, 
  TrendingUp,
  Percent,
  Calendar,
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ItemAnalytics } from '@/types/itemsV2';
import { cn } from '@/lib/utils';

interface CommissionCalculatorProps {
  items: ItemAnalytics[];
  currentCommission?: number;
  monthlyTarget?: number;
  className?: string;
}

interface CommissionBreakdown {
  baseCommission: number;
  bonusCommission: number;
  totalCommission: number;
  targetProgress: number;
  projectedMonthly: number;
}

interface ScenarioCalculation {
  salesIncrease: number;
  marginImprovement: number;
  newCommission: number;
  additionalEarnings: number;
  impactDescription: string;
}

export const CommissionCalculator: React.FC<CommissionCalculatorProps> = ({
  items,
  currentCommission = 0,
  monthlyTarget = 10000,
  className
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customSalesAmount, setCustomSalesAmount] = useState<number>(1000);
  const [commissionRate, setCommissionRate] = useState<number[]>([5]);
  const [bonusThreshold, setBonusThreshold] = useState<number>(monthlyTarget);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  // Calculate current commission breakdown
  const calculateCommissionBreakdown = (): CommissionBreakdown => {
    const totalSales = items.reduce((sum, item) => sum + item.sales_metrics.total_sales_amount, 0);
    const baseRate = commissionRate[0] / 100;
    const baseCommission = totalSales * baseRate;
    
    // Bonus calculation (example: 2% extra if above threshold)
    const bonusRate = totalSales > bonusThreshold ? 0.02 : 0;
    const bonusCommission = totalSales * bonusRate;
    
    const totalCommission = baseCommission + bonusCommission;
    const targetProgress = Math.min(100, (totalSales / monthlyTarget) * 100);
    
    // Project monthly based on timeframe
    const multiplier = timeframe === 'weekly' ? 4.33 : timeframe === 'quarterly' ? 1/3 : 1;
    const projectedMonthly = totalCommission * multiplier;

    return {
      baseCommission,
      bonusCommission,
      totalCommission,
      targetProgress,
      projectedMonthly
    };
  };

  // Calculate scenario impact
  const calculateScenario = (salesIncrease: number, marginImprovement: number): ScenarioCalculation => {
    const currentSales = items.reduce((sum, item) => sum + item.sales_metrics.total_sales_amount, 0);
    const newSales = currentSales * (1 + salesIncrease / 100);
    const newCommission = newSales * (commissionRate[0] / 100) * (1 + marginImprovement / 100);
    const additionalEarnings = newCommission - calculateCommissionBreakdown().totalCommission;

    let impactDescription = '';
    if (additionalEarnings > 1000) {
      impactDescription = 'High impact - significant earnings increase';
    } else if (additionalEarnings > 500) {
      impactDescription = 'Medium impact - good earnings boost';
    } else if (additionalEarnings > 0) {
      impactDescription = 'Low impact - modest earnings increase';
    } else {
      impactDescription = 'No impact - maintain current performance';
    }

    return {
      salesIncrease,
      marginImprovement,
      newCommission,
      additionalEarnings,
      impactDescription
    };
  };

  const breakdown = calculateCommissionBreakdown();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTargetStatus = (progress: number) => {
    if (progress >= 100) return { color: 'green', status: 'Target Achieved!' };
    if (progress >= 80) return { color: 'orange', status: 'Close to Target' };
    if (progress >= 50) return { color: 'blue', status: 'On Track' };
    return { color: 'red', status: 'Behind Target' };
  };

  const targetStatus = getTargetStatus(breakdown.targetProgress);

  // Predefined scenarios
  const scenarios = [
    calculateScenario(10, 5), // 10% more sales, 5% better margins
    calculateScenario(25, 10), // 25% more sales, 10% better margins
    calculateScenario(50, 15), // 50% more sales, 15% better margins
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Commission Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          {/* Current Commission Tab */}
          <TabsContent value="current" className="space-y-4">
            {/* Commission Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base Commission</span>
                  <span className="font-semibold">{formatCurrency(breakdown.baseCommission)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bonus Commission</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(breakdown.bonusCommission)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Commission</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(breakdown.totalCommission)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(breakdown.projectedMonthly)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Projected Monthly
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Target Progress</span>
                    <Badge className={cn(
                      targetStatus.color === 'green' && 'bg-green-100 text-green-800',
                      targetStatus.color === 'orange' && 'bg-orange-100 text-orange-800',
                      targetStatus.color === 'blue' && 'bg-blue-100 text-blue-800',
                      targetStatus.color === 'red' && 'bg-red-100 text-red-800'
                    )}>
                      {targetStatus.status}
                    </Badge>
                  </div>
                  <Progress value={breakdown.targetProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{breakdown.targetProgress.toFixed(1)}%</span>
                    <span>Target: {formatCurrency(monthlyTarget)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Rate Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Commission Rate: {commissionRate[0]}%</Label>
              <Slider
                value={commissionRate}
                onValueChange={setCommissionRate}
                max={15}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Top Contributing Items */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Top Contributors
              </Label>
              <div className="space-y-2">
                {items
                  .sort((a, b) => b.commission_impact - a.commission_impact)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={item.item_code} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{item.item_code}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(item.commission_impact)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.sales_metrics.margin_percent.toFixed(1)}% margin
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* Custom Calculator Tab */}
          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="sales-amount">Sales Amount</Label>
                <Input
                  id="sales-amount"
                  type="number"
                  value={customSalesAmount}
                  onChange={(e) => setCustomSalesAmount(Number(e.target.value))}
                  placeholder="Enter sales amount"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Calculation Result</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-blue-600">Commission</div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency(customSalesAmount * (commissionRate[0] / 100))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-blue-600">Rate</div>
                  <div className="text-lg font-bold text-blue-900">
                    {commissionRate[0]}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4">
              {scenarios.map((scenario, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Scenario {index + 1}</Badge>
                      <span className="text-sm font-medium">
                        +{scenario.salesIncrease}% Sales, +{scenario.marginImprovement}% Margin
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        +{formatCurrency(scenario.additionalEarnings)}
                      </div>
                      <div className="text-xs text-muted-foreground">Additional</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">{scenario.impactDescription}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>{formatCurrency(scenario.newCommission)}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">Optimization Tips</span>
              </div>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Focus on high-margin items for better commission rates</li>
                <li>• Bundle complementary products to increase average order value</li>
                <li>• Identify and push quick-win items with high velocity</li>
                <li>• Monitor stock levels to avoid missed opportunities</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommissionCalculator;