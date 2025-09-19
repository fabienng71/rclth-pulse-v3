
import React from 'react';
import { format } from 'date-fns';
import { Eye, Edit, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DOMPurify from 'dompurify';

interface Followup {
  id: string;
  customer_name: string;
  follow_up_date: string;
  notes: string;
  pipeline_stage: string;
  priority: string;
  salesperson_name: string;
  is_done?: boolean;
  completed_at?: string | null;
}

interface FollowupsTableProps {
  followups: Followup[];
  onViewDetails: (followup: Followup) => void;
  onEdit: (followup: Followup) => void;
}

export const FollowupsTable: React.FC<FollowupsTableProps> = ({
  followups,
  onViewDetails,
  onEdit
}) => {
  const getDateStatus = (followUpDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);
    
    if (followUp < today) {
      return { status: 'overdue', icon: AlertTriangle, color: 'text-red-600' };
    } else if (followUp.getTime() === today.getTime()) {
      return { status: 'today', icon: Clock, color: 'text-yellow-600' };
    } else {
      return { status: 'upcoming', icon: Calendar, color: 'text-blue-600' };
    }
  };

  const getStatusBadgeVariant = (pipeline_stage: string) => {
    const statusLower = pipeline_stage.toLowerCase();
    switch (statusLower) {
      case 'closed won':
        return 'default';
      case 'lead':
      case 'qualified':
        return 'secondary';
      case 'closed lost':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const truncateNotes = (notes: string, maxLength: number = 60) => {
    if (!notes) return { html: '', text: '-' };
    
    // Sanitize the HTML
    const sanitizedHTML = DOMPurify.sanitize(notes);
    
    // Strip HTML tags to get plain text for length calculation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHTML;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    if (textContent.length <= maxLength) {
      return { html: sanitizedHTML, text: textContent };
    }
    
    // For truncation, we'll show just the plain text with ellipsis
    return { html: '', text: `${textContent.substring(0, maxLength)}...` };
  };

  if (followups.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No follow-ups found</h3>
            <p className="text-muted-foreground mt-2">
              No follow-ups match your current filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Salesperson</TableHead>
              <TableHead className="w-[100px]">Pipeline Stage</TableHead>
              <TableHead className="min-w-[200px]">Notes</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followups.map((followup) => {
              const dateStatus = getDateStatus(followup.follow_up_date);
              const IconComponent = dateStatus.icon;
              const notesData = truncateNotes(followup.notes);
              const isCompleted = followup.is_done || false;
              
              return (
                <TableRow key={followup.id} className={isCompleted ? 'opacity-75' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 ${isCompleted ? 'text-gray-500' : dateStatus.color}`} />
                      <span className={`text-sm ${isCompleted ? 'text-muted-foreground' : dateStatus.color}`}>
                        {format(new Date(followup.follow_up_date), 'MMM dd')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={`font-medium ${isCompleted ? 'text-muted-foreground' : ''}`}>
                        {followup.customer_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {followup.salesperson_name || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(followup.pipeline_stage)} className={isCompleted ? 'opacity-60' : ''}>
                      {followup.pipeline_stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notesData.html ? (
                      <div 
                        className={`text-sm prose prose-sm max-w-none ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                        dangerouslySetInnerHTML={{ __html: notesData.html }}
                      />
                    ) : (
                      <span className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {notesData.text}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(followup)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(followup)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
