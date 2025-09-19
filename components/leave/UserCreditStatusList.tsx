import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Download, Edit, Users, Calendar, TrendingUp } from 'lucide-react';
import { useUserCreditManagement } from '@/hooks/useUserCreditManagement';

interface UserCreditStatus {
  id: string;
  full_name: string;
  email: string;
  al_credit: number;
  sl_credit: number;
  bl_credit: number;
  role: string;
  last_updated: string;
}

interface UserCreditStatusListProps {
  className?: string;
}

export const UserCreditStatusList: React.FC<UserCreditStatusListProps> = ({ className = '' }) => {
  const { users, isLoading, updateUserCredit, exportCreditReport } = useUserCreditManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof UserCreditStatus>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<UserCreditStatus | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  const handleSort = (field: keyof UserCreditStatus) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCreditStatusColor = (credit: number, type: 'annual' | 'sick' | 'business') => {
    if (type === 'annual') {
      if (credit <= 0) return 'bg-red-100 text-red-800';
      if (credit <= 5) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    }
    
    // Sick and Business leave are unlimited, so we show different colors
    if (credit < 0) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getTotalBalance = (user: UserCreditStatus) => {
    return user.al_credit + (user.sl_credit || 0) + (user.bl_credit || 0);
  };

  const handleExport = () => {
    exportCreditReport(filteredAndSortedUsers);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Credit Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading user credit data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Credit Status
        </CardTitle>
        <CardDescription>
          Manage leave credits for all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Users</div>
            <div className="text-2xl font-bold text-blue-700">{filteredAndSortedUsers.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total AL Credits</div>
            <div className="text-2xl font-bold text-green-700">
              {filteredAndSortedUsers.reduce((sum, user) => sum + user.al_credit, 0)}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Avg AL per User</div>
            <div className="text-2xl font-bold text-orange-700">
              {filteredAndSortedUsers.length > 0 
                ? Math.round(filteredAndSortedUsers.reduce((sum, user) => sum + user.al_credit, 0) / filteredAndSortedUsers.length)
                : 0}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Low Balance Users</div>
            <div className="text-2xl font-bold text-red-700">
              {filteredAndSortedUsers.filter(user => user.al_credit <= 5).length}
            </div>
          </div>
        </div>

        {/* User Credit Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('full_name')}
                >
                  User {sortField === 'full_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('al_credit')}
                >
                  Annual Leave {sortField === 'al_credit' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('sl_credit')}
                >
                  Sick Leave {sortField === 'sl_credit' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('bl_credit')}
                >
                  Business Leave {sortField === 'bl_credit' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found matching the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.full_name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCreditStatusColor(user.al_credit, 'annual')}>
                        {user.al_credit} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCreditStatusColor(user.sl_credit, 'sick')}>
                        {user.sl_credit} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCreditStatusColor(user.bl_credit, 'business')}>
                        {user.bl_credit} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(user.last_updated), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit User Credits Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Leave Credits</DialogTitle>
              <DialogDescription>
                Update leave credits for {selectedUser?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Annual Leave Credits</label>
                <Input
                  type="number"
                  defaultValue={selectedUser?.al_credit}
                  placeholder="Enter annual leave credits"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sick Leave Credits</label>
                <Input
                  type="number"
                  defaultValue={selectedUser?.sl_credit}
                  placeholder="Enter sick leave credits"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Leave Credits</label>
                <Input
                  type="number"
                  defaultValue={selectedUser?.bl_credit}
                  placeholder="Enter business leave credits"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle update logic here
                setShowEditDialog(false);
              }}>
                Update Credits
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserCreditStatusList;