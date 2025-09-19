import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Calendar, User } from 'lucide-react';
import { LeadCenter } from '@/types/leadCenter';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getSalesStageInfo } from '@/utils/channelMapping';

interface LeadCenterTableProps {
  leads: LeadCenter[];
  isLoading?: boolean;
  onStatusUpdate: (id: string, status: LeadCenter['status']) => void;
  onDelete: (id: string) => void;
}

export const LeadCenterTable: React.FC<LeadCenterTableProps> = ({
  leads,
  isLoading,
  onStatusUpdate,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    const stageInfo = getSalesStageInfo(status);
    return stageInfo.color;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead Title</TableHead>
              <TableHead>Customer/Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Next Step Due</TableHead>
              <TableHead>Est. Value</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No leads found. Create your first lead to get started.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/crm/lead-center/${lead.id}`)}
                >
                  <TableCell>
                    <div className="font-medium">{lead.lead_title}</div>
                    {lead.lead_description && (
                      <div className="text-sm text-muted-foreground">
                        {lead.lead_description}
                      </div>
                    )}
                  </TableCell>
                   <TableCell>
                     {lead.contact ? (
                       <div className="font-medium">
                         {lead.contact.first_name} {lead.contact.last_name}
                       </div>
                     ) : (
                       '-'
                     )}
                   </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge className={`cursor-pointer ${getStatusColor(lead.status)}`}>
                          {getSalesStageInfo(lead.status).label}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'contacted');
                        }}>
                          Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'meeting_scheduled');
                        }}>
                          Meeting Scheduled
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'samples_sent');
                        }}>
                          Samples Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'samples_followed_up');
                        }}>
                          Samples Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'negotiating');
                        }}>
                          Negotiating
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'closed_won');
                        }}>
                          Closed Won
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onStatusUpdate(lead.id, 'closed_lost');
                        }}>
                          Closed Lost
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(lead.priority)}>
                      {lead.priority}
                    </Badge>
                  </TableCell>
                   <TableCell>
                     {lead.assigned_to ? (
                       <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm">Assigned</span>
                       </div>
                     ) : (
                       '-'
                     )}
                   </TableCell>
                  <TableCell>
                    {lead.next_step_due ? (
                      <div className={`flex items-center gap-2 ${
                        isOverdue(lead.next_step_due) ? 'text-destructive' : ''
                      }`}>
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{formatDate(lead.next_step_due)}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(lead.estimated_value)}</TableCell>
                  <TableCell>
                    {lead.close_probability ? `${lead.close_probability}%` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.updated_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/crm/lead-center/${lead.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this lead?')) {
                              onDelete(lead.id);
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
};