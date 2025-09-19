
import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LeaveRequest } from '@/types/leave';

interface LeaveCalendarProps {
  leaves: LeaveRequest[];
  publicHolidays: any[];
  userColors: Map<string, string>;
  getFullLeaveName: (leaveType: string) => string;
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
  leaves,
  publicHolidays,
  userColors,
  getFullLeaveName
}) => {
  // Additional filter to ensure only valid leave entries are displayed
  const validLeaves = useMemo(() => 
    leaves.filter(leave => 
      leave.id && 
      leave.start_date && 
      leave.end_date && 
      leave.leave_type
    ), [leaves]);

  const allEvents = useMemo(() => [
    ...validLeaves.map(leave => {
      const userColor = leave.user_id ? userColors.get(leave.user_id) : '#e5e5e5';
      
      // For end date, add one day as FullCalendar treats end dates as exclusive
      const endDate = new Date(leave.end_date);
      endDate.setDate(endDate.getDate() + 1);
      
      const isApproved = leave.status === 'Approved';
      const userName = leave.user_profile?.full_name || 'Unknown User';
      
      return {
        id: leave.id,
        title: `${getFullLeaveName(leave.leave_type)} - ${userName}`,
        start: leave.start_date,
        end: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        borderColor: 'transparent',
        backgroundColor: isApproved ? userColor : '#e5e5e5',
        className: isApproved ? 'approved-leave' : 'unapproved-leave',
        textColor: isApproved ? 'white' : '#666',
        display: 'block',
      };
    }),
    ...publicHolidays.map(holiday => ({
      title: holiday.description,
      start: holiday.holiday_date,
      backgroundColor: '#DC2626',
      borderColor: 'transparent',
      className: 'holiday',
      allDay: true
    }))
  ], [validLeaves, publicHolidays, userColors, getFullLeaveName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Calendar</CardTitle>
        <CardDescription>View your leave schedule and public holidays</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Calendar Legend */}
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-sm">Approved Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded border-2 border-dashed border-gray-400"></div>
            <span className="text-sm">Pending Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm">Public Holiday</span>
          </div>
        </div>
        <div className="rounded-md border w-full max-w-full mx-auto">
          <style>
            {`
              /* Base styles for all leave events */
              .fc-event {
                font-size: 0.75rem;
              }
              
              /* Specific styles for unapproved leaves */
              .fc-event.unapproved-leave {
                background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(200, 200, 200, 0.5) 5px, rgba(200, 200, 200, 0.5) 10px) !important;
                font-style: italic !important;
              }
              
              .fc-event.unapproved-leave .fc-event-main {
                font-style: italic !important;
                opacity: 0.8 !important;
              }
              
              .fc-event.unapproved-leave .fc-event-title {
                font-style: italic !important;
              }
              
              /* Override FullCalendar's default event styling */
              .fc .fc-daygrid-event {
                white-space: nowrap;
                border-radius: 3px;
                font-size: 0.75rem;
                line-height: 1.3;
                margin-bottom: 1px;
              }
            `}
          </style>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            buttonText={{
              today: 'Today'
            }}
            firstDay={1}
            dayMaxEvents={true}
            events={allEvents}
            eventDidMount={(info) => {
              if (info.event.classNames.includes('unapproved-leave')) {
                info.el.style.fontStyle = 'italic';
                info.el.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(200, 200, 200, 0.5) 5px, rgba(200, 200, 200, 0.5) 10px)';
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveCalendar;
