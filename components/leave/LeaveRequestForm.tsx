import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { LeaveBalanceCard, LeaveFormFields, useLeaveRequestForm } from './form';

interface LeaveRequestFormProps {
  onSuccess?: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSuccess }) => {
  const {
    form,
    balance,
    isSubmitting,
    calculatedDays,
    isCalculating,
    validationError,
    leaveType,
    onSubmit,
  } = useLeaveRequestForm(onSuccess);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <LeaveBalanceCard balance={balance} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            New Leave Request
          </CardTitle>
          <CardDescription>Submit a new leave request for approval</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveFormFields
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            validationError={validationError}
            calculatedDays={calculatedDays}
            isCalculating={isCalculating}
            leaveType={leaveType}
          />
        </CardContent>
      </Card>
    </div>
  );
};