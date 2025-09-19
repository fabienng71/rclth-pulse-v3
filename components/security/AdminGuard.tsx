import React, { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ShieldAlert, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_CONFIG } from '@/config/admin';

interface AdminGuardProps {
  children: ReactNode;
  fallbackPath?: string;
  showToast?: boolean;
}

/**
 * AdminGuard component provides an additional layer of security for admin components.
 * This works alongside the route-level protection to ensure double verification.
 * 
 * Features:
 * - Checks admin status on component mount
 * - Redirects non-admin users automatically
 * - Shows appropriate error UI if needed
 * - Provides audit logging for unauthorized access attempts
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  fallbackPath = '/dashboard',
  showToast = true 
}) => {
  const { isAdmin, profile, user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't check if still loading
    if (isLoading) return;

    // If not authenticated at all, redirect to login
    if (!user) {
      console.warn('AdminGuard: Unauthenticated user attempting admin access');
      navigate('/login');
      return;
    }

    // If not admin, log the attempt and redirect
    if (!isAdmin) {
      console.warn('AdminGuard: Non-admin user attempting admin access', {
        userId: user.id,
        userEmail: user.email,
        profileRole: profile?.role,
        timestamp: new Date().toISOString(),
        attemptedPath: window.location.pathname
      });

      if (showToast) {
        toast.error('Admin access required. Redirecting to dashboard.');
      }

      navigate(fallbackPath);
      return;
    }

    // Log successful admin access for audit trail (if enabled)
    if (ADMIN_CONFIG.ENABLE_ADMIN_LOGGING) {
      console.log('AdminGuard: Admin access granted', {
        userId: user.id,
        userEmail: user.email,
        profileRole: profile?.role,
        timestamp: new Date().toISOString(),
        accessedPath: window.location.pathname,
        adminConfig: {
          hardcodedAdmins: ADMIN_CONFIG.HARDCODED_ADMIN_EMAILS.length,
          sessionTimeout: ADMIN_CONFIG.ADMIN_SESSION_TIMEOUT
        }
      });
    }
  }, [isAdmin, profile, user, isLoading, navigate, fallbackPath, showToast]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔐</div>
          <p className="text-lg text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
        <UserX className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-muted-foreground">Please log in to access this page.</p>
      </div>
    );
  }

  // Show error if not admin
  if (!isAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-4">
          You need administrator privileges to access this page.
        </p>
        <div className="text-sm bg-muted p-3 rounded-md text-left max-w-md">
          <p><strong>Current role:</strong> {profile?.role || 'undefined'}</p>
          <p><strong>Admin status:</strong> {isAdmin ? 'true' : 'false'}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
        </div>
      </div>
    );
  }

  // If all checks pass, render the admin content
  return <>{children}</>;
};

export default AdminGuard;