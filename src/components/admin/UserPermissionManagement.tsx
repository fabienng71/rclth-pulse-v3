import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  User, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  Filter,
  MoreVertical,
  Save,
  RotateCcw
} from 'lucide-react';

import { 
  useUserPermissionsSummary, 
  useUserPermissions, 
  usePermissionManagement 
} from '@/hooks/usePermissionManagement';
import { 
  PERMISSION_GROUPS, 
  PERMISSION_LABELS, 
  PERMISSION_DESCRIPTIONS,
  PermissionCategory,
  UserPermissionSummary,
  getPermissionSummary
} from '@/types/permissions';

export const UserPermissionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPermissionSummary | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { 
    data: users = [], 
    isLoading: isLoadingUsers, 
    error: usersError 
  } = useUserPermissionsSummary();

  const {
    data: userPermissions = [],
    isLoading: isLoadingPermissions
  } = useUserPermissions(selectedUser?.user_id || '');

  const { 
    updatePermission, 
    bulkUpdatePermissions, 
    isUpdating 
  } = usePermissionManagement();

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user: UserPermissionSummary) => {
    setSelectedUser(user);
    setAdminNotes('');
    setIsSheetOpen(true);
  };

  const handlePermissionToggle = async (permission: PermissionCategory, granted: boolean) => {
    if (!selectedUser) return;
    
    await updatePermission(
      selectedUser.user_id,
      permission,
      granted,
      adminNotes || undefined
    );
  };

  const handleBulkUpdate = async (permissions: Array<{ permission: PermissionCategory; granted: boolean }>) => {
    if (!selectedUser) return;
    
    await bulkUpdatePermissions(
      selectedUser.user_id,
      permissions,
      adminNotes || undefined
    );
  };

  const grantAllPermissions = () => {
    const allPermissions = Object.keys(PERMISSION_LABELS).map(permission => ({
      permission: permission as PermissionCategory,
      granted: true
    }));
    handleBulkUpdate(allPermissions);
  };

  const revokeAllPermissions = () => {
    const allPermissions = Object.keys(PERMISSION_LABELS).map(permission => ({
      permission: permission as PermissionCategory,
      granted: false
    }));
    handleBulkUpdate(allPermissions);
  };

  // Convert permissions array to map for easier lookup
  const userPermissionMap = userPermissions.reduce((acc, perm) => {
    acc[perm.permission_category] = perm.is_granted;
    return acc;
  }, {} as Record<PermissionCategory, boolean>);

  const permissionSummary = getPermissionSummary(userPermissionMap);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Data Permissions Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        {isLoadingUsers ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            Loading users...
          </div>
        ) : usersError ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">Failed to load users</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {usersError.message.includes('Access denied') 
                  ? 'You need admin permissions to manage user data permissions.'
                  : usersError.message.includes('User not authenticated')
                  ? 'Please make sure you are logged in as an admin user.'
                  : `Error: ${usersError.message}`
                }
              </p>
              {usersError.message.includes('Access denied') || usersError.message.includes('User not authenticated') ? (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    Go to Login
                  </Button>
                </div>
              ) : (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Permissions</TableHead>
                  <TableHead className="text-center">Last Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const permissionPercentage = user.total_permissions > 0 
                    ? Math.round((user.granted_permissions / user.total_permissions) * 100)
                    : 0;

                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm">
                            {user.granted_permissions}/{user.total_permissions}
                          </span>
                          <Badge 
                            variant={permissionPercentage > 50 ? 'default' : 'secondary'}
                            className="px-2"
                          >
                            {permissionPercentage}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {user.last_permission_update 
                          ? new Date(user.last_permission_update).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <Sheet open={isSheetOpen && selectedUser?.user_id === user.user_id} onOpenChange={setIsSheetOpen}>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserSelect(user)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Permission Management Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent 
            className="overflow-y-auto"
            style={{ width: 'min(800px, 90vw)', maxWidth: '90vw' }}
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Manage Permissions
              </SheetTitle>
              <SheetDescription>
                {selectedUser && (
                  <div className="space-y-2">
                    <div>
                      <strong>{selectedUser.full_name || 'Unknown User'}</strong>
                    </div>
                    <div className="text-sm">{selectedUser.email}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                        {selectedUser.role || 'user'}
                      </Badge>
                      <span className="text-xs">
                        {permissionSummary.granted} of {permissionSummary.total} permissions granted
                      </span>
                    </div>
                  </div>
                )}
              </SheetDescription>
            </SheetHeader>

            {selectedUser && (
              <div className="space-y-6 py-6">
                {/* Quick Actions */}
                <div className="space-y-4">
                  <Label>Quick Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={grantAllPermissions}
                      disabled={isUpdating}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Grant All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={revokeAllPermissions}
                      disabled={isUpdating}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revoke All
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add notes about permission changes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Permission Groups */}
                <Tabs defaultValue="financial" className="w-full">
                  <TabsList className="flex flex-wrap w-full h-auto p-1 bg-muted">
                    {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
                      <TabsTrigger 
                        key={key} 
                        value={key} 
                        className="flex-1 min-w-[120px] text-xs py-2 px-3 m-0.5 h-auto leading-tight whitespace-nowrap"
                      >
                        {group.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                    <TabsContent key={groupKey} value={groupKey} className="space-y-4">
                      <div className="space-y-4">
                        {group.permissions.map((permission) => (
                          <div key={permission} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">
                                  {PERMISSION_LABELS[permission]}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {PERMISSION_DESCRIPTIONS[permission]}
                                </p>
                              </div>
                              <Switch
                                checked={userPermissionMap[permission] || false}
                                onCheckedChange={(checked) => handlePermissionToggle(permission, checked)}
                                disabled={isUpdating || isLoadingPermissions}
                              />
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {isUpdating && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Updating permissions...</p>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};