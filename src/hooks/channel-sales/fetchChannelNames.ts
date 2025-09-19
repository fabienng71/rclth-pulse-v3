
import { supabase } from '@/lib/supabase';
import { ChannelNameMapping } from './types';

/**
 * Fetches channel names from the database
 * @returns Record mapping channel codes to names
 */
export async function fetchChannelNames(): Promise<Record<string, string>> {
  try {
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('customer_type_code, channel_name');

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      throw new Error('Failed to fetch channel names');
    }

    // Create a map for channel names (code -> name)
    const channelNameMap: Record<string, string> = {};
    if (channelsData) {
      console.log(`Successfully fetched ${channelsData.length} channel mappings`);
      channelsData.forEach((channel: ChannelNameMapping) => {
        channelNameMap[channel.customer_type_code] = channel.channel_name;
      });
    } else {
      console.warn('No channel mapping data returned from database');
    }
    
    return channelNameMap;
  } catch (error) {
    console.error('Error in fetchChannelNames:', error);
    // Return an empty map rather than throwing to prevent cascading failures
    return {};
  }
}

/**
 * Get channel code by name lookup
 * This is useful when we need to convert a name back to its code
 */
export async function getChannelCodeByName(channelName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('customer_type_code')
      .ilike('channel_name', channelName)
      .single();
    
    if (error) {
      console.error(`Error getting channel code for name "${channelName}":`, error);
      return null;
    }
    
    return data?.customer_type_code || null;
  } catch (error) {
    console.error(`Error in getChannelCodeByName for "${channelName}":`, error);
    return null;
  }
}
