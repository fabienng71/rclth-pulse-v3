import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  RefreshCw,
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';
import { DataValidation } from '@/hooks/useSalesAnalytics';

interface DataValidationPanelProps {
  data: DataValidation[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const DataValidationPanel: React.FC<DataValidationPanelProps> = ({
  data,
  isLoading,
  onRefresh,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'WARN':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return <Badge variant="default" className="bg-soft-primary text-primary border-primary/20">Pass</Badge>;
      case 'WARN':
        return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Warning</Badge>;
      case 'FAIL':
        return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">Fail</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Low</Badge>;
      case 'INFO':
        return <Badge variant="outline" className="bg-background-tertiary text-muted-foreground border-border/30">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Customer Analytics':
        return <Database className="h-4 w-4" />;
      case 'Product Analytics':
        return <Activity className="h-4 w-4" />;
      case 'Data Quality':
        return <Info className="h-4 w-4" />;
      case 'Performance':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Summary statistics
  const passCount = data.filter(d => d.status === 'PASS').length;
  const warnCount = data.filter(d => d.status === 'WARN').length;
  const failCount = data.filter(d => d.status === 'FAIL').length;
  const highSeverityCount = data.filter(d => d.severity === 'HIGH').length;

  if (isLoading) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Quality Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Validating data quality...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-background-container shadow-soft transition-smooth">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Passed</span>
            </div>
            <p className="text-2xl font-bold text-primary">{passCount}</p>
            <p className="text-sm text-muted-foreground">Validations passed</p>
          </CardContent>
        </Card>

        <Card className="bg-background-container shadow-soft transition-smooth">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Warnings</span>
            </div>
            <p className="text-2xl font-bold text-warning">{warnCount}</p>
            <p className="text-sm text-muted-foreground">Issues to monitor</p>
          </CardContent>
        </Card>

        <Card className="bg-background-container shadow-soft transition-smooth">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Failed</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{failCount}</p>
            <p className="text-sm text-muted-foreground">Issues requiring action</p>
          </CardContent>
        </Card>

        <Card className="bg-background-container shadow-soft transition-smooth">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">High Severity</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{highSeverityCount}</p>
            <p className="text-sm text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Status Alert */}
      {failCount > 0 && (
        <Alert className="border-destructive bg-soft-destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Quality Issues Detected:</strong> {failCount} validation{failCount > 1 ? 's' : ''} failed. 
            These issues may impact analysis accuracy and should be addressed immediately.
          </AlertDescription>
        </Alert>
      )}

      {warnCount > 0 && failCount === 0 && (
        <Alert className="border-warning bg-soft-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Quality Warnings:</strong> {warnCount} validation{warnCount > 1 ? 's' : ''} have warnings. 
            These should be monitored but don't prevent analysis.
          </AlertDescription>
        </Alert>
      )}

      {passCount === data.length && data.length > 0 && (
        <Alert className="border-primary bg-soft-primary">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>All Validations Passed:</strong> Data quality is excellent. All {passCount} validation checks passed successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Validation Results */}
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Detailed Validation Results
            </CardTitle>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <div className="space-y-4">
              {data.map((validation, index) => (
                <div key={index} className="border border-border/30 rounded-lg p-4 bg-background-secondary">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(validation.validation_category)}
                      <span className="font-medium">{validation.validation_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(validation.status)}
                      {getSeverityBadge(validation.severity)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="font-medium">{validation.validation_category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Issue Count</p>
                      <p className="font-medium">{validation.issue_count}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{validation.description}</p>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Suggested Action</p>
                    <p className="text-sm font-medium">{validation.suggested_action}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No validation data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Quality Guidelines */}
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Data Quality Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Critical Issues (High Severity)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Missing analytics data that affects calculations</li>
                  <li>• Data consistency errors between tables</li>
                  <li>• Failed data validation checks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Warnings (Medium/Low Severity)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Stale data that may be outdated</li>
                  <li>• Minor inconsistencies that don't affect analysis</li>
                  <li>• Performance monitoring alerts</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-background-tertiary rounded-lg">
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Run data validation regularly (daily recommended)</li>
                <li>• Address high-severity issues immediately</li>
                <li>• Monitor warnings for trends</li>
                <li>• Refresh analytics data when validation fails</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};