import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, CheckCircle, Star } from 'lucide-react';

const LeaveRequests = () => {
  const navigate = useNavigate();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/forms/leave-management');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-blue-200">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-blue-600 mr-2" />
                <CardTitle className="text-2xl text-blue-800">Leave System Upgraded!</CardTitle>
              </div>
              <CardDescription className="text-base">
                We've upgraded to a new and improved leave management system with enhanced features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800">Enhanced Leave Balance Tracking</h3>
                    <p className="text-sm text-gray-600">View detailed breakdowns of Annual, Sick, and Business leave credits</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">Smart Date Calculation</h3>
                    <p className="text-sm text-gray-600">Automatic business day calculation excluding weekends</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-orange-800">Streamlined Approval Process</h3>
                    <p className="text-sm text-gray-600">Faster approval workflow with real-time notifications</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-3">
                  <strong>Redirecting automatically in 5 seconds...</strong>
                </p>
                <Button 
                  onClick={() => navigate('/forms/leave-management')}
                  className="w-full"
                  size="lg"
                >
                  Go to New Leave Management System
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  All your existing leave requests and balances have been preserved in the new system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LeaveRequests;