import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, Mail } from 'lucide-react';
import { CustomerChurnAnalysis } from '@/hooks/useSalesAnalytics';
import { formatString, formatInteger, formatCurrency } from '@/utils/formatters';
import { getStatusBadge, getPriorityBadge, getTrendIcon, getRiskScoreColor } from './churnUtils';

interface ChurnTableRowProps {
  customer: CustomerChurnAnalysis;
}

export const ChurnTableRow: React.FC<ChurnTableRowProps> = ({ customer }) => {
  return (
    <TableRow key={customer.customer_code} className="hover:bg-background-secondary">
      <TableCell>
        <div>
          <p className="font-medium">{formatString(customer.customer_name) || formatString(customer.customer_code) || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">{formatString(customer.customer_code) || 'N/A'}</p>
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(customer.churn_status)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${getRiskScoreColor(customer.risk_score || 0)}`}>
            {formatInteger(customer.risk_score)}%
          </span>
          <div className="w-16 h-2 bg-background-secondary rounded-full">
            <div 
              className={`h-2 rounded-full ${
                (customer.risk_score || 0) >= 70 ? 'bg-destructive' :
                (customer.risk_score || 0) >= 50 ? 'bg-warning' :
                (customer.risk_score || 0) >= 30 ? 'bg-secondary' : 'bg-muted-foreground'
              }`}
              style={{ width: `${customer.risk_score || 0}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm">
          {formatCurrency(customer.historical_value)}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm">
          {formatCurrency(customer.recent_value)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getTrendIcon(customer.value_trend)}
          <span className="text-sm">{customer.value_trend}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {formatInteger(customer.weeks_since_last_order)} weeks ago
          </span>
        </div>
      </TableCell>
      <TableCell>
        {getPriorityBadge(customer.recovery_priority)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};