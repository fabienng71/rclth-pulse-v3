
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Activity,
  FileText,
  Package,
  ArrowCounterClockwise,
  UserPlus,
  AddressBook,
  Buildings,
  TagSimple
} from 'phosphor-react';

export const CRMQuickActionsBar = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'New Activity',
      icon: Activity,
      href: '/crm/activity/new'
    },
    {
      title: 'New Quotation',
      icon: FileText,
      href: '/quotations/new'
    },
    {
      title: 'New Sample Request',
      icon: Package,
      href: '/forms/sample/create'
    },
    {
      title: 'New Return Request',
      icon: ArrowCounterClockwise,
      href: '/forms/return'
    },
    {
      title: 'New Lead',
      icon: UserPlus,
      href: '/crm/leads/create'
    },
    {
      title: 'New Contact',
      icon: AddressBook,
      href: '/crm/contacts/create'
    },
    {
      title: 'Stock on Hand',
      icon: Buildings,
      href: '/crm/stock-on-hand'
    },
    {
      title: 'Clearance',
      icon: TagSimple,
      href: '/crm/clearance'
    }
  ];

  return (
    <Card variant="enhanced" className="section-background">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Tooltip key={action.title}>
                  <TooltipTrigger asChild>
                    <Card 
                      className="w-full h-20 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-border/50 group"
                      onClick={() => navigate(action.href)}
                    >
                      <CardContent className="p-2 h-full flex flex-col items-center justify-center text-center">
                        <div className="p-2 rounded-lg bg-muted mb-1 group-hover:bg-muted-foreground/10 transition-colors duration-200">
                          <IconComponent className="h-5 w-5 text-black group-hover:text-gray-700 transition-colors duration-200" weight="bold" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 leading-tight">
                          {action.title}
                        </span>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

