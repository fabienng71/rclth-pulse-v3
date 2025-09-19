import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  FileText, 
  Send, 
  Heart 
} from 'lucide-react';

interface ItemsTableActionsProps {
  itemCode: string;
  onViewDetails?: (itemCode: string) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  onToggleFavorite?: (itemCode: string) => void;
}

export const ItemsTableActions: React.FC<ItemsTableActionsProps> = ({
  itemCode,
  onViewDetails,
  onQuickQuote,
  onRequestSample,
  onToggleFavorite
}) => {
  return (
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
            onViewDetails?.(itemCode);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onQuickQuote?.(itemCode);
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Quick Quote
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRequestSample?.(itemCode);
          }}
        >
          <Send className="h-4 w-4 mr-2" />
          Request Sample
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(itemCode);
          }}
        >
          <Heart className="h-4 w-4 mr-2" />
          Add to Favorites
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};