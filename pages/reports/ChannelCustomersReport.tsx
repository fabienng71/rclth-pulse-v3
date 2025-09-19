
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import React, { useState } from "react";
import { startOfMonth, endOfMonth, parseISO, subMonths } from "date-fns";
import { useChannelCustomers, ChannelCustomer } from "@/hooks/useChannelCustomers";
import { formatMonth } from "@/components/reports/monthly-data/formatUtil";

const ChannelCustomersReport = () => {
  const navigate = useNavigate();
  const { channel: channelCode } = useParams<{ channel: string }>(); // This is the channel code from URL
  const [searchParams, setSearchParams] = useSearchParams();

  const fromDateParam = searchParams.get("from");
  const toDateParam = searchParams.get("to");
  const initialFrom = fromDateParam ? parseISO(fromDateParam) : startOfMonth(subMonths(new Date(), 6));
  const initialTo = toDateParam ? parseISO(toDateParam) : endOfMonth(new Date());

  const [fromDate, setFromDate] = useState<Date>(initialFrom);
  const [toDate, setToDate] = useState<Date>(initialTo);

  // Use the hook with the channel code
  const { data: queryResult, isLoading, error } = useChannelCustomers(fromDate, toDate, channelCode);
  const customers = queryResult?.data || [];
  const months = queryResult?.months || [];
  const channelName = queryResult?.channelName || channelCode;

  const handleGoBack = () => {
    navigate(-1);
  };

  const updateDateParams = (from: Date, to: Date) => {
    setSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    setFromDate(from);
    setToDate(to);
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">
            {channelName} - Customers Turnover
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Customers by Channel: {channelName}</CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span>Monthly turnover per customer for this channel.</span>
              <span className="text-xs text-muted-foreground">Channel code: {channelCode}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
              <div className="space-y-2">
                <DateRangeSelector
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={(date) => updateDateParams(startOfMonth(date), toDate)}
                  onToDateChange={(date) => updateDateParams(fromDate, endOfMonth(date))}
                  showLabel={true}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <CustomersTable
                data={customers}
                months={months}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

function CustomersTable({
  data,
  months,
  isLoading,
  error,
}: {
  data: ChannelCustomer[];
  months: string[];
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;
  if (!data || data.length === 0)
    return <div>No customers found for this channel and date range.</div>;

  const monthlyTotals = months.reduce((acc, m) => {
    acc[m] = data.reduce((sum, c) => sum + (c.months[m] || 0), 0);
    return acc;
  }, {} as Record<string, number>);
  const grandTotal = data.reduce((sum, c) => sum + c.total, 0);

  return (
    <table className="min-w-full table-auto border">
      <thead>
        <tr>
          <th className="p-2 border-b text-left">Customer</th>
          {months.map((month) => (
            <th key={month} className="p-2 border-b text-right">
              {formatMonth(month)}
            </th>
          ))}
          <th className="p-2 border-b text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {data.map((customer) => (
          <tr key={customer.customer_code}>
            <td className="p-2 border-b text-left">{customer.customer_name}</td>
            {months.map((month) => (
              <td key={month} className="p-2 border-b text-right">
                {customer.months[month]?.toLocaleString?.("en-US", { maximumFractionDigits: 0 }) || 0}
              </td>
            ))}
            <td className="p-2 border-b text-right font-medium">{customer.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-muted">
          <td className="p-2 font-semibold">Total</td>
          {months.map((month) => (
            <td key={month} className="p-2 font-semibold text-right">
              {monthlyTotals[month].toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </td>
          ))}
          <td className="p-2 font-semibold text-right">{grandTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default ChannelCustomersReport;
