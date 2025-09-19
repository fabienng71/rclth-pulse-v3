import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Archive, 
  ArchiveRestore, 
  MoreVertical,
  Send,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Quotation, QuotationStatus } from '@/types/quotations';
import { calculateTotal } from '@/components/quotations/details/items/QuotationItemsCalculations';

interface EnhancedQuotationsTableProps {
  quotations: Quotation[];
  onDelete: (id: string) => void;
  onArchive: (id: string, currentStatus: boolean) => void;
  onStatusUpdate?: (id: string, status: QuotationStatus) => void;
}

const getStatusColor = (status: QuotationStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-500 hover:bg-gray-600';
    case 'final':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'sent':
      return 'bg-purple-500 hover:bg-purple-600';
    case 'accepted':
      return 'bg-green-500 hover:bg-green-600';
    case 'rejected':
      return 'bg-red-500 hover:bg-red-600';
    case 'expired':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'archived':
      return 'bg-gray-700 hover:bg-gray-800';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const getStatusIcon = (status: QuotationStatus) => {
  switch (status) {
    case 'sent':
      return <Send className="h-3 w-3" />;
    case 'expired':
      return <AlertTriangle className="h-3 w-3" />;
    case 'draft':
      return <Clock className="h-3 w-3" />;
    default:
      return null;
  }
};

const isQuotationExpiring = (createdAt: string, validityDays: number) => {
  const created = new Date(createdAt);
  const expiry = new Date(created.getTime() + validityDays * 24 * 60 * 60 * 1000);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
};

export const EnhancedQuotationsTable: React.FC<EnhancedQuotationsTableProps> = ({
  quotations,
  onDelete,
  onArchive,
  onStatusUpdate,
}) => {
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateQuotationTotal = (quotation: Quotation) => {
    // Calculate total from quotation items if available
    if (quotation.quotation_items && Array.isArray(quotation.quotation_items)) {
      return calculateTotal(quotation.quotation_items);
    }
    return 0;
  };

  return (
    <div className="rounded-md border shadow overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Quote #</TableHead>
            <TableHead className="min-w-[200px]">Title</TableHead>
            <TableHead className="min-w-[180px]">Customer / Lead</TableHead>
            <TableHead className="w-[120px]">Amount</TableHead>
            <TableHead className="w-[100px]">Created</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => {
            const total = calculateQuotationTotal(quotation);
            const isExpiring = isQuotationExpiring(quotation.created_at, quotation.validity_days);
            
            return (
              <TableRow key={quotation.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{quotation.quote_number || 'Draft'}</span>
                    {isExpiring && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Link 
                      to={`/quotations/${quotation.id}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {quotation.title}
                    </Link>
                    {quotation.notes && (
                      <p className="text-xs text-muted-foreground">
                        {quotation.notes}
                      </p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {quotation.is_lead ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{quotation.lead_name}</span>
                        <Badge className="bg-purple-500 text-xs">Lead</Badge>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">
                          {quotation.search_name || quotation.customer_name || 'No customer'}
                        </div>
                        {quotation.customer_code && (
                          <div className="text-xs text-muted-foreground">
                            Code: {quotation.customer_code}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="font-medium">
                  {formatCurrency(total)}
                </TableCell>
                
                <TableCell className="text-muted-foreground">
                  {quotation.created_at
                    ? format(new Date(quotation.created_at), 'MMM d, yyyy')
                    : 'N/A'}
                </TableCell>
                
                <TableCell>
                  <Badge 
                    className={`${getStatusColor(quotation.status)} text-white border-0 gap-1`}
                  >
                    {getStatusIcon(quotation.status)}
                    {quotation.status}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem asChild>
                        <Link to={`/quotations/${quotation.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/quotations/${quotation.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onArchive(quotation.id, !!quotation.archive)}
                      >
                        {quotation.archive ? (
                          <>
                            <ArchiveRestore className="mr-2 h-4 w-4" />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(quotation.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
