import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeadCenter } from '@/types/leadCenter';
import { 
  User, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Trash2,
  GripVertical,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getChannelInfo, getChannelBadgeColor, getSalesStageInfo } from '@/utils/channelMapping';

interface KanbanCardProps {
  lead: LeadCenter;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  lead,
  onDelete,
  isDragging = false,
}) => {
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: LeadCenter['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate < now;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/crm/lead-center/${lead.id}`);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'shadow-lg rotate-5' : ''
      } ${isSortableDragging ? 'z-50' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Drag Handle */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate mb-1">
              {lead.lead_title}
            </h3>
            {lead.lead_description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {lead.lead_description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead.id);
              }}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div
              {...attributes}
              {...listeners}
              className="p-1 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(lead.priority)}`}
          >
            {lead.priority}
          </Badge>
          {lead.lead_source && (
            <Badge variant="secondary" className="text-xs">
              {lead.lead_source}
            </Badge>
          )}
          {/* Channel Badge */}
          {lead.customer_channel && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getChannelBadgeColor(getChannelInfo(lead.customer_channel)?.category || 'other')}`}
            >
              <Building2 className="h-2 w-2 mr-1" />
              {getChannelInfo(lead.customer_channel)?.code || lead.customer_channel}
            </Badge>
          )}
          {/* Sales Stage Badge - now unified with status */}
          <Badge 
            variant="outline" 
            className={`text-xs ${getSalesStageInfo(lead.status).color}`}
          >
            {getSalesStageInfo(lead.status).label}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="space-y-2 mb-3">
          {lead.estimated_value && (
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-700">
                {formatCurrency(lead.estimated_value)}
              </span>
            </div>
          )}
          
          {lead.close_probability && (
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-blue-700">
                {lead.close_probability}% chance
              </span>
            </div>
          )}

          {lead.channel_compatibility_score && (
            <div className="flex items-center gap-2 text-xs">
              <Building2 className="h-3 w-3 text-purple-600" />
              <span className="text-purple-700">
                {lead.channel_compatibility_score}/100 match
              </span>
            </div>
          )}

          {lead.next_step_due && (
            <div className={`flex items-center gap-2 text-xs ${
              isOverdue(lead.next_step_due) ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {isOverdue(lead.next_step_due) ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>
                Due {formatDate(lead.next_step_due)}
                {isOverdue(lead.next_step_due) && ' (Overdue)'}
              </span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {lead.contact && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">
              {lead.contact.first_name} {lead.contact.last_name}
            </span>
          </div>
        )}

        {/* Next Step Preview */}
        {lead.next_step && (
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
            <div className="font-medium text-muted-foreground mb-1">Next Step:</div>
            <div className="line-clamp-2">{lead.next_step}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};