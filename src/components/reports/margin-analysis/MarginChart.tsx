
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { TopNSelector } from "./TopNSelector";
import { ChartView } from "./chart/ChartView";
import { TableView } from "./table/TableView";
import { formatChartData, getMarginColorScheme, getBarColor } from "./utils/chartUtils";
import { MarginChartProps } from "./types";

const MarginChart = ({ itemsData, customersData, categoriesData, isLoading, activeTab }: MarginChartProps) => {
  const [topN, setTopN] = useState(10);
  const [viewType, setViewType] = useState<"chart" | "table">("chart");
  
  const colors = getMarginColorScheme();

  // Get the current data set based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "items":
        return formatChartData(itemsData, topN);
      case "customers":
        return formatChartData(customersData, topN);
      case "categories":
        return formatChartData(categoriesData, topN);
      default:
        return [];
    }
  }, [activeTab, itemsData, customersData, categoriesData, topN]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="skeleton"><Skeleton className="h-6 w-1/2" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle>Margin Visualization</CardTitle>
            <CardDescription>
              Visual comparison of margins for {activeTab === "items" ? "products" : "customers"}
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-2 md:mt-0">
            <TopNSelector value={topN} onChange={setTopN} />
            <div className="flex items-center">
              <button 
                onClick={() => setViewType("chart")} 
                className={`px-3 py-1 text-xs rounded-l-md ${viewType === "chart" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                Chart
              </button>
              <button 
                onClick={() => setViewType("table")} 
                className={`px-3 py-1 text-xs rounded-r-md ${viewType === "table" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewType === "chart" ? (
          <div className="h-80">
            <ChartView 
              currentData={currentData} 
              activeTab={activeTab} 
              getBarColor={(marginPercent) => getBarColor(marginPercent, colors)} 
            />
          </div>
        ) : (
          <TableView 
            activeTab={activeTab} 
            currentData={currentData} 
            getBarColor={(marginPercent) => getBarColor(marginPercent, colors)} 
            colors={colors}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MarginChart;
