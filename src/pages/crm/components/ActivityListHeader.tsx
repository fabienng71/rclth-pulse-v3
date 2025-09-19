
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewToggle } from '@/components/crm/activities/ViewToggle';

interface ActivityListHeaderProps {
  currentView: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
}

// Legacy component - use EnhancedActivitySearch instead
export const ActivityListHeader = ({ currentView, onViewChange }: ActivityListHeaderProps) => {
  const navigate = useNavigate();

  const handleCreateActivity = useCallback(() => {
    navigate('/crm/activity/new');
  }, [navigate]);

  const handleBackToCrm = useCallback(() => {
    navigate('/crm');
  }, [navigate]);

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={handleBackToCrm}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to CRM
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Activity List</h1>
      </div>
      <div className="flex items-center gap-3">
        <ViewToggle currentView={currentView} onViewChange={onViewChange} />
        <Button onClick={handleCreateActivity}>
          <Plus className="h-4 w-4 mr-2" />
          Create Activity
        </Button>
      </div>
    </div>
  );
};
