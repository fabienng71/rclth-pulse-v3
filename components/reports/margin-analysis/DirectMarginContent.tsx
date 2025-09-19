
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { MarginOverallData, ProcessedMarginData, MarginItem, MarginCustomer, ViewMode } from './types';
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';

interface DirectMarginContentProps {
  marginData: ProcessedMarginData | undefined;
  isLoading: boolean;
}

export const DirectMarginContent: React.FC<DirectMarginContentProps> = ({ 
  marginData,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState("items");
  const [searchTerm, setSearchTerm] = useState("");

  const getMarginColor = (marginPercent: number): string => {
    if (marginPercent >= 28) return 'text-green-600';
    if (marginPercent >= 20) return 'text-amber-500';
    if (marginPercent >= 15) return 'text-orange-600';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const items = marginData?.topItems || [];
  const customers = marginData?.topCustomers || [];

  // Filter items and customers based on search term
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.item_code && item.item_code.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });
  
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.customer_code && customer.customer_code.toLowerCase().includes(searchLower)) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(searchLower)) ||
      (customer.customer_name && customer.customer_name.toLowerCase().includes(searchLower))
    );
  });

  // Calculate dynamic height based on number of rows
  const getTableHeight = (rows: any[]) => {
    // Base height plus row height * number of rows (max 500px)
    return { maxHeight: `${Math.min(rows.length * 48 + 60, 500)}px`, overflowY: 'auto' as const };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <div className="relative w-[250px]">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'items' ? 'items' : 'customers'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
          <svg 
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
      </div>

      <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="rounded-md border" style={getTableHeight(filteredItems)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item: MarginItem, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.item_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.total_quantity)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.margin)}</TableCell>
                      <TableCell className={`text-right font-medium ${getMarginColor(item.margin_percent)}`}>
                        {item.margin_percent?.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      {searchTerm ? 'No matching items found.' : 'No items found for the selected period.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="rounded-md border" style={getTableHeight(filteredCustomers)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer: MarginCustomer, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>{customer.search_name || customer.customer_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(customer.total_quantity)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.total_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.total_cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.margin)}</TableCell>
                      <TableCell className={`text-right font-medium ${getMarginColor(customer.margin_percent)}`}>
                        {customer.margin_percent?.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      {searchTerm ? 'No matching customers found.' : 'No customers found for the selected period.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
