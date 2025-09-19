
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GitBranch } from "lucide-react";

interface ActivityActionsProps {
  isAdmin: boolean;
  onViewPipeline: (e: React.MouseEvent, id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDelete?: (e: React.MouseEvent, id: string) => void;
  activityId: string;
}

export const ActivityActions: React.FC<ActivityActionsProps> = ({
  isAdmin,
  onViewPipeline,
  onEdit,
  onDelete,
  activityId,
}) => (
  <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 hover:opacity-100 transition-opacity">
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => onViewPipeline(e, activityId)}
      className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 touch-manipulation"
      title="View Pipeline"
    >
      <GitBranch className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => onEdit(e, activityId)}
      className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 touch-manipulation"
      title="Edit Activity"
    >
      <Edit className="h-4 w-4" />
    </Button>
    {isAdmin && onDelete && (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => onDelete(e, activityId)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
        title="Delete Activity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
  </div>
);
