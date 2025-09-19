
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { isAdminUser, ADMIN_CONFIG } from '@/config/admin';

export interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  userEmail: string | null;
  userRole: string | null;
  userFullName: string | null;
  
  user: any | null;
  profile: any | null;
  isAdmin: boolean;
  networkError: boolean;
  getProfile: () => Promise<any>;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{error?: any}>;
  signUp: (email: string, password: string, fullName: string) => Promise<{error?: any}>;
  signOut: () => Promise<void>;
  
  login: (email: string, password: string) => Promise<{error?: any}>;
  signup: (email: string, password: string, fullName: string) => Promise<{error?: any}>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  isLoggedIn: false,
  isLoading: true,
  userEmail: null,
  userRole: null,
  userFullName: null,
  
  user: null,
  profile: null,
  isAdmin: false,
  networkError: false,
  
  getProfile: async () => {
    try {
      console.log('=== AUTH STORE: Getting profile for user:', get().userId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', get().userId)
        .single();
      
      if (profile) {
        const userEmail = get().userEmail;
        const isAdmin = isAdminUser(profile.role, userEmail);
        
        console.log('=== AUTH STORE: Profile loaded, setting admin status:', { 
          role: profile.role, 
          isAdmin,
          userEmail,
          config: ADMIN_CONFIG.HARDCODED_ADMIN_EMAILS 
        });
        
        set({
          userRole: profile.role || null,
          userFullName: profile.full_name || null,
          profile: profile || null,
          isAdmin,
        });
      }
      
      return profile;
    } catch (error) {
      console.error('=== AUTH STORE: Error fetching profile ===', error);
      return null;
    }
  },
  
  initialize: async () => {
    console.log('=== AUTH STORE: Initializing ===');
    await get().refreshSession();
  },
  
  login: async (email: string, password: string) => {
    try {
      console.log('=== AUTH STORE: Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('=== AUTH STORE: Login error ===', error);
        return { error };
      }
      
      if (data.user) {
        console.log('=== AUTH STORE: Login successful, setting user data ===');
        
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          const isAdmin = isAdminUser(profile?.role, data.user.email);
          
          set({
            userId: data.user.id,
            user: { ...data.user, profile: profile || null },
            isLoggedIn: true,
            userEmail: data.user.email,
            userRole: profile?.role || null,
            userFullName: profile?.full_name || null,
            profile: profile || null,
            isAdmin,
            networkError: false,
            isLoading: false, // Explicitly set loading to false
          });
        } catch (profileError) {
          console.warn('=== AUTH STORE: Profile fetch failed, continuing without profile ===', profileError);
          const isAdmin = isAdminUser(null, data.user.email);
          
          set({
            userId: data.user.id,
            user: data.user,
            isLoggedIn: true,
            userEmail: data.user.email,
            userRole: null,
            userFullName: null,
            profile: null,
            isAdmin,
            networkError: false,
            isLoading: false, // Explicitly set loading to false
          });
        }
      }
      
      return {};
    } catch (error: any) {
      console.error('=== AUTH STORE: Login exception ===', error);
      set({ isLoading: false }); // Ensure loading is false on error
      return { error };
    }
  },
  
  signIn: async (email: string, password: string) => {
    return get().login(email, password);
  },
  
  signup: async (email: string, password: string, fullName: string) => {
    try {
      console.log('=== AUTH STORE: Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('=== AUTH STORE: Signup error ===', error);
        set({ isLoading: false }); // Ensure loading is false on error
        return { error };
      }
      
      console.log('=== AUTH STORE: Signup successful ===');
      set({ isLoading: false }); // Ensure loading is false on success
      return {};
    } catch (error: any) {
      console.error('=== AUTH STORE: Signup exception ===', error);
      set({ isLoading: false }); // Ensure loading is false on error
      return { error };
    }
  },
  
  signUp: async (email: string, password: string, fullName: string) => {
    return get().signup(email, password, fullName);
  },
  
  logout: async () => {
    try {
      console.log('=== AUTH STORE: Logging out ===');
      await supabase.auth.signOut();
      set({
        userId: null,
        user: null,
        isLoggedIn: false,
        userEmail: null,
        userRole: null,
        userFullName: null,
        profile: null,
        isAdmin: false,
        networkError: false,
        isLoading: false, // Explicitly set loading to false
      });
      console.log('=== AUTH STORE: Logout successful ===');
    } catch (error) {
      console.error('=== AUTH STORE: Logout error ===', error);
      set({ isLoading: false }); // Ensure loading is false even on error
      throw error;
    }
  },
  
  signOut: async () => {
    return get().logout();
  },
  
  refreshSession: async () => {
    try {
      console.log('=== AUTH STORE: Refreshing session (simplified) ===');
      set({ isLoading: true, networkError: false });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('=== AUTH STORE: Session data received:', !!session);
      
      if (session && session.user) {
        console.log('=== AUTH STORE: Valid session found, setting user data ===');
        
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('=== AUTH STORE: Profile loaded for session ===');
          
          const isAdmin = isAdminUser(profile?.role, session.user.email);
          
          set({
            userId: session.user.id,
            user: { ...session.user, profile: profile || null },
            isLoggedIn: true,
            userEmail: session.user.email,
            userRole: profile?.role || null,
            userFullName: profile?.full_name || null,
            profile: profile || null,
            isAdmin,
            isLoading: false,
            networkError: false,
          });
        } catch (profileError) {
          console.warn('=== AUTH STORE: Profile fetch failed, continuing without profile ===', profileError);
          const isAdmin = isAdminUser(null, session.user.email);
          
          set({
            userId: session.user.id,
            user: session.user,
            isLoggedIn: true,
            userEmail: session.user.email,
            userRole: null,
            userFullName: null,
            profile: null,
            isAdmin,
            isLoading: false,
            networkError: false,
          });
        }
      } else {
        console.log('=== AUTH STORE: No valid session found ===');
        set({
          userId: null,
          user: null,
          isLoggedIn: false,
          userEmail: null,
          userRole: null,
          userFullName: null,
          profile: null,
          isAdmin: false,
          isLoading: false,
          networkError: false,
        });
      }
    } catch (error: any) {
      console.error('=== AUTH STORE: Session refresh error ===', error);
      const isNetworkError = error.message?.includes('network') || 
                            error.message?.includes('timeout') || 
                            error.message?.includes('ERR_NAME_NOT_RESOLVED') ||
                            error.message?.includes('Failed to fetch');
      
      set({
        userId: null,
        user: null,
        isLoggedIn: false,
        userEmail: null,
        userRole: null,
        userFullName: null,
        profile: null,
        isAdmin: false,
        isLoading: false,
        networkError: isNetworkError,
      });
    }
  },
}));

// Simplified initialization - NO RETRIES, NO COMPLEX LOGIC
if (typeof window !== 'undefined') {
  console.log('=== AUTH STORE: Starting initial session check ===');
  
  // Force stop loading after 3 seconds maximum
  const maxInitTime = setTimeout(() => {
    console.warn('=== AUTH STORE: Force stopping loading state after 3 seconds ===');
    useAuthStore.setState({ isLoading: false });
  }, 3000);
  
  useAuthStore.getState().refreshSession()
    .finally(() => {
      clearTimeout(maxInitTime);
      console.log('=== AUTH STORE: Initial session check completed ===');
    });
}
