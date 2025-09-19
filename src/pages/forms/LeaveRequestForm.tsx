import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { subDays, addDays, isWeekend, formatISO } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerField } from '@/components/crm/DatePickerField';
import { toast } from '@/hooks/use-toast';
import { LeaveRequest } from '@/types/leave';
import { useLeaveApproval } from '@/hooks/useLeaveApproval';
import { ChevronLeft } from 'lucide-react';

const leaveTypes = ["Annual Leave", "Sick Leave", "Business Leave", "Unpaid Leave"] as const;

const leaveRequestSchema = z.object({
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  leave_type: z.enum(leaveTypes, { required_error: "Leave type is required." }),
  length: z.number().min(1, "Length must be at least 1 day."),
  reason: z.string().optional(),
}).refine(data => data.end_date >= data.start_date, {
  message: "End date cannot be before start date.",
  path: ["end_date"],
});

type LeaveFormValues = z.infer<typeof leaveRequestSchema>;

const defaultValues: Partial<LeaveFormValues> = {
  start_date: undefined,
  end_date: undefined,
  leave_type: undefined,
  length: 0,
  reason: '',
};

const leaveTypeMap = {
  "Annual Leave": "AL",
  "Sick Leave": "SL", 
  "Business Leave": "BL",
  "Unpaid Leave": "Unpaid Leave"
};

const leaveTypeCodeToName = {
  "AL": "Annual Leave",
  "BL": "Business Leave",
  "SL": "Sick Leave",
  "Unpaid Leave": "Unpaid Leave"
};

const countWorkingDays = (startDate: Date, endDate: Date, holidays: string[]) => {
  let count = 0;
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const isoDate = formatISO(currentDate, { representation: 'date' });
    if (
      !isWeekend(currentDate) &&
      !holidays.includes(isoDate)
    ) {
      count++;
    }
    currentDate = addDays(currentDate, 1);
  }
  return count;
};

const LeaveRequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [publicHolidays, setPublicHolidays] = useState<string[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [userFullName, setUserFullName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [leaveId, setLeaveId] = useState<string | null>(null);
  const [approvedRows, setApprovedRows] = useState<Record<string, boolean>>({});
  const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({});

  const { handleApproveAndUpdateCredits, handleUnapprove, handleReject } = useLeaveApproval(
    setApprovedRows,
    setApprovingIds,
    () => {}
  );

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    const leaveToEdit = location.state?.leaveToEdit as LeaveRequest | undefined;
    if (leaveToEdit) {
      setIsEditMode(true);
      setLeaveId(leaveToEdit.id);
      
      form.reset({
        start_date: new Date(leaveToEdit.start_date),
        end_date: new Date(leaveToEdit.end_date),
        leave_type: leaveTypeCodeToName[leaveToEdit.leave_type] as any,
        length: leaveToEdit.length,
        reason: leaveToEdit.reason || '',
      });
    }
  }, [location.state, form]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        setUserFullName('');
        setUserId('');
        return;
      }
      setUserId(authData.user.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authData.user.id)
        .maybeSingle();
      if (error) {
        setUserFullName('');
      } else {
        setUserFullName(profile?.full_name ?? '');
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      const { data, error } = await supabase
        .from('public_holidays')
        .select('holiday_date');
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load public holidays',
          description: error.message,
        });
      } else if (data) {
        const holidaysStr = data.map(h => {
          const d = new Date(h.holiday_date);
          return formatISO(d, { representation: 'date' });
        });
        setPublicHolidays(holidaysStr);
      }
      setLoadingHolidays(false);
    };
    fetchHolidays();
  }, []);

  const watchedStartDate = form.watch('start_date');
  const watchedEndDate = form.watch('end_date');

  useEffect(() => {
    if (watchedStartDate && watchedEndDate && watchedEndDate >= watchedStartDate && publicHolidays.length > 0) {
      const length = countWorkingDays(watchedStartDate, watchedEndDate, publicHolidays);
      form.setValue('length', length);
    } else {
      form.setValue('length', 0);
    }
  }, [watchedStartDate, watchedEndDate, publicHolidays, form]);

  const onSubmit = async (data: LeaveFormValues) => {
    const formattedData: any = {
      user_id: userId,
      start_date: formatISO(data.start_date),
      end_date: formatISO(data.end_date),
      leave_type: leaveTypeMap[data.leave_type],
      length: data.length,
      reason: data.reason,
      full_name: userFullName,
    };

    let error;

    if (isEditMode && leaveId) {
      const { error: updateError } = await supabase
        .from('leaves')
        .update(formattedData)
        .eq('id', leaveId);
      
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('leaves')
        .insert(formattedData);
      
      error = insertError;
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: `Failed to ${isEditMode ? 'update' : 'submit'} leave request`,
        description: error.message,
      });
    } else {
      toast({
        title: `Leave request ${isEditMode ? 'updated' : 'submitted'} successfully`,
      });
      navigate('/forms/leave');
    }
  };

  const handleGoBack = () => {
    navigate('/forms');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-10 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <Button 
              variant="outline" 
              size="icon" 
              className="mb-2 self-start" 
              onClick={handleGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{isEditMode ? 'Edit Leave Request' : 'Leave Request Form'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Update your leave request details' 
                : 'Apply for leave by submitting this form'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="mb-2">
                  <FormLabel>User</FormLabel>
                  <input
                    type="text"
                    value={userFullName}
                    readOnly
                    className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                  />
                </div>

                <DatePickerField
                  label="Start Date"
                  control={form.control}
                  name="start_date"
                />

                <DatePickerField
                  label="End Date"
                  control={form.control}
                  name="end_date"
                />

                <FormField
                  control={form.control}
                  name="leave_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Leave</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                            <SelectItem value="Business Leave">Business Leave</SelectItem>
                            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                            <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (working days)</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          readOnly
                          {...field}
                          className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your reason for leave"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loadingHolidays}>
                  {loadingHolidays ? 'Loading...' : isEditMode ? 'Update Leave Request' : 'Submit Leave Request'}
                </Button>

                {isEditMode && (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => handleApproveAndUpdateCredits(location.state.leaveToEdit)}
                      disabled={approvingIds[leaveId ?? '']}
                    >
                      {approvingIds[leaveId ?? ''] ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      variant="destructive"
                      onClick={() => handleUnapprove(location.state.leaveToEdit)}
                      disabled={approvingIds[leaveId ?? '']}
                    >
                      {approvingIds[leaveId ?? ''] ? 'Unapproving...' : 'Unapprove'}
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      variant="secondary"
                      onClick={() => handleReject(location.state.leaveToEdit)}
                      disabled={approvingIds[leaveId ?? '']}
                    >
                      {approvingIds[leaveId ?? ''] ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
