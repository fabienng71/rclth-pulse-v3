
import Navigation from '../components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ReportCard from '@/components/reports/ReportCard';
import { 
  Users, ShoppingCart, Store, Folders, DollarSign, 
  Truck, BarChart3, Receipt, BarChart2, UserPlus, Shield, CalendarDays, Calendar, TrendingUp, FileBarChart, Crown, UserCheck, Target, MapPin
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const Reports = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuthStore();
  
  // Check if current user is fabien@repertoire.co.th
  const isFabien = user?.email === 'fabien@repertoire.co.th';
  
  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Reports</h1>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports Overview</CardTitle>
              <CardDescription>
                View and analyze your business data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-6" />
              
              {/* Standard Reports Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Standard Reports</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <ReportCard 
                    title="Weekly Report" 
                    description="Weekly sales analysis" 
                    icon={<Calendar className="h-5 w-5" />}
                    onClick={() => navigate('/reports/weekly')}
                    variant="standard"
                    highlighted={true}
                  />
                  
                  <ReportCard 
                    title="Top N Analysis" 
                    description="Top customers by turnover" 
                    icon={<TrendingUp className="h-5 w-5" />}
                    onClick={() => navigate('/reports/top-n')}
                    variant="standard"
                    highlighted={true}
                  />
                  
                  <ReportCard 
                    title="Customers" 
                    description="Customer data" 
                    icon={<Users className="h-5 w-5" />}
                    onClick={() => navigate('/reports/customers')}
                    variant="standard"
                  />
                  
                  <ReportCard 
                    title="Items" 
                    description="Product reporting" 
                    icon={<ShoppingCart className="h-5 w-5" />}
                    onClick={() => navigate('/reports/items')}
                    variant="standard"
                  />
                  
                  
                  <ReportCard 
                    title="Channels" 
                    description="Sales channels" 
                    icon={<Store className="h-5 w-5" />}
                    onClick={() => navigate('/reports/channels')}
                    variant="standard"
                  />
                  
                  <ReportCard 
                    title="Categories" 
                    description="Category metrics" 
                    icon={<Folders className="h-5 w-5" />}
                    onClick={() => navigate('/reports/categories')}
                    variant="standard"
                  />
                  
                  <ReportCard 
                    title="MTD Report" 
                    description="Month-to-date sales" 
                    icon={<CalendarDays className="h-5 w-5" />}
                    onClick={() => navigate('/reports/mtd')}
                    variant="standard"
                    highlighted={true}
                  />
                  
                  <ReportCard 
                    title="Monthly Report" 
                    description="Customer turnover & margins" 
                    icon={<Calendar className="h-5 w-5" />}
                    onClick={() => navigate('/reports/monthly')}
                    variant="standard"
                    highlighted={true}
                  />
                  
                  <ReportCard 
                    title="Sales Analysis" 
                    description="Customer & product churn detection" 
                    icon={<Target className="h-5 w-5" />}
                    onClick={() => navigate('/reports/sales-analysis')}
                    variant="standard"
                    highlighted={true}
                  />
                  
                  <ReportCard 
                    title="Region Report" 
                    description="Regional turnover analysis" 
                    icon={<MapPin className="h-5 w-5" />}
                    onClick={() => navigate('/reports/region')}
                    variant="standard"
                    highlighted={true}
                  />
                </div>
              </div>
              
              {/* Admin Reports Section - Only visible to admins */}
              {isAdmin ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Administration Reports</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <ReportCard 
                      title="Executive Dashboard" 
                      description="Executive business intelligence" 
                      icon={<Crown className="h-5 w-5" />}
                      onClick={() => navigate('/reports/executive')}
                      variant="admin"
                      highlighted={true}
                    />
                    
                    <ReportCard 
                      title="Channel Intelligence" 
                      description="Customer basket & margin analysis" 
                      icon={<TrendingUp className="h-5 w-5" />}
                      onClick={() => navigate('/reports/channel-intelligence')}
                      variant="admin"
                      highlighted={true}
                    />
                    

                    <ReportCard 
                      title="Salesperson Analysis" 
                      description="Detailed salesperson performance" 
                      icon={<UserCheck className="h-5 w-5" />}
                      onClick={() => navigate('/reports/salesperson-analysis')}
                      variant="admin"
                      highlighted={true}
                    />
                    
                    <ReportCard 
                      title="Budget" 
                      description="Budget management" 
                      icon={<BarChart2 className="h-5 w-5" />}
                      onClick={() => navigate('/reports/budget')}
                      variant="admin"
                    />
                    
                    <ReportCard 
                      title="Vendors" 
                      description="Vendor analytics" 
                      icon={<Truck className="h-5 w-5" />}
                      onClick={() => navigate('/reports/vendors')}
                      variant="admin"
                    />
                    
                    <ReportCard 
                      title="COGS" 
                      description="Cost of goods" 
                      icon={<DollarSign className="h-5 w-5" />}
                      onClick={() => navigate('/reports/cogs')}
                      variant="admin"
                    />
                    
                    <ReportCard 
                      title="New Customers" 
                      description="Customer acquisition" 
                      icon={<UserPlus className="h-5 w-5" />}
                      onClick={() => navigate('/reports/new-customers')}
                      variant="admin"
                    />
                    
                    <ReportCard 
                      title="Administration"
                      description="Transportation revenue"
                      icon={<FileBarChart className="h-5 w-5" />}
                      onClick={() => navigate('/reports/administration')}
                      variant="admin"
                    />
                    
                    <ReportCard 
                      title="Margin Analysis"
                      description="Profit margin analytics"
                      icon={<BarChart3 className="h-5 w-5" />}
                      onClick={() => navigate('/reports/margin-analysis')}
                      variant="admin"
                    />
                    
                    {/* Credit Memo Report Card - Only visible to fabien@repertoire.co.th */}
                    {isFabien && (
                      <ReportCard 
                        title="Credit Memos" 
                        description="Credit memo data" 
                        icon={<Receipt className="h-5 w-5" />}
                        onClick={() => navigate('/reports/credit-memos')}
                        variant="admin"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <Alert className="bg-muted/50 border-muted">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <AlertTitle>Administration Reports</AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      Additional reports are available for administrators. Contact your system administrator if you need access to these reports.
                    </AlertDescription>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/profile')}>
                        View Profile Settings
                      </Button>
                    </div>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
