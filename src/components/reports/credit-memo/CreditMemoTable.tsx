
import { useState, useMemo } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface CreditMemo {
  id: string;
  document_no: string;
  posting_date: string;
  customer_code: string;
  customer_name: string;
  amount: number;
  amount_including_vat: number;
  item_code: string;
  quantity: number;
}

interface CreditMemoTableProps {
  creditMemos: CreditMemo[];
  loading: boolean;
  formatCurrency: (value: number | null | undefined) => string;
  formatDate: (dateStr: string | null | undefined) => string;
}

const CreditMemoTable = ({ creditMemos, loading, formatCurrency, formatDate }: CreditMemoTableProps) => {
  // Calculate totals
  const totals = useMemo(() => {
    return creditMemos.reduce(
      (acc, memo) => {
        return {
          quantity: acc.quantity + (memo.quantity || 0),
          amount: acc.amount + (memo.amount || 0),
          amountWithVat: acc.amountWithVat + (memo.amount_including_vat || 0),
        };
      },
      { quantity: 0, amount: 0, amountWithVat: 0 }
    );
  }, [creditMemos]);

  return (
    <div className="mt-6 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Item Code</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Amount (VAT)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : creditMemos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No credit memos found.
              </TableCell>
            </TableRow>
          ) : (
            creditMemos.map((memo) => (
              <TableRow key={memo.id}>
                <TableCell className="font-medium">{memo.document_no || '-'}</TableCell>
                <TableCell>{formatDate(memo.posting_date)}</TableCell>
                <TableCell>
                  {memo.customer_name || '-'}
                  {memo.customer_code && <div className="text-xs text-muted-foreground">{memo.customer_code}</div>}
                </TableCell>
                <TableCell>{memo.item_code || '-'}</TableCell>
                <TableCell className="text-right">{memo.quantity?.toLocaleString() || '-'}</TableCell>
                <TableCell className="text-right">{formatCurrency(memo.amount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(memo.amount_including_vat)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {!loading && creditMemos.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-bold text-right">
                Total
              </TableCell>
              <TableCell className="text-right font-bold">
                {totals.quantity.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(totals.amount)}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(totals.amountWithVat)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default CreditMemoTable;
