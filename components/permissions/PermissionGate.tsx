import React from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import { PermissionCategory } from '@/types/permissions';

interface PermissionGateProps {
  permission: PermissionCategory;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, require all permissions in array
}

interface MultiPermissionGateProps {
  permissions: PermissionCategory[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, require all permissions; if false, require any one
}

// Single permission gate
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Multiple permissions gate
export const MultiPermissionGate: React.FC<MultiPermissionGateProps> = ({
  permissions,
  children,
  fallback = null,
  requireAll = false
}) => {
  const { hasPermission } = usePermissions();

  const hasRequiredPermissions = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission));

  if (!hasRequiredPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// HOC for permission-aware components
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: PermissionCategory,
  fallback?: React.ReactNode
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

// Sensitive data masking component
interface SensitiveDataProps {
  permission: PermissionCategory;
  children: React.ReactNode;
  maskedValue?: string | React.ReactNode;
  className?: string;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({
  permission,
  children,
  maskedValue = '****',
  className
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return (
      <span className={className} title="Access restricted">
        {maskedValue}
      </span>
    );
  }

  return <>{children}</>;
};

// Financial data component (commonly used pattern)
interface FinancialDataProps {
  amount: number;
  permission: PermissionCategory;
  formatter?: (amount: number) => string;
  className?: string;
  showCurrency?: boolean;
}

export const FinancialData: React.FC<FinancialDataProps> = ({
  amount,
  permission,
  formatter,
  className,
  showCurrency = true
}) => {
  const { hasPermission } = usePermissions();

  const defaultFormatter = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: showCurrency ? 'currency' : 'decimal',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatValue = formatter || defaultFormatter;

  return (
    <SensitiveData 
      permission={permission} 
      maskedValue="****" 
      className={className}
    >
      {formatValue(amount)}
    </SensitiveData>
  );
};

// Percentage data component
interface PercentageDataProps {
  percentage: number;
  permission: PermissionCategory;
  decimals?: number;
  className?: string;
}

export const PercentageData: React.FC<PercentageDataProps> = ({
  percentage,
  permission,
  decimals = 1,
  className
}) => {
  return (
    <SensitiveData 
      permission={permission} 
      maskedValue="**%" 
      className={className}
    >
      {percentage.toFixed(decimals)}%
    </SensitiveData>
  );
};