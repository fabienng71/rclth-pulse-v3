
import { useState } from 'react';
import { Trash2, Edit, ShieldOff, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Profile } from '../../types/supabase';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface UserTableProps {
  users: Profile[];
  isLoading: boolean;
  currentUserId: string | undefined;
  onEditUser: (user: Profile) => void;
  onToggleUserStatus: (user: Profile) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
}

const UserTable = ({ 
  users, 
  isLoading, 
  currentUserId, 
  onEditUser, 
  onToggleUserStatus,
  statusFilter,
  onStatusFilterChange
}: UserTableProps) => {
  // Filter users based on status
  const filteredUsers = users.filter(user => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return user.is_active;
    if (statusFilter === 'inactive') return !user.is_active;
    return true;
  });

  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium mb-2">Filter by status:</h3>
          <ToggleGroup 
            type="single" 
            value={statusFilter}
            onValueChange={(value) => {
              if (value) onStatusFilterChange(value as 'all' | 'active' | 'inactive');
            }}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="active">Active</ToggleGroupItem>
            <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>SPP Code</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((userItem) => (
                <TableRow key={userItem.id} className={!userItem.is_active ? "opacity-60" : ""}>
                  <TableCell>{userItem.full_name}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      userItem.role === 'admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {userItem.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      userItem.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {userItem.is_active ? (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{userItem.spp_code || '-'}</TableCell>
                  <TableCell>
                    {new Date(userItem.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditUser(userItem)}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleUserStatus(userItem)}
                        disabled={userItem.id === currentUserId}
                        title={userItem.is_active ? "Deactivate User" : "Activate User"}
                      >
                        {userItem.is_active ? (
                          <ShieldOff className="h-4 w-4 text-destructive" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default UserTable;
