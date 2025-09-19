
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Navigation from '../../components/Navigation';
import UserTable from '../../components/admin/UserTable';
import { EditUserDialog } from '../../components/admin/EditUserDialog';
import ToggleUserStatusDialog from '../../components/admin/ToggleUserStatusDialog';
import CreateUserDialog from '../../components/admin/CreateUserDialog';
import { useUserManagement } from '../../hooks/admin/useUserManagement';
import AdminGuard from '../../components/security/AdminGuard';

const Users = () => {
  const { user } = useAuthStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const {
    users,
    isLoading,
    selectedUser,
    editDialogOpen,
    setEditDialogOpen,
    statusDialogOpen,
    setStatusDialogOpen,
    statusFilter,
    setStatusFilter,
    handleEditUser,
    handleToggleUserStatus,
    saveUserChanges,
    confirmToggleUserStatus,
    fetchUsers,
    isSubmitting
  } = useUserManagement();

  return (
    <AdminGuard>
      <Navigation />
      
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">User Management</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable 
              users={users}
              isLoading={isLoading}
              currentUserId={user?.id}
              onEditUser={handleEditUser}
              onToggleUserStatus={handleToggleUserStatus}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </CardContent>
        </Card>
      </main>

      {/* Create User Dialog */}
      <CreateUserDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUserCreated={fetchUsers}
      />

      {/* Edit User Dialog */}
      <EditUserDialog 
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={saveUserChanges}
        isSubmitting={isSubmitting}
      />

      {/* Toggle User Status Dialog */}
      <ToggleUserStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        selectedUser={selectedUser}
        onConfirmToggle={() => confirmToggleUserStatus(user?.id)}
      />
    </AdminGuard>
  );
};

export default Users;
