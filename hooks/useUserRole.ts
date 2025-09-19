import { useAuthStore } from '@/stores/authStore';

export const useUserRole = () => {
  const { userRole, isLoading } = useAuthStore();

  return { role: userRole, isLoading };
};
