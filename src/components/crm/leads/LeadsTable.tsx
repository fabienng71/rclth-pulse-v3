
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '@/hooks/useOptimizedLeadsData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { SortDirection } from '@/hooks/useSortableTable';

interface LeadsTableProps {
  leads: Lead[];
  selectedLeads: Lead[];
  onSelectionChange: (leads: Lead[]) => void;
  sortField?: string;
  sortDirection?: SortDirection;
  onSort?: (field: string) => void;
  onLeadUpdate: () => void;
}

const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return <span className="text-gray-400">—</span>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Deal in Progress':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Won':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Not Qualified':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {status}
    </Badge>
  );
};

export const LeadsTable = ({
  leads,
  selectedLeads,
  onSelectionChange,
  sortField,
  sortDirection,
  onSort,
  onLeadUpdate
}: LeadsTableProps) => {
  const navigate = useNavigate();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(leads);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLead = (lead: Lead, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLeads, lead]);
    } else {
      onSelectionChange(selectedLeads.filter(l => l.id !== lead.id));
    }
  };

  const isSelected = (leadId: string) => selectedLeads.some(l => l.id === leadId);
  const isAllSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const isIndeterminate = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium mb-2">No leads found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isIndeterminate ? "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground [&>span]:opacity-50" : ""}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('customer_name')}
            >
              <div className="flex items-center gap-2">
                Customer Name
                {getSortIcon('customer_name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('contact_name')}
            >
              <div className="flex items-center gap-2">
                Contact Name
                {getSortIcon('contact_name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('email')}
            >
              <div className="flex items-center gap-2">
                Email
                {getSortIcon('email')}
              </div>
            </TableHead>
            <TableHead>Phone</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('status')}
            >
              <div className="flex items-center gap-2">
                Status
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('full_name')}
            >
              <div className="flex items-center gap-2">
                Salesperson
                {getSortIcon('full_name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('updated_at')}
            >
              <div className="flex items-center gap-2">
                Last Updated
                {getSortIcon('updated_at')}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/crm/leads/${lead.id}`)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected(lead.id)}
                  onCheckedChange={(checked) => handleSelectLead(lead, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">{lead.customer_name}</TableCell>
              <TableCell>
                {lead.contact_name || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {lead.email ? (
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.phone ? (
                  <a 
                    href={`tel:${lead.phone}`} 
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell>
                {lead.full_name ||  <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {lead.updated_at
                  ? new Date(lead.updated_at).toLocaleDateString()
                  : <span className="text-muted-foreground">—</span>
                }
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-100"
                  title="Delete lead"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
