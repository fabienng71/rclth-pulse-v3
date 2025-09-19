
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCellNumeric } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatNumber } from "@/lib/utils";

interface BudgetEntry {
  month: string;
  amount: number;
}

interface BudgetEntriesTableProps {
  entries: BudgetEntry[];
  fiscalYear: string;
  currentSales: number;
}

const BudgetEntriesTable = ({ entries, fiscalYear, currentSales }: BudgetEntriesTableProps) => {
  const totalBudget = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const progressPercentage = totalBudget > 0 ? Math.round((currentSales / totalBudget) * 100) : 0;
  
  // Parse fiscal year to extract previous year
  const [startYr, endYr] = fiscalYear.split('/');
  const prevStartYr = String(Number(startYr) - 1).padStart(2, '0');
  const prevEndYr = String(Number(endYr) - 1).padStart(2, '0');
  const previousFiscalYear = `${prevStartYr}/${prevEndYr}`;

  const monthlyTurnover = useQuery({
    queryKey: ['monthly-turnover', fiscalYear],
    queryFn: async () => {
      const currentStartDate = new Date(`20${startYr}-04-01`);
      const currentEndDate = new Date(`20${endYr}-03-31`);

      const { data, error } = await supabase.rpc('get_monthly_turnover', {
        from_date: currentStartDate.toISOString(),
        to_date: currentEndDate.toISOString()
      });

      if (error) throw error;

      const turnoverByMonth: { [key: string]: number } = {};
      data.forEach((item: any) => {
        const date = new Date(item.month + '-01');
        const monthKey = date.toLocaleString('default', { month: 'long' });
        turnoverByMonth[monthKey] = Number(item.total_turnover) || 0;
      });

      return turnoverByMonth;
    },
    enabled: !!fiscalYear
  });

  // Add a query for the previous year's data
  const previousYearTurnover = useQuery({
    queryKey: ['monthly-turnover', previousFiscalYear],
    queryFn: async () => {
      const prevStartDate = new Date(`20${prevStartYr}-04-01`);
      const prevEndDate = new Date(`20${prevEndYr}-03-31`);

      const { data, error } = await supabase.rpc('get_monthly_turnover', {
        from_date: prevStartDate.toISOString(),
        to_date: prevEndDate.toISOString()
      });

      if (error) throw error;

      const turnoverByMonth: { [key: string]: number } = {};
      data.forEach((item: any) => {
        const date = new Date(item.month + '-01');
        const monthKey = date.toLocaleString('default', { month: 'long' });
        turnoverByMonth[monthKey] = Number(item.total_turnover) || 0;
      });

      return turnoverByMonth;
    },
    enabled: !!fiscalYear
  });

  // Calculate total for previous year
  const previousYearTotal = previousYearTurnover.data 
    ? Object.values(previousYearTurnover.data).reduce((sum, val) => sum + val, 0) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Details - FY {fiscalYear}</CardTitle>
        <CardDescription>Monthly budget breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Budget:</span>
            <span className="font-medium">{formatNumber(totalBudget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Current Sales:</span>
            <span className="font-medium">{formatNumber(currentSales)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Previous Year Sales:</span>
            <span className="font-medium">{formatNumber(previousYearTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Progress:</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Growth vs Previous Year:</span>
            <span className={`font-medium ${previousYearTotal > 0 && ((currentSales - previousYearTotal) / previousYearTotal) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {previousYearTotal > 0 ? `${((currentSales - previousYearTotal) / previousYearTotal * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Achieved</TableHead>
              <TableHead>Y-1 Sales</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Growth vs Y-1</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const achieved = monthlyTurnover.data?.[entry.month] || 0;
              const previousYearAchieved = previousYearTurnover.data?.[entry.month] || 0;
              const monthProgress = entry.amount > 0 
                ? Math.round((achieved / entry.amount) * 100)
                : 0;
              
              // Calculate growth percentage
              const growthPercent = previousYearAchieved > 0
                ? ((achieved - previousYearAchieved) / previousYearAchieved * 100).toFixed(1)
                : 'N/A';
              
              // Determine growth color
              const growthColor = previousYearAchieved > 0 
                ? (achieved > previousYearAchieved ? 'text-green-600' : 'text-red-600')
                : '';

              return (
                <TableRow key={entry.month}>
                  <TableCell>{entry.month}</TableCell>
                  <TableCell>{formatNumber(entry.amount)}</TableCell>
                  <TableCell>{formatNumber(achieved)}</TableCell>
                  <TableCell>{formatNumber(previousYearAchieved)}</TableCell>
                  <TableCell>{monthProgress}%</TableCell>
                  <TableCell className={growthColor}>
                    {growthPercent !== 'N/A' ? `${growthPercent}%` : growthPercent}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BudgetEntriesTable;
