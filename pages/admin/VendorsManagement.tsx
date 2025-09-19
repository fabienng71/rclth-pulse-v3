
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { useVendorsData, type VendorFormData } from '@/hooks/useVendorsData';
import VendorForm from '@/components/admin/vendors/VendorForm';

const VendorsManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { 
    vendors, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    createVendor, 
    updateVendor, 
    deleteVendor,
    isCreating,
    isUpdating,
    isDeleting
  } = useVendorsData();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorFormData | null>(null);

  const [formData, setFormData] = useState<VendorFormData>({
    vendor_code: '',
    vendor_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: '',
    payment_terms: '',
    active: true
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/admin/control-center')} className="mt-4">
              Back to Control Center
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.vendor_code.trim() || !formData.vendor_name.trim()) {
      return;
    }

    createVendor(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData({
          vendor_code: '',
          vendor_name: '',
          contact_email: '',
          contact_phone: '',
          address: '',
          city: '',
          country: '',
          payment_terms: '',
          active: true
        });
      }
    });
  };

  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVendor || !editingVendor.vendor_code.trim() || !editingVendor.vendor_name.trim()) {
      return;
    }

    const { vendor_code, ...updateData } = editingVendor;
    
    updateVendor({ vendorCode: vendor_code, vendorData: updateData }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setEditingVendor(null);
      }
    });
  };

  const handleDeleteVendor = async (vendorCode: string) => {
    deleteVendor(vendorCode);
  };

  const openEditDialog = (vendor: any) => {
    setEditingVendor({
      vendor_code: vendor.vendor_code,
      vendor_name: vendor.vendor_name || '',
      contact_email: vendor.contact_email || '',
      contact_phone: vendor.contact_phone || '',
      address: vendor.address || '',
      city: vendor.city || '',
      country: vendor.country || '',
      payment_terms: vendor.payment_terms || '',
      active: vendor.active !== false
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/admin/control-center')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Control Center
          </Button>
          
          <div className="section-background p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Vendors Management
                  </h1>
                  <p className="text-muted-foreground text-xl mt-2">
                    Manage vendor information, contacts, and business details
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" disabled={isCreating}>
                    <Plus className="h-4 w-4" />
                    Add New Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Vendor</DialogTitle>
                    <DialogDescription>
                      Add a new vendor to the system
                    </DialogDescription>
                  </DialogHeader>
                  <VendorForm 
                    data={formData} 
                    setData={setFormData} 
                    onSubmit={handleCreateVendor}
                    isLoading={isCreating}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vendors Overview</CardTitle>
                <CardDescription>
                  View and manage all vendors in the system
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading vendors...</div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                <p className="text-muted-foreground">No vendor data available in the system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Code</TableHead>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Contact Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.vendor_code}>
                        <TableCell className="font-medium">{vendor.vendor_code}</TableCell>
                        <TableCell>{vendor.vendor_name || '-'}</TableCell>
                        <TableCell>{vendor.contact_email || '-'}</TableCell>
                        <TableCell>{vendor.contact_phone || '-'}</TableCell>
                        <TableCell>{vendor.city || '-'}</TableCell>
                        <TableCell>
                          {vendor.active ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-gray-500">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(vendor)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isDeleting}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{vendor.vendor_code}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteVendor(vendor.vendor_code)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
              <DialogDescription>
                Update vendor information
              </DialogDescription>
            </DialogHeader>
            {editingVendor && (
              <VendorForm 
                data={editingVendor} 
                setData={setEditingVendor} 
                onSubmit={handleEditVendor}
                isEdit={true}
                isLoading={isUpdating}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VendorsManagement;
