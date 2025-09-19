
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  Package,
  Phone,
  Mail,
  Target
} from 'lucide-react';

export const CRMQuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'New Activity',
      icon: Plus,
      href: '/crm/activity/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Add Contact',
      icon: Users,
      href: '/crm/contacts/create',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'New Lead',
      icon: UserPlus,
      href: '/crm/leads/create',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Schedule Follow-up',
      icon: Calendar,
      href: '/crm/activity/new?type=follow-up',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Create Project',
      icon: Target,
      href: '/crm/projects/create',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      title: 'Sample Request',
      icon: Package,
      href: '/forms/sample',
      color: 'bg-amber-500 hover:bg-amber-600'
    }
  ];

  const communicationActions = [
    {
      title: 'Make Call',
      icon: Phone,
      action: () => console.log('Starting call...'),
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Send Email',
      icon: Mail,
      action: () => console.log('Opening email...'),
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      title: 'View Reports',
      icon: FileText,
      action: () => navigate('/reports'),
      color: 'bg-slate-500 hover:bg-slate-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common CRM tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center space-y-1 text-center hover:shadow-md transition-all"
                  onClick={() => navigate(action.href)}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-medium text-sm">{action.title}</div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Communication Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Hub</CardTitle>
          <CardDescription>
            Connect with customers quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {communicationActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center space-y-1 text-center hover:shadow-md transition-all"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-medium text-sm">{action.title}</div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
