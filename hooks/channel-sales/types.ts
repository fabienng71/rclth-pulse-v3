
export interface ChannelData {
  channel: string;
  channel_name: string;
  total: number;
  months: Record<string, number>;
}

export interface ProcessedChannelSalesData {
  channelSalesData: ChannelData[];
  months: string[];
}

export interface RawSalesDataItem {
  year_month: string;
  channel: string;
  total_sales: number;
}

export interface ChannelNameMapping {
  customer_type_code: string;
  channel_name: string;
}
