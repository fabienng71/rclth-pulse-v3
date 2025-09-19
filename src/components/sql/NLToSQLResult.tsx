
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

interface NLToSQLResultProps {
  results: any[];
  columns: string[];
}

const NLToSQLResult = ({ results, columns }: NLToSQLResultProps) => {
  useEffect(() => {
    // Debug logging on mount
    console.log("Results received:", results);
    console.log("Columns received:", columns);
  }, [results, columns]);

  if (!results || results.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No results found
      </Card>
    );
  }

  // Filter out any null or undefined values from columns
  const validColumns = columns.filter(column => column !== null && column !== undefined);
  
  // If no valid columns were provided or all were null, extract them from the first result
  const tableColumns = validColumns.length > 0 
    ? validColumns 
    : (results[0] ? Object.keys(results[0]) : []);

  // Debug log the actual data structure
  if (tableColumns.length === 0) {
    console.warn("No columns available for display after filtering. Results structure:", results);
  }

  // Format cell value appropriately
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "NULL";
    
    if (typeof value === "object") {
      if (value instanceof Date) return value.toLocaleString();
      
      try {
        return JSON.stringify(value);
      } catch (e) {
        console.warn("Failed to stringify object:", e);
        return String(value);
      }
    }
    
    if (typeof value === "number") {
      // Format number appropriately
      return value.toLocaleString();
    }
    
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }
    
    // Default to string representation
    return String(value);
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map((column, index) => (
              <TableHead key={index} className="font-semibold">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {tableColumns.map((column, colIndex) => (
                <TableCell key={`${rowIndex}-${colIndex}`}>
                  {formatValue(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NLToSQLResult;
