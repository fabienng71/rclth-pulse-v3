export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      project: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          start_date: string
          end_date: string | null
          customer_code: string | null
          budget: number | null
          salesperson_id: string | null
          created_at: string
          updated_at: string
          target_type: string | null
          target_value: number | null
          is_active: boolean | null
          vendor_code: string | null
          activities: string | null
          vendor_name: string | null
          forced_active: boolean | null
          archive: boolean | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: string
          start_date: string
          end_date?: string | null
          customer_code?: string | null
          budget?: number | null
          salesperson_id?: string | null
          created_at?: string
          updated_at?: string
          target_type?: string | null
          target_value?: number | null
          is_active?: boolean | null
          vendor_code?: string | null
          activities?: string | null
          vendor_name?: string | null
          forced_active?: boolean | null
          archive?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          start_date?: string
          end_date?: string | null
          customer_code?: string | null
          budget?: number | null
          salesperson_id?: string | null
          created_at?: string
          updated_at?: string
          target_type?: string | null
          target_value?: number | null
          is_active?: boolean | null
          vendor_code?: string | null
          activities?: string | null
          vendor_name?: string | null
          forced_active?: boolean | null
          archive?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_sales_mtd: {
        Args: {
          p_year: number
          p_month: number
          p_salesperson_code?: string | null
          p_is_admin?: boolean
          p_include_delivery_fees?: boolean
          p_include_credit_memos?: boolean
        }
        Returns: Array<{
          day_of_month: number
          current_year_sales: number
          previous_year_sales: number
          running_total_current_year: number
          running_total_previous_year: number
          weekday_name: string
          variance_percent: number
          is_weekend: boolean
          is_holiday: boolean
        }>
      }
      get_sales_target_amount: {
        Args: {
          p_year: number
          p_month: number
          p_salesperson_code: string
        }
        Returns: number
      }
      get_sales_targets: {
        Args: {
          p_year: number
          p_month: number
        }
        Returns: Array<{
          id: string
          salesperson_code: string
          month: number
          year: number
          target_amount: number
          created_at: string
          updated_at: string
        }>
      }
      save_sales_targets: {
        Args: {
          p_year: number
          p_month: number
          p_targets: Json
        }
        Returns: void
      }
      get_enhanced_weekly_insights_v2: {
        Args: {
          p_year: number
          p_week: number
          p_salesperson_code?: string | null
          p_is_admin?: boolean
          p_include_trends?: boolean
        }
        Returns: Json
      }
      get_true_new_customers: {
        Args: {
          p_year: number
          p_week: number
          p_salesperson_code?: string | null
          p_minimum_transaction_value?: number
          p_minimum_week_total?: number
        }
        Returns: Array<{
          customer_code: string
          customer_name: string
          salesperson_code: string
          first_transaction_date: string
          first_week_total_value: number
          transaction_count: number
          is_meaningful_new: boolean
        }>
      }
      get_enhanced_baselines: {
        Args: {
          p_customer_code: string
          p_item_code?: string | null
          p_end_year: number
          p_end_week: number
          p_periods_back?: number
        }
        Returns: Array<{
          entity_code: string
          entity_type: string
          rolling_4week_avg: number
          rolling_8week_avg: number
          rolling_12week_avg: number
          seasonal_baseline: number
          variance_threshold_high: number
          variance_threshold_low: number
          trend_direction: string
        }>
      }
      populate_weekly_customer_analytics: {
        Args: {
          p_year: number
          p_week: number
          p_salesperson_code?: string | null
        }
        Returns: number
      }
      populate_item_trends_analytics: {
        Args: {
          p_year: number
          p_week: number
        }
        Returns: number
      }
      refresh_weekly_analytics: {
        Args: {
          p_year: number
          p_week: number
          p_salesperson_code?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never