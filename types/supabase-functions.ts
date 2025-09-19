
// This file defines custom function types for Supabase database functions

// Define a standalone type for the channel sales data function
export interface ChannelSalesDataFunction {
  Args: {
    from_date: string;
    to_date: string;
    filter_channel?: string | null;
  };
  Returns: {
    year_month: string;
    channel: string;
    total_sales: number;
  }[];
}

// No need to redeclare or augment the Database type
// Instead use this type when calling the function
