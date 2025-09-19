
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';
import { Activity } from '@/hooks/useActivitiesData';

const localizer = momentLocalizer(moment);

interface ActivityCalendarViewProps {
  activities: Activity[];
  loading: boolean;
  onActivityClick: (id: string) => void;
}

export const ActivityCalendarView: React.FC<ActivityCalendarViewProps> = ({
  activities,
  loading,
  onActivityClick
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const events = activities.map(activity => ({
    id: activity.id,
    title: `${activity.customer_name} - ${activity.activity_type}`,
    start: new Date(activity.activity_date),
    end: new Date(activity.activity_date),
    resource: activity
  }));

  const handleSelectEvent = (event: { id: string; title: string; start: Date; end: Date; resource: Activity }) => {
    onActivityClick(event.id);
  };

  return (
    <div className="h-[600px] bg-background">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day']}
        defaultView="month"
        style={{ height: '100%' }}
      />
    </div>
  );
};
