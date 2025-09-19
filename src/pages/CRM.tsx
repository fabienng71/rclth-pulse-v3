
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { 
  Activity, 
  Users, 
  UserPlus, 
  FolderKanban, 
  Calendar,
  BarChart3,
  Package,
  Trash2
} from 'lucide-react';

const CRM = () => {
  const crmModules = [
    {
      title: 'Dashboard',
      description: 'Overview of your CRM metrics and activities',
      icon: BarChart3,
      href: '/crm/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: 'Activities',
      description: 'Track customer interactions and follow-ups',
      icon: Activity,
      href: '/crm/activities',
      color: 'bg-green-500'
    },
    {
      title: 'Contacts',
      description: 'Manage your customer contact information',
      icon: Users,
      href: '/crm/contacts',
      color: 'bg-purple-500'
    },
    {
      title: 'Leads',
      description: 'Track and convert potential customers',
      icon: UserPlus,
      href: '/crm/leads',
      color: 'bg-orange-500'
    },
    {
      title: 'Projects',
      description: 'Manage customer projects and initiatives',
      icon: FolderKanban,
      href: '/crm/projects',
      color: 'bg-teal-500'
    },
    {
      title: 'Follow-ups',
      description: 'View upcoming follow-up activities',
      icon: Calendar,
      href: '/crm/activity/followups',
      color: 'bg-indigo-500'
    },
    {
      title: 'Stock on Hand',
      description: 'View current inventory levels',
      icon: Package,
      href: '/crm/stock-on-hand',
      color: 'bg-amber-500'
    },
    {
      title: 'Clearance',
      description: 'Manage clearance items and expiration dates',
      icon: Trash2,
      href: '/crm/clearance',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="app-background">
      <Navigation />
      <div className="bg-background-container border border-border/20 rounded-lg mx-4 my-6">
        <main className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Customer Relationship Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your customer relationships, activities, and sales pipeline
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {crmModules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card key={module.title} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={module.href}>
                        Open {module.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CRM;
