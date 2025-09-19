
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Building2, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  customer_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  updated_at: string | null;
  full_name: string | null;
}

interface LeadCardProps {
  lead: Lead;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const getStatusColor = (status: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-700';
  
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Contacted':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Deal in Progress':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Won':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const LeadCard = ({ lead, onDelete }: LeadCardProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div onClick={() => navigate(`/crm/leads/${lead.id}`)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(lead.customer_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{lead.customer_name}</h3>
              {lead.contact_name && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {lead.contact_name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(lead.status)}`}
            >
              {lead.status || 'Unknown'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onDelete(lead.id, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {lead.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <a 
                href={`mailto:${lead.email}`} 
                className="hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.email}
              </a>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a 
                href={`tel:${lead.phone}`} 
                className="hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.phone}
              </a>
            </div>
          )}
          
          {lead.full_name && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{lead.full_name}</span>
            </div>
          )}
          
          {lead.updated_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Updated {new Date(lead.updated_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-3 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/crm/leads/${lead.id}`)}
          className="text-xs"
        >
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
