
import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, User, Building, FileText, Tag, Edit, Save, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFollowupUpdate } from '@/hooks/useFollowupUpdate';

interface Followup {
  id: string;
  customer_name: string;
  follow_up_date: string;
  notes: string;
  pipeline_stage: string;
  priority: string;
  salesperson_name: string;
}

interface FollowupDetailModalProps {
  followup: Followup | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (followup: Followup) => void;
}

const STATUS_OPTIONS = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Closed Won', label: 'Closed Won' },
  { value: 'Closed Lost', label: 'Closed Lost' },
];

export const FollowupDetailModal: React.FC<FollowupDetailModalProps> = ({
  followup,
  isOpen,
  onClose,
  onEdit
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { updateStatus, isUpdating } = useFollowupUpdate();

  if (!followup) return null;

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

  const getDateStatus = (followUpDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);
    
    if (followUp < today) {
      return { label: 'Overdue', color: 'text-red-600' };
    } else if (followUp.getTime() === today.getTime()) {
      return { label: 'Due Today', color: 'text-yellow-600' };
    } else {
      return { label: 'Upcoming', color: 'text-blue-600' };
    }
  };

  const dateStatus = getDateStatus(followup.follow_up_date);

  // Function to safely render HTML content
  const renderNotes = (notes: string) => {
    if (!notes) return 'No notes available';
    
    // Check if the notes contain HTML tags
    const hasHTML = /<[^>]*>/g.test(notes);
    
    if (hasHTML) {
      // Render as HTML but sanitize basic dangerous elements
      const sanitizedNotes = notes.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      return <div dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />;
    } else {
      // Render as plain text with preserved whitespace
      return notes;
    }
  };

  const handleStatusEdit = () => {
    setSelectedStatus(followup.pipeline_stage);
    setIsEditingStatus(true);
  };

  const handleStatusSave = () => {
    if (selectedStatus && selectedStatus !== followup.pipeline_stage) {
      updateStatus({ id: followup.id, pipeline_stage: selectedStatus });
    }
    setIsEditingStatus(false);
  };

  const handleStatusCancel = () => {
    setSelectedStatus('');
    setIsEditingStatus(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Follow-up Details</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                <p className="text-sm font-medium">{followup.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Salesperson</label>
                <p className="text-sm">{followup.salesperson_name || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Follow-up Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Follow-up Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Follow-up Date</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {format(new Date(followup.follow_up_date), 'MMMM dd, yyyy')}
                  </p>
                  <span className={`text-xs font-medium ${dateStatus.color}`}>
                    ({dateStatus.label})
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pipeline Stage</label>
                <div className="flex items-center gap-2">
                  {isEditingStatus ? (
                    <div className="flex items-center gap-2">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleStatusSave}
                        disabled={isUpdating}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleStatusCancel}
                        disabled={isUpdating}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(followup.pipeline_stage)}>
                        {followup.pipeline_stage}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleStatusEdit}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes with Scrolling */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Notes</h3>
            </div>
            <div className="border rounded-lg bg-muted/50">
              <ScrollArea className="h-[200px] w-full p-4">
                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                  {renderNotes(followup.notes)}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(followup)}>
                Edit Follow-up
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
