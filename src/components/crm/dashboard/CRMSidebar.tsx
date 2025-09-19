
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  UserPlus,
  Users,
  FolderKanban,
  Building,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CRMSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Activities',
      icon: Activity,
      href: '/crm/activities'
    },
    {
      title: 'Contacts',
      icon: Users,
      href: '/crm/contacts'
    },
    {
      title: 'Customers',
      icon: Building,
      href: '/crm/customers'
    },
    {
      title: 'Leads',
      icon: UserPlus,
      href: '/crm/leads'
    },
    {
      title: 'Lead Center',
      icon: Target,
      href: '/crm/lead-center'
    },
    {
      title: 'Projects',
      icon: FolderKanban,
      href: '/crm/projects'
    },
  ];

  const isActive = (href: string) => {
    if (href === '/crm') {
      return location.pathname === '/crm';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Card className="h-fit">
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            CRM Navigation
          </h3>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-9 p-3 text-left",
                  active && "bg-primary/10 text-primary"
                )}
                onClick={() => navigate(item.href)}
              >
                <IconComponent className={cn(
                  "h-4 w-4 mr-3 flex-shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="font-medium text-sm">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
