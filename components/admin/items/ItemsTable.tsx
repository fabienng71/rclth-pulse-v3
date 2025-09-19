
import React from 'react';
import { Edit, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Item } from '@/hooks/useItemsData';

interface ItemsTableProps {
  filteredItems: Item[];
  isLoading: boolean;
  searchTerm: string;
  onEdit: (item: Item) => void;
  onDelete: (itemCode: string) => void;
  isDeleting: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedItems: string[];
  onSelectionChange: (selectedItems: string[]) => void;
}

export const ItemsTable = ({ 
  filteredItems, 
  isLoading, 
  searchTerm, 
  onEdit, 
  onDelete, 
  isDeleting,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  selectedItems,
  onSelectionChange
}: ItemsTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItemCodes = filteredItems.map(item => item.item_code);
      onSelectionChange(allItemCodes);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemCode: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemCode]);
    } else {
      onSelectionChange(selectedItems.filter(code => code !== itemCode));
    }
  };

  const isAllSelected = filteredItems.length > 0 && selectedItems.length === filteredItems.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < filteredItems.length;

  if (isLoading) {
    return <div className="text-center py-8">Loading items...</div>;
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-muted-foreground">
          {searchTerm ? `No items match "${searchTerm}". Try a different search term.` : 'Get started by creating your first item.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all items"
                  {...(isIndeterminate && { "data-state": "indeterminate" })}
                />
              </TableHead>
              <TableHead>Item Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Posting Group</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Vendor Code</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Pricelist</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.item_code}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.item_code)}
                    onCheckedChange={(checked) => handleSelectItem(item.item_code, Boolean(checked))}
                    aria-label={`Select ${item.item_code}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.item_code}</TableCell>
                <TableCell className="unicode-text">{item.description?.normalize('NFC') || '-'}</TableCell>
                <TableCell>{item.posting_group || '-'}</TableCell>
                <TableCell>{item.unit_price ? `$${item.unit_price.toFixed(2)}` : '-'}</TableCell>
                <TableCell>{item.vendor_code || '-'}</TableCell>
                <TableCell>{item.brand || '-'}</TableCell>
                <TableCell>
                  {item.pricelist ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isDeleting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{item.item_code}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(item.item_code)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalCount)} of {totalCount} items
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
