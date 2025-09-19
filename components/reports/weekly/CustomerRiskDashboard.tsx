import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { CustomerInsight, AtRiskCustomerInsight } from '@/hooks/useEnhancedWeeklyData';
import { useNavigate } from 'react-router-dom';

interface CustomerRiskDashboardProps {
  atRiskCustomers: (CustomerInsight | AtRiskCustomerInsight)[];
  decliningCustomers: CustomerInsight[];
  totalCustomers: number;
  isLoading?: boolean;
}

export const CustomerRiskDashboard: React.FC<CustomerRiskDashboardProps> = ({
  atRiskCustomers,
  decliningCustomers,
  totalCustomers,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const getRiskLevel = (customer: CustomerInsight | AtRiskCustomerInsight) => {
    // Check if it's an AtRiskCustomerInsight with additional fields
    const isAtRiskInsight = 'days_since_last_purchase' in customer;
    
    if (customer.is_at_risk && isAtRiskInsight) {
      const atRiskCustomer = customer as AtRiskCustomerInsight;
      if (atRiskCustomer.days_since_last_purchase > 60 && atRiskCustomer.value_tier === 'high_value') {
        return { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-200', priority: 1 };
      } else if (atRiskCustomer.days_since_last_purchase > 30 || atRiskCustomer.value_tier === 'high_value') {
        return { level: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200', priority: 2 };
      } else {
        return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', priority: 3 };
      }
    } else if (customer.tier_classification === 'declining' && customer.yoy_growth_percent < -20) {
      return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', priority: 3 };
    } else {
      return { level: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-200', priority: 4 };
    }
  };

  const calculateRiskMetrics = () => {
    const totalAtRisk = atRiskCustomers.length;
    const totalDeclining = decliningCustomers.length;
    const atRiskRevenue = atRiskCustomers.reduce((sum, c) => sum + c.weekly_turnover, 0);
    const decliningRevenue = decliningCustomers.reduce((sum, c) => sum + c.weekly_turnover, 0);
    
    return {
      totalAtRisk,
      totalDeclining,
      atRiskRevenue,
      decliningRevenue,
      riskPercentage: totalCustomers > 0 ? ((totalAtRisk / totalCustomers) * 100) : 0,
    };
  };

  const handleContactCustomer = (customer: CustomerInsight) => {
    // Navigate to CRM to create an activity
    navigate('/crm/activities/new', {
      state: {
        prefilledData: {
          customer_code: customer.customer_code,
          customer_name: customer.customer_name,
          activity_type: 'Phone Call',
          notes: `Follow-up with at-risk customer - ${customer.tier_classification} status, YoY growth: ${formatPercentage(customer.yoy_growth_percent)}`,
          pipeline_stage: 'Retention'
        }
      }
    });
  };

  const handleCreateRetentionCampaign = () => {
    // Future: Navigate to marketing campaign creation
    console.log('Create retention campaign for at-risk customers');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Customer Risk Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading risk analysis...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskMetrics = calculateRiskMetrics();
  // Show all at-risk customers in the main table, not limited to 10
  const atRiskCustomersWithRisk = atRiskCustomers.map(customer => ({ 
    ...customer, 
    risk: getRiskLevel(customer) 
  })).sort((a, b) => a.risk.priority - b.risk.priority);
  
  // Keep the overview cards using combined data for summary
  const criticalCustomers = [...atRiskCustomers, ...decliningCustomers]
    .map(customer => ({ ...customer, risk: getRiskLevel(customer) }))
    .sort((a, b) => a.risk.priority - b.risk.priority)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{riskMetrics.totalAtRisk}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{riskMetrics.totalDeclining}</p>
                <p className="text-xs text-muted-foreground">Declining</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xl font-bold text-red-600">{formatCurrency(riskMetrics.atRiskRevenue)}</p>
                <p className="text-xs text-muted-foreground">At Risk Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{riskMetrics.riskPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Risk Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {riskMetrics.totalAtRisk > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{riskMetrics.totalAtRisk} customers are at risk</strong> representing {formatCurrency(riskMetrics.atRiskRevenue)} in weekly revenue. 
            Immediate action recommended to prevent customer churn.
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={handleCreateRetentionCampaign}>
                Create Retention Campaign
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Customer Risk Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Customer Risk Analysis ({criticalCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No customers at risk identified this week.</p>
              <p className="text-xs mt-2">This is great news! Keep monitoring for changes.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Weekly Sales</TableHead>
                    <TableHead className="text-right">Last Purchase</TableHead>
                    <TableHead className="text-right">Recent Revenue</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskCustomersWithRisk.map((customer) => {
                  const isAtRiskInsight = 'days_since_last_purchase' in customer;
                  const atRiskCustomer = customer as AtRiskCustomerInsight;
                  
                  return (
                    <TableRow key={customer.customer_code} className={
                      customer.risk.priority === 1 ? 'bg-red-50' : 
                      customer.risk.priority === 2 ? 'bg-orange-50' : ''
                    }>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {isAtRiskInsight && atRiskCustomer.search_name 
                              ? atRiskCustomer.search_name 
                              : customer.customer_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {customer.customer_code}
                            {isAtRiskInsight && (
                              <span className="ml-2 text-orange-600">
                                ({atRiskCustomer.value_tier.replace('_', ' ')})
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={customer.risk.color}>
                          {customer.risk.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          customer.tier_classification === 'at_risk' ? 'bg-red-100 text-red-800' :
                          customer.tier_classification === 'declining' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {customer.tier_classification}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.weekly_turnover)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAtRiskInsight ? (
                          <div>
                            <div className="text-sm">{new Date(atRiskCustomer.last_purchase_date).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{atRiskCustomer.days_since_last_purchase} days ago</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Active</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAtRiskInsight ? (
                          <div className="text-sm font-medium">
                            {formatCurrency(atRiskCustomer.recent_12w_revenue)}
                            <div className="text-xs text-muted-foreground">12w revenue</div>
                          </div>
                        ) : (
                          <span className={customer.yoy_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatPercentage(customer.yoy_growth_percent)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleContactCustomer(customer)}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Recommendations */}
      {criticalCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Retention Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskMetrics.totalAtRisk > 0 && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Immediate Actions Required</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Contact {riskMetrics.totalAtRisk} at-risk customers within 24 hours</li>
                    <li>• Review account status and recent purchase history</li>
                    <li>• Offer personalized promotions or service recovery</li>
                    <li>• Schedule follow-up activities in CRM</li>
                  </ul>
                </div>
              )}
              
              {riskMetrics.totalDeclining > 0 && (
                <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-semibold text-orange-800 mb-2">Proactive Engagement</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Analyze declining customers' purchase patterns</li>
                    <li>• Identify cross-selling opportunities</li>
                    <li>• Consider loyalty programs or volume discounts</li>
                    <li>• Monitor competitive threats</li>
                  </ul>
                </div>
              )}
              
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-2">Long-term Strategy</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Implement customer health scoring system</li>
                  <li>• Set up automated risk alerts</li>
                  <li>• Develop customer success programs</li>
                  <li>• Regular business reviews with key accounts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};