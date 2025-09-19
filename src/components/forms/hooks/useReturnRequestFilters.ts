
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useReturnRequestFilters = () => {
  const { user, userEmail } = useAuthStore();
  const [nameFilter, setNameFilter] = useState('');
  
  // Check if user is admin or has the specific admin email
  const adminEmails = ['fabien@repertoire.co.th', 'store@repertoire.co.th'];
  const isAdmin = user?.app_metadata?.role === 'admin' || 
                 user?.user_metadata?.role === 'admin' || 
                 (userEmail && adminEmails.includes(userEmail));

  return {
    nameFilter,
    setNameFilter,
    isAdmin,
    userId: user?.id
  };
};
