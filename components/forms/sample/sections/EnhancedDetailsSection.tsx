
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, FileText, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PriorityBadge } from '@/components/crm/followups/PriorityBadge';

interface EnhancedDetailsSectionProps {
  followUpDate?: Date;
  notes: string;
  onDateChange: (date?: Date) => void;
  onNotesChange: (notes: string) => void;
}

const EnhancedDetailsSection = ({
  followUpDate,
  notes,
  onDateChange,
  onNotesChange
}: EnhancedDetailsSectionProps) => {
  const suggestedDates = [
    { label: 'Tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Next Week', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { label: 'In 2 Weeks', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { label: 'Next Month', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  ];
  
  const noteTemplates = [
    "Please prepare samples as discussed",
    "Customer requires urgent delivery",
    "Special packaging requirements",
    "Technical specifications to be confirmed",
    "Price quote needed with samples"
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Additional Details
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Optional information to help process this sample request
        </p>
      </div>
      
      {/* Follow-up Date */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Follow-up Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>When should we follow up on this request?</Label>
            
            {/* Quick Date Options */}
            <div className="flex flex-wrap gap-2">
              {suggestedDates.map((suggestion) => (
                <Button
                  key={suggestion.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDateChange(suggestion.date)}
                  className={cn(
                    "text-xs",
                    followUpDate && 
                    format(followUpDate, 'yyyy-MM-dd') === format(suggestion.date, 'yyyy-MM-dd') &&
                    "border-primary bg-primary/5"
                  )}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
            
            {/* Custom Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !followUpDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {followUpDate ? format(followUpDate, "PPP") : "Pick a custom date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={followUpDate}
                  onSelect={onDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Selected Date Display */}
            {followUpDate && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{format(followUpDate, "EEEE, MMMM do, yyyy")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PriorityBadge followUpDate={followUpDate.toISOString()} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDateChange(undefined)}
                    className="text-xs text-muted-foreground"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Notes & Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="notes">Additional information or special requirements</Label>
            
            {/* Note Templates */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Quick templates:</div>
              <div className="flex flex-wrap gap-2">
                {noteTemplates.map((template, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onNotesChange(notes ? `${notes}\n${template}` : template)}
                    className="h-auto p-2 text-xs text-left justify-start whitespace-normal"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
            
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Enter any additional notes, special requirements, or instructions..."
              className="min-h-[120px] resize-y"
              rows={5}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{notes.length} characters</span>
              <span>This information will be visible to the processing team</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Info Message */}
      <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">Optional Information</p>
          <p className="text-blue-700 mt-1">
            These details help our team process your request more efficiently, but they're not required to proceed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDetailsSection;
