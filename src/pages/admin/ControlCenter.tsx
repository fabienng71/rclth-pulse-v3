import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Truck, 
  CheckSquare,
  Target,
  BarChart3, 
  Settings, 
  Database,
  ArrowRight,
  ExternalLink,
  FileText,
  DollarSign,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import AdminGuard from '@/components/security/AdminGuard';

const ControlCenter = () => {
  const navigate = useNavigate();

  const managementCards = [
    {
      title: 'Items Management',
      description: 'Manage inventory items, pricing, and product information',
      icon: Package,
      path: '/admin/control-center/items',
      color: 'bg-blue-500'
    },
    {
      title: 'Vendors Management',
      description: 'Manage vendor information and supplier relationships',
      icon: Truck,
      path: '/admin/control-center/vendors',
      color: 'bg-purple-500'
    },
    {
      title: 'Sales Targets',
      description: 'Set and manage monthly sales targets for salespersons',
      icon: Target,
      path: '/admin/control-center/sales-targets',
      color: 'bg-green-500'
    },
    {
      title: 'Checklist Templates',
      description: 'Manage and customize checklist templates for shipments and processes',
      icon: CheckSquare,
      path: '/admin/control-center/checklist-templates',
      color: 'bg-orange-500'
    },
    {
      title: 'COGS Management',
      description: 'Monitor and manage Cost of Goods Sold data synchronization',
      icon: DollarSign,
      path: '/admin/control-center/cogs',
      color: 'bg-emerald-500'
    }
  ];

  const systemCards = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'bg-indigo-500'
    },
    {
      title: 'User Data Permissions',
      description: 'Control granular data visibility for users across reports and analytics',
      icon: Shield,
      path: '/admin/user-permissions',
      color: 'bg-purple-600'
    },
    {
      title: 'Sync Logs',
      description: 'View history of data synchronization operations',
      icon: FileText,
      path: '/admin/sync-logs',
      color: 'bg-cyan-500'
    },
    {
      title: 'RCL Vision',
      description: 'Access the RCL Vision external platform',
      icon: ExternalLink,
      path: 'https://rcl-vision.lovable.app/',
      color: 'bg-blue-500',
      external: true
    },
    {
      title: 'Analytics & Reports',
      description: 'System analytics and performance reports',
      icon: BarChart3,
      path: '#',
      color: 'bg-orange-500',
      disabled: true
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      path: '#',
      color: 'bg-gray-500',
      disabled: true
    },
    {
      title: 'Database Sync',
      description: 'Synchronize profiles and manage data integrity',
      icon: Database,
      path: '/admin/sync',
      color: 'bg-teal-500'
    }
  ];

  const handleCardClick = (card: any) => {
    if (card.disabled) return;
    
    if (card.external) {
      window.open(card.path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(card.path);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Admin Control Center
            </h1>
            <p className="text-xl text-muted-foreground">
              Centralized management hub for system administration
            </p>
          </div>

          <div className="space-y-8">
            {/* Data Management Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Data Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementCards.map((card) => (
                  <Card 
                    key={card.title} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(card.path)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.color} text-white`}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{card.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {card.description}
                      </CardDescription>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between group"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(card.path);
                        }}
                      >
                        Manage
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* System Administration Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6" />
                System Administration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemCards.map((card) => (
                  <Card 
                    key={card.title} 
                    className={`hover:shadow-lg transition-shadow ${card.disabled ? 'opacity-50' : 'cursor-pointer'}`}
                    onClick={() => handleCardClick(card)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.color} text-white`}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {card.title}
                            {card.external && <ExternalLink className="h-4 w-4" />}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {card.description}
                      </CardDescription>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between group"
                        disabled={card.disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(card);
                        }}
                      >
                        {card.disabled ? 'Coming Soon' : card.external ? 'Open' : 'Access'}
                        {!card.disabled && (
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default ControlCenter;