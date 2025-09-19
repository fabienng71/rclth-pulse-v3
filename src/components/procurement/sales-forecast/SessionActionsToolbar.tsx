
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Archive, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ForecastSession, useForecastSessions } from '@/hooks/useForecastSessions';
import { ConfirmDeleteSessionDialog } from './ConfirmDeleteSessionDialog';
import { ConfirmCloseSessionDialog } from './ConfirmCloseSessionDialog';

interface SessionActionsToolbarProps {
  session: ForecastSession;
  onSessionDeleted: () => void;
  onSessionClosed: () => void;
}

export const SessionActionsToolbar: React.FC<SessionActionsToolbarProps> = ({
  session,
  onSessionDeleted,
  onSessionClosed
}) => {
  const { user } = useAuthStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const isCreator = user?.id === session.created_by;
  const isActive = session.status === 'active';
  const isCompleted = session.status === 'completed';

  if (!isCreator) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {session.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Read-only access
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {session.status}
      </Badge>
      
      {isActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCloseDialog(true)}
        >
          <Archive className="h-4 w-4 mr-1" />
          Close Session
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDeleteDialog(true)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      <ConfirmDeleteSessionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        session={session}
        onConfirm={onSessionDeleted}
      />

      <ConfirmCloseSessionDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        session={session}
        onConfirm={onSessionClosed}
      />
    </div>
  );
};
