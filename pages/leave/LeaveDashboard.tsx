import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Users, BarChart3, Filter } from 'lucide-react';
import { LeaveRequestForm } from '@/components/leave/LeaveRequestForm';
import { LeaveRequestsTable } from '@/components/leave/LeaveRequestsTable';
import { NotificationPreferences } from '@/components/leave/NotificationPreferences';
import LeaveCalendar from '@/components/leave/LeaveCalendar';
import UserCreditStatusList from '@/components/leave/UserCreditStatusList';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuthStore } from '@/stores/authStore';
import '@/utils/leaveDebug'; // Import debug utilities

export default function LeaveDashboard() {
  const { requests, balance, stats, publicHolidays, isLoading } = useLeaveManagement();
  const { role } = useUserRole();
  const { user, userId } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Refresh data when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Trigger a data refresh when switching to any tab
    window.dispatchEvent(new CustomEvent('refreshLeaveData'));
  };

  const isManager = role === 'admin' || role === 'manager';

  // Create user colors map for calendar
  const userColors = useMemo(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    const colorMap = new Map<string, string>();
    
    requests.forEach((request, index) => {
      if (request.user_id && !colorMap.has(request.user_id)) {
        colorMap.set(request.user_id, colors[index % colors.length]);
      }
    });
    
    return colorMap;
  }, [requests]);

  // Helper function to get full leave name
  const getFullLeaveName = (leaveType: string) => {
    switch (leaveType) {
      case 'Annual':
        return 'Annual Leave';
      case 'Sick Leave':
        return 'Sick Leave';
      case 'Business Leave':
        return 'Business Leave';
      default:
        return leaveType;
    }
  };

  // Debug logging
  console.log('=== DASHBOARD DEBUG ===');
  console.log('Total requests:', requests.length);
  console.log('User ID:', userId);
  console.log('User role:', role);
  console.log('Is manager:', isManager);
  console.log('All requests:', requests);

  // Filter requests based on user role
  const userRequests = requests.filter(req => req.user_id === userId);
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  
  console.log('User requests:', userRequests.length);
  console.log('Pending requests:', pendingRequests.length);
  console.log('========================')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leave management...</p>
              <p className="text-xs text-muted-foreground mt-2">
                If this takes more than 10 seconds, check the browser console and run: debugLeaveSystem()
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Leave Management</h1>
            <p className="text-muted-foreground">
              {isManager ? 'Manage team leave requests and balances' : 'View and submit your leave requests'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">
              {isManager ? 'All Requests' : 'My Requests'}
            </TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {isManager && <TabsTrigger value="manage">Manage</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leave Balance</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balance?.leave_balance || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    days remaining
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isManager ? pendingRequests.length : userRequests.filter(r => r.status === 'Pending').length}</div>
                  <p className="text-xs text-muted-foreground">
                    awaiting approval
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved This Year</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isManager ? (stats?.approved_requests || 0) : userRequests.filter(r => r.status === 'Approved').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    total approved
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Days Used</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isManager ? (stats?.total_days_approved || 0) : userRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.duration_days, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    total days
                  </p>
                </CardContent>
              </Card>
            </div>


            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>
                  {isManager ? 'Latest leave requests from your team' : 'Your recent leave requests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(isManager ? requests : userRequests).slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isManager ? request.user_profile?.full_name : request.leave_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{request.duration_days} days</p>
                        <p className="text-xs text-muted-foreground">{request.leave_type}</p>
                      </div>
                    </div>
                  ))}
                  {(isManager ? requests : userRequests).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No leave requests found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <LeaveCalendar
              leaves={requests}
              publicHolidays={publicHolidays}
              userColors={userColors}
              getFullLeaveName={getFullLeaveName}
            />
          </TabsContent>

          <TabsContent value="requests">
            <LeaveRequestsTable
              requests={isManager ? requests : userRequests}
              showActions={isManager}
              title={isManager ? 'All Leave Requests' : 'My Leave Requests'}
              description={isManager ? 'View and manage all team leave requests' : 'View your leave request history'}
            />
          </TabsContent>

          <TabsContent value="new-request">
            <LeaveRequestForm onSuccess={() => {
              console.log('🔄 Leave request submitted successfully, switching to requests tab');
              setActiveTab('requests');
              // Force refresh all data
              window.dispatchEvent(new CustomEvent('refreshLeaveData'));
            }} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPreferences />
          </TabsContent>

          {isManager && (
            <TabsContent value="manage">
              <UserCreditStatusList />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}