
import React from 'react';
import { ClearanceItem } from '@/hooks/useClearanceData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClearanceTable } from '@/components/crm/ClearanceTable';

interface VendorGroup {
  vendorName: string;
  items: ClearanceItem[];
  totalItems: number;
  statusCounts: {
    critical: number;
    warning: number;
    normal: number;
    good: number;
    unknown: number;
  };
  totalValue: number;
  upcomingExpirations: number; // items expiring within 7 days
}

interface VendorAccordionGroupProps {
  items: ClearanceItem[];
  sortField: keyof ClearanceItem;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof ClearanceItem) => void;
  onEdit: (item: ClearanceItem) => void;
  onDelete: (item: ClearanceItem) => void;
  isSelectMode?: boolean;
  selectedItems?: Set<string>;
  onItemSelect?: (itemId: string, selected: boolean) => void;
}

export const VendorAccordionGroup: React.FC<VendorAccordionGroupProps> = ({
  items,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  isSelectMode = false,
  selectedItems = new Set(),
  onItemSelect
}) => {
  // Group items by vendor
  const groupItemsByVendor = (items: ClearanceItem[]): VendorGroup[] => {
    const vendorMap = new Map<string, ClearanceItem[]>();
    
    items.forEach(item => {
      const vendorName = item.vendor || 'Unknown Vendor';
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, []);
      }
      vendorMap.get(vendorName)!.push(item);
    });

    // Convert to VendorGroup array and sort
    const vendorGroups: VendorGroup[] = Array.from(vendorMap.entries()).map(([vendorName, vendorItems]) => {
      const statusCounts = {
        critical: 0,
        warning: 0,
        normal: 0,
        good: 0,
        unknown: 0
      };

      let totalValue = 0;
      let upcomingExpirations = 0;
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      vendorItems.forEach(item => {
        // Count by status
        const status = (item.status || 'unknown').toLowerCase();
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++;
        } else {
          statusCounts.unknown++;
        }

        // Calculate total value
        if (item.clearance_price) {
          totalValue += item.clearance_price * item.quantity;
        }

        // Count upcoming expirations
        if (item.expiration_date) {
          const expirationDate = new Date(item.expiration_date);
          if (expirationDate <= sevenDaysFromNow && expirationDate >= now) {
            upcomingExpirations++;
          }
        }
      });

      return {
        vendorName,
        items: vendorItems,
        totalItems: vendorItems.length,
        statusCounts,
        totalValue,
        upcomingExpirations
      };
    });

    // Sort by vendor name alphabetically, then by item count (descending)
    vendorGroups.sort((a, b) => {
      const nameCompare = a.vendorName.localeCompare(b.vendorName);
      if (nameCompare === 0) {
        return b.totalItems - a.totalItems;
      }
      return nameCompare;
    });

    return vendorGroups;
  };

  const vendorGroups = groupItemsByVendor(items);

  const formatPrice = (price: number) => {
    return Math.floor(price).toLocaleString('en-US');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (vendorGroups.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No clearance items found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={vendorGroups.map((_, index) => `vendor-${index}`)} className="space-y-4">
        {vendorGroups.map((vendorGroup, index) => (
          <AccordionItem key={vendorGroup.vendorName} value={`vendor-${index}`} className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">{vendorGroup.vendorName}</h3>
                  <Badge variant="outline" className="bg-blue-50">
                    {vendorGroup.totalItems} items
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  {/* Status badges */}
                  {vendorGroup.statusCounts.critical > 0 && (
                    <Badge variant="outline" className={getStatusBadgeColor('critical')}>
                      {vendorGroup.statusCounts.critical} Critical
                    </Badge>
                  )}
                  {vendorGroup.statusCounts.warning > 0 && (
                    <Badge variant="outline" className={getStatusBadgeColor('warning')}>
                      {vendorGroup.statusCounts.warning} Warning
                    </Badge>
                  )}
                  {vendorGroup.statusCounts.normal > 0 && (
                    <Badge variant="outline" className={getStatusBadgeColor('normal')}>
                      {vendorGroup.statusCounts.normal} Normal
                    </Badge>
                  )}
                  {vendorGroup.statusCounts.good > 0 && (
                    <Badge variant="outline" className={getStatusBadgeColor('good')}>
                      {vendorGroup.statusCounts.good} Good
                    </Badge>
                  )}
                  
                  {/* Total value */}
                  {vendorGroup.totalValue > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
                      Value: {formatPrice(vendorGroup.totalValue)}
                    </Badge>
                  )}
                  
                  {/* Upcoming expirations */}
                  {vendorGroup.upcomingExpirations > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">
                      {vendorGroup.upcomingExpirations} expiring soon
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-0 pb-0">
              <div className="border-t">
                <ClearanceTable
                  items={vendorGroup.items}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isSelectMode={isSelectMode}
                  selectedItems={selectedItems}
                  onItemSelect={onItemSelect}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
