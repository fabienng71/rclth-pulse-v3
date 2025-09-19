
interface QuotationItemsTotalProps {
  total: number;
}

const formatCurrency = (amount: number = 0) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const QuotationItemsTotal = ({ total }: QuotationItemsTotalProps) => {
  return (
    <div className="flex justify-end">
      <div className="w-[300px]">
        <div className="flex justify-between pt-2 border-t">
          <span className="font-medium">Total:</span>
          <span className="font-bold">THB {formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
