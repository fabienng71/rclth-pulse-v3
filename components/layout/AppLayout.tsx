
import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { mounted } = useTheme();
  
  // Apply theme transition cleanup
  useEffect(() => {
    const root = document.documentElement;
    const cleanupAnimation = () => {
      root.classList.remove('animate-theme-transition');
    };
    
    const timer = setTimeout(cleanupAnimation, 500);
    return () => clearTimeout(timer);
  }, []);

  // Don't render until theme is mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`app-background min-h-screen transition-smooth ${isLoginPage ? '' : 'bg-background-gradient'}`}>
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};
