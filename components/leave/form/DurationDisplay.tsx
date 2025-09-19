import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LeaveType } from '@/types/leave';

interface DurationDisplayProps {
  calculatedDays: number | null;
  isCalculating: boolean;
  validationError: string | null;
  leaveType: LeaveType;
}

export const DurationDisplay: React.FC<DurationDisplayProps> = ({
  calculatedDays,
  isCalculating,
  validationError,
  leaveType,
}) => {
  if (calculatedDays === null && !isCalculating) {
    return null;
  }

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Duration</span>
      </div>
      {isCalculating ? (
        <p className="text-sm text-muted-foreground">Calculating...</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">{calculatedDays}</span> business days
          </p>
          {validationError ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{validationError}</span>
            </div>
          ) : calculatedDays && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                {leaveType === 'Annual' 
                  ? 'Sufficient balance available' 
                  : 'Request ready to submit (unlimited leave type)'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};