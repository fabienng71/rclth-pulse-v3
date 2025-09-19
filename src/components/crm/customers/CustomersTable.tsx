import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { CustomerWithAnalytics } from '@/hooks/useCustomersWithAnalytics';
import { CustomerDetailsRow } from './CustomerDetailsRow';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';
import { formatCurrency } from '@/lib/utils';
import { CleanFragment } from '@/components/ui/clean-fragment';

interface CustomersTableProps {
  customers: CustomerWithAnalytics[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onDataRefresh: () => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  sortField,
  sortDirection,
  onSort,
  onDataRefresh
}) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithAnalytics | null>(null);

  const toggleRowExpansion = (customerCode: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(customerCode)) {
      newExpandedRows.delete(customerCode);
    } else {
      newExpandedRows.add(customerCode);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleEdit = (customer: CustomerWithAnalytics) => {
    navigate(`/crm/customers/${customer.customer_code}/edit`);
  };

  const handleDelete = (customer: CustomerWithAnalytics) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
    onDataRefresh();
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };


  const formatTransactionFrequency = (frequency: number | null) => {
    if (!frequency) return 'Never';
    if (frequency < 1) return `${(frequency * 12).toFixed(1)}/year`;
    if (frequency < 12) return `${frequency.toFixed(1)}/month`;
    return `${(frequency / 12).toFixed(1)}/day`;
  };

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No customers found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => onSort('search_name')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Customer Details {getSortIcon('search_name')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      onClick={() => onSort('total_turnover')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Total Turnover {getSortIcon('total_turnover')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => onSort('last_transaction_date')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Last Transaction {getSortIcon('last_transaction_date')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => onSort('transaction_frequency')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Frequency {getSortIcon('transaction_frequency')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <CleanFragment fragmentKey={customer.customer_code}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(customer.customer_code)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedRows.has(customer.customer_code) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {customer.search_name || customer.customer_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {customer.customer_code} • {customer.customer_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {customer.total_turnover > 0 ? (
                          <span className={customer.total_turnover > 100000 ? 'text-green-600 font-bold' : ''}>
                            ฿{formatCurrency(customer.total_turnover)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">฿0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.last_transaction_date ? (
                          new Date(customer.last_transaction_date).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatTransactionFrequency(customer.transaction_frequency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(customer.customer_code) && (
                      <CustomerDetailsRow 
                        customer={customer}
                      />
                    )}
                  </CleanFragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteCustomerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        customer={customerToDelete}
        onCustomerDeleted={handleDeleteConfirm}
      />
    </>
  );
};
