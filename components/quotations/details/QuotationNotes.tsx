
interface QuotationNotesProps {
  notes?: string;
}

export const QuotationNotes = ({ notes }: QuotationNotesProps) => {
  if (!notes) return null;
  
  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Notes</h3>
      <div className="border rounded-md p-3 whitespace-pre-line text-sm text-gray-600">
        {notes}
      </div>
    </div>
  );
};
