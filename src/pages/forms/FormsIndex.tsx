
import React from 'react';
import Navigation from '@/components/Navigation';
import FormCard from '@/components/forms/FormCard';
import { FileText, FilePlus2, UserPlus, Users } from 'lucide-react';

const FormsIndex = () => {
  // Data structure for form types
  const formTypes = [
    {
      id: 'sample',
      title: 'Sample Requests',
      description: 'Create and manage sample requests for customers',
      viewPath: '/forms/sample',
      createPath: '/forms/sample/create',
      viewLabel: 'View Sample Requests',
      createLabel: 'Create Sample Request',
      isPrimary: true,
    },
    {
      id: 'return',
      title: 'Return Requests',
      description: 'Process product returns and manage return requests',
      viewPath: '/forms/return',
      createPath: '/forms/return/submit',
      viewLabel: 'View Return Requests',
      createLabel: 'Create Return Request',
      isPrimary: true,
    },
    {
      id: 'leave',
      title: 'Leave Requests',
      description: 'Apply for leave and manage leave requests',
      viewPath: '/forms/leave-management',
      createPath: '/forms/leave-management?tab=new-request',
      viewLabel: 'View Leave Requests',
      createLabel: 'Create Leave Request',
      isPrimary: false,
      isLeaveBlue: true, // Custom flag for blue styling
    },
    {
      id: 'customer',
      title: 'Customer Maintenance',
      description: 'Request creation or modification of customer records',
      viewPath: '/forms/customer',
      createPath: '/forms/customer/create',
      viewLabel: 'View Customer Requests',
      createLabel: 'New Customer Request',
      isPrimary: true,
      isCustomer: true, // Custom flag for green styling
    },
    {
      id: 'writeoff',
      title: 'Write-off Requests',
      description: 'Submit write-off requests for damaged or obsolete inventory',
      viewPath: '/forms/writeoff',
      createPath: '/forms/writeoff/create',
      viewLabel: 'View Write-off Requests',
      createLabel: 'Create Write-off Request',
      isPrimary: true,
    },
    {
      id: 'adjustment',
      title: 'Adjustment Requests',
      description: 'Submit inventory adjustments for stock corrections and updates',
      viewPath: '/forms/adjustment',
      createPath: '/forms/adjustment/create',
      viewLabel: 'View Adjustment Requests',
      createLabel: 'Create Adjustment Request',
      isPrimary: true,
    },
  ];

  return (
    <div className="app-background">
      <Navigation />
      <div className="bg-background-container border border-border/20 rounded-lg mx-4 my-6">
        <div className="container py-10">
          <div className="mb-6">
            <h1 className="text-4xl font-bold">Forms</h1>
            <p className="text-muted-foreground text-xl">Manage various request forms</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formTypes.map((form) => (
              <FormCard
                key={form.id}
                title={form.title}
                description={form.description}
                viewPath={form.viewPath}
                createPath={form.createPath}
                isPrimary={form.isPrimary}
                viewLabel={form.viewLabel}
                createLabel={form.createLabel}
                ViewIcon={form.id === 'customer' ? Users : FileText}
                CreateIcon={form.id === 'customer' ? UserPlus : FilePlus2}
                isLeaveBlue={form.isLeaveBlue}
                isCustomer={form.isCustomer}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormsIndex;
