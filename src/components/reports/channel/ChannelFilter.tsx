
import { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Channel {
  customer_type_code: string;
  channel_name: string;
}

interface ChannelFilterProps {
  selectedChannel: string | null;
  onChannelChange: (channel: string | null) => void;
}

const ChannelFilter = ({ selectedChannel, onChannelChange }: ChannelFilterProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('customer_type_code, channel_name')
          .order('channel_name');
        
        if (error) {
          console.error('Error fetching channels:', error);
        } else if (data) {
          setChannels(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const handleChannelChange = (value: string) => {
    onChannelChange(value === 'all' ? null : value);
  };

  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="channel-filter">Channel</Label>
      <Select
        disabled={isLoading}
        value={selectedChannel || 'all'}
        onValueChange={handleChannelChange}
      >
        <SelectTrigger id="channel-filter" className="w-full">
          <SelectValue placeholder="Select a channel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Channels</SelectItem>
          {channels.map(channel => (
            <SelectItem key={channel.customer_type_code} value={channel.customer_type_code}>
              {channel.channel_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChannelFilter;
