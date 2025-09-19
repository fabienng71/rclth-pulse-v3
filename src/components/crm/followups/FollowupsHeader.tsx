
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FollowupsStatsCard } from './FollowupsStatsCard';
import { Activity } from '@/hooks/useActivitiesData';

interface FollowupsHeaderProps {
  activities: Activity[];
  currentView: 'table' | 'grid' | 'calendar';
  onViewChange: (view: 'table' | 'grid' | 'calendar') => void;
}

export const FollowupsHeader: React.FC<FollowupsHeaderProps> = ({
  activities,
  currentView,
  onViewChange
}) => {
  const navigate = useNavigate();

  // Calculate statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const overdue = activities.filter(activity => {
    if (!activity.follow_up_date) return false;
    const followUpDate = new Date(activity.follow_up_date);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate < today;
  }).length;

  const dueToday = activities.filter(activity => {
    if (!activity.follow_up_date) return false;
    const followUpDate = new Date(activity.follow_up_date);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate.getTime() === today.getTime();
  }).length;

  const dueThisWeek = activities.filter(activity => {
    if (!activity.follow_up_date) return false;
    const followUpDate = new Date(activity.follow_up_date);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate >= tomorrow && followUpDate < nextWeek;
  }).length;

  const total = activities.length;

  const handleCreateActivity = () => {
    navigate('/crm/activity/new');
  };

  const handleBackToActivities = () => {
    navigate('/crm/activity');
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleBackToActivities}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Activities
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Follow-ups</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={currentView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('table')}
              className="h-8 px-3"
            >
              Table
            </Button>
            <Button
              variant={currentView === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('grid')}
              className="h-8 px-3"
            >
              Cards
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('calendar')}
              className="h-8 px-3"
            >
              Calendar
            </Button>
          </div>
          
          <Button onClick={handleCreateActivity}>
            <Plus className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FollowupsStatsCard
          title="Total Follow-ups"
          value={total}
          description="All pending follow-ups"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <FollowupsStatsCard
          title="Overdue"
          value={overdue}
          description="Require immediate attention"
          variant="overdue"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <FollowupsStatsCard
          title="Due Today"
          value={dueToday}
          description="Should be completed today"
          variant="today"
          icon={<Clock className="h-4 w-4" />}
        />
        <FollowupsStatsCard
          title="This Week"
          value={dueThisWeek}
          description="Due in the next 7 days"
          variant="upcoming"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};
