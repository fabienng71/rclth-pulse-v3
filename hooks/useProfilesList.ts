
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  spp_code: string | null;
}

export const useProfilesList = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, spp_code')
          .not('spp_code', 'is', null)
          .neq('spp_code', '')
          .order('full_name');

        if (error) throw error;
        
        // Additional filtering to ensure we only get profiles with valid spp_code
        const validProfiles = data?.filter(profile => 
          profile.spp_code && 
          profile.spp_code.trim() !== '' &&
          profile.id
        ) || [];
        
        return validProfiles;
      } catch (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};
