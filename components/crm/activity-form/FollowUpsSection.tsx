
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Calendar, Clock, AlertTriangle, Edit, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useActivityFollowUps, ActivityFollowUp, CreateFollowUpData, UpdateFollowUpData } from '@/hooks/useActivityFollowUps';

interface FollowUpsSectionProps {
  activityId: string | undefined;
}

interface EditingFollowUp {
  id: string;
  follow_up_note: string;
  follow_up_date: string;
  priority: 'low' | 'medium' | 'high';
}

export const FollowUpsSection: React.FC<FollowUpsSectionProps> = ({ activityId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<EditingFollowUp | null>(null);
  const [newFollowUp, setNewFollowUp] = useState<Omit<CreateFollowUpData, 'activity_id'>>({
    follow_up_note: '',
    follow_up_date: '',
    priority: 'medium',
  });

  const {
    followUps,
    isLoading,
    stats,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    isCreating,
    isUpdating,
    isDeleting,
    isOverdue,
  } = useActivityFollowUps(activityId);

  const handleCreateFollowUp = () => {
    if (!activityId || !newFollowUp.follow_up_note || !newFollowUp.follow_up_date) return;
    
    createFollowUp({
      ...newFollowUp,
      activity_id: activityId,
    });
    
    setNewFollowUp({
      follow_up_note: '',
      follow_up_date: '',
      priority: 'medium',
    });
    setShowAddForm(false);
  };

  const handleUpdateFollowUp = (followUpId: string, data: UpdateFollowUpData) => {
    updateFollowUp({ id: followUpId, data });
  };

  const handleToggleComplete = (followUp: ActivityFollowUp) => {
    handleUpdateFollowUp(followUp.id, { is_done: !followUp.is_done });
  };

  const handleStartEdit = (followUp: ActivityFollowUp) => {
    setEditingFollowUp({
      id: followUp.id,
      follow_up_note: followUp.follow_up_note,
      follow_up_date: followUp.follow_up_date,
      priority: followUp.priority,
    });
  };

  const handleSaveEdit = () => {
    if (!editingFollowUp) return;
    
    handleUpdateFollowUp(editingFollowUp.id, {
      follow_up_note: editingFollowUp.follow_up_note,
      follow_up_date: editingFollowUp.follow_up_date,
      priority: editingFollowUp.priority,
    });
    
    setEditingFollowUp(null);
  };

  const handleCancelEdit = () => {
    setEditingFollowUp(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!activityId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Follow-Ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Save the activity first to add follow-ups.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Follow-Ups
            {stats.total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.completed}/{stats.total}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Follow-Up
          </Button>
        </div>
        
        {stats.total > 0 && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              {stats.completed} completed
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stats.pending} pending
            </span>
            {stats.overdue > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                {stats.overdue} overdue
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Follow-Up Form */}
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <h4 className="font-medium">Add New Follow-Up</h4>
            <div className="space-y-3">
              <Textarea
                placeholder="Follow-up note..."
                value={newFollowUp.follow_up_note}
                onChange={(e) => setNewFollowUp(prev => ({ ...prev, follow_up_note: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newFollowUp.follow_up_date}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, follow_up_date: e.target.value }))}
                  className="flex-1"
                />
                <Select
                  value={newFollowUp.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewFollowUp(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateFollowUp}
                  disabled={!newFollowUp.follow_up_note || !newFollowUp.follow_up_date || isCreating}
                  size="sm"
                >
                  {isCreating ? 'Creating...' : 'Create Follow-Up'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Follow-Ups List */}
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading follow-ups...</p>
          </div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No follow-ups yet</p>
            <p className="text-sm">Add your first follow-up to track tasks and progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followUps.map((followUp, index) => (
              <div key={followUp.id}>
                <div className={`border rounded-lg p-4 ${
                  followUp.is_done ? 'bg-green-50' : isOverdue(followUp) ? 'bg-red-50' : 'bg-white'
                }`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={followUp.is_done}
                      onCheckedChange={() => handleToggleComplete(followUp)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      {editingFollowUp?.id === followUp.id ? (
                        // Edit mode
                        <div className="space-y-2">
                          <Textarea
                            value={editingFollowUp.follow_up_note}
                            onChange={(e) => setEditingFollowUp(prev => 
                              prev ? { ...prev, follow_up_note: e.target.value } : null
                            )}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="date"
                              value={editingFollowUp.follow_up_date}
                              onChange={(e) => setEditingFollowUp(prev => 
                                prev ? { ...prev, follow_up_date: e.target.value } : null
                              )}
                              className="flex-1"
                            />
                            <Select
                              value={editingFollowUp.priority}
                              onValueChange={(value: 'low' | 'medium' | 'high') => 
                                setEditingFollowUp(prev => 
                                  prev ? { ...prev, priority: value } : null
                                )
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={isUpdating}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <p className={`${followUp.is_done ? 'line-through text-muted-foreground' : ''}`}>
                            {followUp.follow_up_note}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(followUp.follow_up_date), 'MMM dd, yyyy')}
                            </span>
                            <Badge className={getPriorityColor(followUp.priority)}>
                              {followUp.priority}
                            </Badge>
                            {isOverdue(followUp) && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editingFollowUp?.id !== followUp.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(followUp)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFollowUp(followUp.id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {index < followUps.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
