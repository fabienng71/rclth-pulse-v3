
export interface SalespersonData {
  spp_code: string;
  spp_name: string;
  data: { month: string; turnover: number }[];
}

export interface MonthlyTurnover {
  month?: string;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  margin_percent: number;
  display_month?: string;
}

export interface TurnoverLineChartProps {
  monthlyTurnover: MonthlyTurnover[] | undefined;
  isLoading: boolean;
  error: Error | null;
}
