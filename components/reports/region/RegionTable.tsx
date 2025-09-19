import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MapPin, Users } from 'lucide-react';
import { RegionTurnoverResponse, RegionData } from '@/hooks/useRegionTurnoverData';
import { FinancialData } from '@/components/permissions/PermissionGate';

interface RegionTableProps {
  data: RegionTurnoverResponse;
}

export const RegionTable: React.FC<RegionTableProps> = ({ data }) => {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const toggleRegion = (regionName: string) => {
    setExpandedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(regionName)) {
        newSet.delete(regionName);
      } else {
        newSet.add(regionName);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleAllRegions = () => {
    if (expandedRegions.size === data.regions.length) {
      setExpandedRegions(new Set());
    } else {
      setExpandedRegions(new Set(data.regions.map(r => r.region)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Regional Turnover Analysis
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllRegions}
          >
            {expandedRegions.size === data.regions.length ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.regions.map((region: RegionData) => (
            <Collapsible
              key={region.region}
              open={expandedRegions.has(region.region)}
              onOpenChange={() => toggleRegion(region.region)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-auto p-4 justify-start border rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {expandedRegions.has(region.region) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold">{region.region}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {region.customer_count} customers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        <FinancialData 
                          amount={region.total_turnover}
                          permission="view_turnover_amounts"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((region.total_turnover / data.totalTurnover) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <div className="ml-7 border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Code</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Salesperson</TableHead>
                        <TableHead className="text-right">Total Turnover</TableHead>
                        <TableHead className="text-right">% of Region</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {region.customers.map((customer) => (
                        <TableRow key={customer.customer_code}>
                          <TableCell className="font-mono text-sm">
                            {customer.customer_code}
                          </TableCell>
                          <TableCell>{customer.customer_name}</TableCell>
                          <TableCell className="text-sm">
                            {customer.salesperson_code || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <FinancialData 
                              amount={customer.total_turnover}
                              permission="view_turnover_amounts"
                            />
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {((customer.total_turnover / region.total_turnover) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        
        {data.regions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No regional data found for the selected criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
};