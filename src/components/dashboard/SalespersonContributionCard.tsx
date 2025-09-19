
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent } from "lucide-react";

interface SalespersonContributionCardProps {
  salespersonTurnover: number | undefined;
  totalCompanyTurnover: number | undefined;
  salespersonName: string;
  isLoading: boolean;
  error: Error | null;
}

export const SalespersonContributionCard = ({
  salespersonTurnover,
  totalCompanyTurnover,
  salespersonName,
  isLoading,
  error,
}: SalespersonContributionCardProps) => {
  // Calculate the contribution percentage
  const contributionPercentage = 
    salespersonName === "All Salespeople"
      ? "100.00" // When "All Salespeople" is selected, contribution is 100%
      : (salespersonTurnover && totalCompanyTurnover && totalCompanyTurnover > 0
          ? ((salespersonTurnover / totalCompanyTurnover) * 100).toFixed(2)
          : "0");
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Contribution</CardTitle>
        <BadgePercent className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold text-muted-foreground">—</div>
        ) : error ? (
          <p className="text-destructive text-sm">Failed to load data</p>
        ) : (
          <>
            <div className="text-2xl font-bold">{contributionPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {salespersonName}'s contribution
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
