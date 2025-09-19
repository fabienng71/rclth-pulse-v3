import React from 'react';
import Navigation from '@/components/Navigation';
import { AdminGuard } from '@/components/security/AdminGuard';
import { UserPermissionManagement } from '@/components/admin/UserPermissionManagement';

const UserPermissions: React.FC = () => {
  return (
    <AdminGuard>
      <Navigation />
      <main className="container py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">User Data Permissions</h1>
            <p className="text-muted-foreground">
              Manage granular data visibility permissions for users across reports and analytics.
            </p>
          </div>
          
          <UserPermissionManagement />
        </div>
      </main>
    </AdminGuard>
  );
};

export default UserPermissions;