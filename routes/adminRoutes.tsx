
import React from 'react';
import { Route } from 'react-router-dom';
import Users from '../pages/admin/Users';
import SyncProfiles from '../pages/admin/SyncProfiles';
import ControlCenter from '../pages/admin/ControlCenter';
import ItemsManagement from '../pages/admin/ItemsManagement';
import VendorsManagement from '../pages/admin/VendorsManagement';
import ChecklistTemplatesManagement from '../pages/admin/ChecklistTemplatesManagement';
import SalesTargetsManagement from '../pages/admin/SalesTargetsManagement';
import CogsManagementPage from '../pages/admin/CogsManagementPage';
import UserPermissions from '../pages/admin/UserPermissions';

const AdminRoutes = (
  <>
    <Route path="users" element={<Users />} />
    <Route path="sync" element={<SyncProfiles />} />
    <Route path="control-center" element={<ControlCenter />} />
    <Route path="control-center/items" element={<ItemsManagement />} />
    <Route path="control-center/vendors" element={<VendorsManagement />} />
    <Route path="control-center/sales-targets" element={<SalesTargetsManagement />} />
    <Route path="control-center/checklist-templates" element={<ChecklistTemplatesManagement />} />
    <Route path="control-center/cogs" element={<CogsManagementPage />} />
    <Route path="user-permissions" element={<UserPermissions />} />
  </>
);

export default AdminRoutes;
