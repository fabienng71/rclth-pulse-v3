import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { 
  PermissionCategory, 
  PermissionContextType, 
  UserDataPermission,
  PERMISSION_LABELS 
} from '@/types/permissions';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuthStore();
  const [permissions, setPermissions] = useState<Record<PermissionCategory, boolean>>({
    view_margins: false,
    view_costs: false,
    view_stock_values: false,
    view_turnover_amounts: false,
    view_profit_data: false,
    view_vendor_costs: false,
    view_customer_margins: false,
    view_detailed_analytics: false,
    export_financial_data: false,
    view_credit_memo_amounts: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserPermissions = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Admins have all permissions
    if (isAdmin) {
      const allPermissions = Object.keys(PERMISSION_LABELS).reduce((acc, key) => {
        acc[key as PermissionCategory] = true;
        return acc;
      }, {} as Record<PermissionCategory, boolean>);
      
      setPermissions(allPermissions);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_data_permissions');
      
      if (error) {
        console.error('Error fetching user permissions:', error);
        setIsLoading(false);
        return;
      }

      // Convert array of permissions to object
      const permissionMap = Object.keys(PERMISSION_LABELS).reduce((acc, key) => {
        acc[key as PermissionCategory] = false;
        return acc;
      }, {} as Record<PermissionCategory, boolean>);

      if (data) {
        data.forEach((permission: UserDataPermission) => {
          permissionMap[permission.permission_category] = permission.is_granted;
        });
      }

      setPermissions(permissionMap);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: PermissionCategory): boolean => {
    // Admins always have all permissions
    if (isAdmin) return true;
    
    return permissions[permission] || false;
  };

  const refreshPermissions = async () => {
    setIsLoading(true);
    await fetchUserPermissions();
  };

  // Fetch permissions when user changes
  useEffect(() => {
    fetchUserPermissions();
  }, [user, isAdmin]);

  const contextValue: PermissionContextType = {
    permissions,
    isLoading,
    hasPermission,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};