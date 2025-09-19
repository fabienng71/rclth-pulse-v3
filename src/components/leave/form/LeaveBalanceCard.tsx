import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { LeaveBalance } from '@/types/leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance | null;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balance }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Balance
        </CardTitle>
        <CardDescription>Your current available leave credits</CardDescription>
      </CardHeader>
      <CardContent>
        {balance ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Annual Leave</span>
              <Badge className="bg-blue-100 text-blue-800">
                {balance.al_credit || 0} days
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sick Leave</span>
              <Badge className="bg-red-100 text-red-800">
                0 days
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Business Leave</span>
              <Badge className="bg-green-100 text-green-800">
                0 days
              </Badge>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total Balance</span>
                <Badge variant="secondary">
                  {balance.leave_balance || 0} days
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Annual Leave</span>
              <Badge className="bg-blue-100 text-blue-800">0 days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sick Leave</span>
              <Badge className="bg-red-100 text-red-800">0 days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Business Leave</span>
              <Badge className="bg-green-100 text-green-800">0 days</Badge>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total Balance</span>
                <Badge variant="secondary">0 days</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Loading balance...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};