
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { SyncResult } from '@/utils/templateSync';

interface TemplateSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  syncResult: SyncResult;
  onConfirmSync: () => void;
  loading?: boolean;
}

const TemplateSyncDialog: React.FC<TemplateSyncDialogProps> = ({
  open,
  onOpenChange,
  syncResult,
  onConfirmSync,
  loading = false
}) => {
  const { changes } = syncResult;
  const totalChanges = changes.newTasks.length + changes.modifiedTasks.length + changes.removedTasks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Template Updates Available
          </DialogTitle>
          <DialogDescription>
            The checklist template has been updated. Review the changes below and sync to update this todo list.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {changes.newTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="font-medium">New Tasks</span>
                  <Badge variant="secondary">{changes.newTasks.length}</Badge>
                </div>
                <div className="space-y-2 pl-6">
                  {changes.newTasks.map((task, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-sm font-medium">{task.label}</div>
                      <div className="text-xs text-muted-foreground">Section: {task.sectionId}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {changes.modifiedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Modified Tasks</span>
                  <Badge variant="secondary">{changes.modifiedTasks.length}</Badge>
                </div>
                <div className="space-y-2 pl-6">
                  {changes.modifiedTasks.map((task, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-sm">
                        <span className="text-red-600 line-through">{task.oldLabel}</span>
                        <br />
                        <span className="text-green-600 font-medium">{task.newLabel}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Section: {task.sectionId}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {changes.removedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Tasks No Longer in Template</span>
                  <Badge variant="secondary">{changes.removedTasks.length}</Badge>
                </div>
                <div className="space-y-2 pl-6">
                  {changes.removedTasks.map((task, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded border border-red-200">
                      <div className="text-sm">{task.label}</div>
                      <div className="text-xs text-muted-foreground">
                        Section: {task.sectionId} • Will be hidden but preserved in database
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirmSync} disabled={loading}>
            {loading ? 'Syncing...' : `Sync ${totalChanges} Changes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSyncDialog;
