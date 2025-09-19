
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, List, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityListHeaderProps {
  currentView: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
  totalActivities: number;
  todaysActivities: number;
  overdueFollowUps: number;
}

export const ActivityListHeader = ({ 
  currentView, 
  onViewChange, 
  totalActivities,
  todaysActivities,
  overdueFollowUps 
}: ActivityListHeaderProps) => {
  const navigate = useNavigate();

  const handleCreateActivity = useCallback(() => {
    navigate('/crm/activity/new');
  }, [navigate]);

  const handleBackToCrm = useCallback(() => {
    navigate('/crm');
  }, [navigate]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb and Main Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground" 
            onClick={handleBackToCrm}
          >
            <ChevronLeft className="h-4 w-4" />
            CRM Dashboard
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Activities
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={currentView === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('calendar')}
              className="h-8 px-3"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
          
          <Button onClick={handleCreateActivity} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Activity
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">{totalActivities}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Activities</p>
                <p className="text-2xl font-bold text-green-600">{todaysActivities}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Follow-ups</p>
                <p className="text-2xl font-bold text-orange-600">{overdueFollowUps}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
