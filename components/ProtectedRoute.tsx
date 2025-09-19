
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ShieldAlert, UserX } from 'lucide-react';
import { useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  children: ReactNode;
}

const ProtectedRoute = ({ requireAdmin = false, children }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, profile, signOut } = useAuthStore();
  const location = useLocation();

  // Check if user is active
  useEffect(() => {
    if (user && profile && !profile.is_active) {
      toast.error("Your account has been deactivated by an administrator.");
      signOut();
    }
  }, [user, profile, signOut]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔐</div>
          <p className="text-lg text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile && !profile.is_active) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <UserX className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Account Deactivated</h1>
        <p className="text-muted-foreground mb-4">
          Your account has been deactivated by an administrator.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    console.log('Admin access denied:', { 
      profileRole: profile?.role, 
      isAdmin, 
      userId: user?.id 
    });
    
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-4">
          You need administrator privileges to access this page.
        </p>
        <div className="text-sm bg-muted p-3 rounded-md text-left max-w-md mb-4">
          <p><strong>Current role:</strong> {profile?.role || 'undefined'}</p>
          <p><strong>Admin status:</strong> {isAdmin ? 'true' : 'false'}</p>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
