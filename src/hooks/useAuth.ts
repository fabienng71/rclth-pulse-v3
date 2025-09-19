
import { useAuthStore } from '@/stores/authStore';

// Re-export the authentication store hook as useAuth for backward compatibility
export const useAuth = () => {
  const { isLoggedIn, isLoading } = useAuthStore();
  return { isLoggedIn, isLoading };
};
