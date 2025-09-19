
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, Archive, Calendar, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const DashboardNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/procurement/shipments')}
            className="h-auto flex-col gap-2 p-6"
          >
            <List className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">All Shipments</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/procurement/incoming-stock')}
            className="h-auto flex-col gap-2 p-6"
          >
            <TrendingUp className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Incoming Stock</div>
            </div>
          </Button>

          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/procurement/forecasts')}
              className="h-auto flex-col gap-2 p-6"
            >
              <BarChart3 className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Forecasts</div>
              </div>
            </Button>
          )}

          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/procurement/sales-forecasts')}
              className="h-auto flex-col gap-2 p-6"
            >
              <FileText className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Sales Forecasts</div>
              </div>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/procurement/shipments?archived=true')}
            className="h-auto flex-col gap-2 p-6"
          >
            <Archive className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Archived Shipments</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/procurement/shipments?filter=this-week')}
            className="h-auto flex-col gap-2 p-6"
          >
            <Calendar className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">This Week</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardNavigation;
