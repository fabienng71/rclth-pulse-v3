export type PermissionCategory = 
  | 'view_margins'
  | 'view_costs'
  | 'view_stock_values'
  | 'view_turnover_amounts'
  | 'view_profit_data'
  | 'view_vendor_costs'
  | 'view_customer_margins'
  | 'view_detailed_analytics'
  | 'export_financial_data'
  | 'view_credit_memo_amounts';

export interface UserDataPermission {
  permission_category: PermissionCategory;
  is_granted: boolean;
  granted_at: string;
}

export interface UserPermissionSummary {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  total_permissions: number;
  granted_permissions: number;
  last_permission_update: string | null;
}

export interface PermissionManagementRequest {
  target_user_id: string;
  permission: PermissionCategory;
  grant_permission: boolean;
  admin_notes?: string;
}

// Permission labels for UI display
export const PERMISSION_LABELS: Record<PermissionCategory, string> = {
  view_margins: 'View Margin Data',
  view_costs: 'View Cost Information',
  view_stock_values: 'View Stock Values',
  view_turnover_amounts: 'View Turnover Amounts',
  view_profit_data: 'View Profit Data',
  view_vendor_costs: 'View Vendor Costs',
  view_customer_margins: 'View Customer Margins',
  view_detailed_analytics: 'View Detailed Analytics',
  export_financial_data: 'Export Financial Data',
  view_credit_memo_amounts: 'View Credit Memo Amounts'
};

// Permission descriptions for admin interface
export const PERMISSION_DESCRIPTIONS: Record<PermissionCategory, string> = {
  view_margins: 'Allow viewing margin percentages and margin amounts in reports',
  view_costs: 'Allow viewing cost data, COGS, and cost-related calculations',
  view_stock_values: 'Allow viewing monetary values of stock items and inventory worth',
  view_turnover_amounts: 'Allow viewing sales amounts, revenue figures, and turnover data',
  view_profit_data: 'Allow viewing profit calculations and profit-related metrics',
  view_vendor_costs: 'Allow viewing vendor-specific cost information and purchase prices',
  view_customer_margins: 'Allow viewing customer-specific margin calculations',
  view_detailed_analytics: 'Allow access to detailed analytics and advanced reporting features',
  export_financial_data: 'Allow exporting reports containing financial and sensitive data',
  view_credit_memo_amounts: 'Allow viewing credit memo amounts and credit-related adjustments'
};

// Grouped permissions for better organization in UI
export const PERMISSION_GROUPS = {
  financial: {
    label: 'Financial Data',
    permissions: ['view_margins', 'view_costs', 'view_profit_data', 'view_credit_memo_amounts'] as PermissionCategory[]
  },
  sales: {
    label: 'Sales & Customer Data',
    permissions: ['view_turnover_amounts', 'view_customer_margins'] as PermissionCategory[]
  },
  inventory: {
    label: 'Inventory & Stock',
    permissions: ['view_stock_values', 'view_vendor_costs'] as PermissionCategory[]
  },
  analytics: {
    label: 'Analytics & Export',
    permissions: ['view_detailed_analytics', 'export_financial_data'] as PermissionCategory[]
  }
};

// Context type for permission provider
export interface PermissionContextType {
  permissions: Record<PermissionCategory, boolean>;
  isLoading: boolean;
  hasPermission: (permission: PermissionCategory) => boolean;
  refreshPermissions: () => Promise<void>;
}

// Helper function to check if any permission in a group is granted
export const hasAnyPermissionInGroup = (
  permissions: Record<PermissionCategory, boolean>,
  groupKey: keyof typeof PERMISSION_GROUPS
): boolean => {
  const group = PERMISSION_GROUPS[groupKey];
  return group.permissions.some(permission => permissions[permission]);
};

// Helper function to get permission status summary
export const getPermissionSummary = (
  permissions: Record<PermissionCategory, boolean>
): { total: number; granted: number; percentage: number } => {
  const total = Object.keys(permissions).length;
  const granted = Object.values(permissions).filter(Boolean).length;
  const percentage = total > 0 ? Math.round((granted / total) * 100) : 0;
  
  return { total, granted, percentage };
};