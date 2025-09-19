
import { Button } from '@/components/ui/button';
import { Calendar, List, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ViewToggleProps {
  currentView: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex space-x-2">
      <Button
        variant={currentView === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center gap-1 h-9"
      >
        <List className="h-4 w-4" />
        List
      </Button>
      <Button
        variant={currentView === 'calendar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('calendar')}
        className="flex items-center gap-1 h-9"
      >
        <Calendar className="h-4 w-4" />
        Calendar
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => navigate('/crm/activity/followups')}
        className="flex items-center gap-1 h-9 bg-blue-600 hover:bg-blue-700"
      >
        <Bell className="h-4 w-4" />
        Follow ups
      </Button>
    </div>
  );
};
