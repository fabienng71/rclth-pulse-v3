
import { Table } from "@/components/ui/table";
import { VendorSalesData } from "@/hooks/useVendorSalesData";
import { useSortableTable } from "@/hooks/useSortableTable";

// Import sub-components
import { VendorSalesTableHeader } from "./vendor/table/VendorSalesTableHeader";
import { VendorSalesTableBody } from "./vendor/table/VendorSalesTableBody";
import { VendorSalesTableFooter } from "./vendor/table/VendorSalesTableFooter";
import { VendorSalesTableEmpty } from "./vendor/table/VendorSalesTableEmpty";
import { sortVendorData } from "./vendor/table/VendorSalesTableSorter";

interface VendorSalesTableProps {
  data: VendorSalesData[];
  months: string[];
  isLoading: boolean;
}

export const VendorSalesTable = ({ data, months, isLoading }: VendorSalesTableProps) => {
  const { sortField, sortDirection, handleSort } = useSortableTable<'vendor_code' | 'vendor_name' | 'total' | string>('vendor_name');

  // Sort the data
  const sortedData = sortVendorData(data, { sortField, sortDirection, months });
  
  // Check if we should render empty state
  const showEmptyState = isLoading || data.length === 0;
  if (showEmptyState) {
    return <VendorSalesTableEmpty isLoading={isLoading} hasData={data.length > 0} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <VendorSalesTableHeader 
          months={months}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
        />
        
        <VendorSalesTableBody 
          data={sortedData}
          months={months}
        />
        
        <VendorSalesTableFooter 
          data={data}
          months={months}
        />
      </Table>
    </div>
  );
};
