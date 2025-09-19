
import React from 'react';

interface ReasonSectionProps {
  reason: string;
  comment?: string | null;
}

const ReasonSection: React.FC<ReasonSectionProps> = ({
  reason,
  comment
}) => {
  return (
    <div className="space-y-4 border-t pt-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Return Reason</h3>
        <p className="text-base">{reason}</p>
      </div>
      
      {comment && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Additional Comments</h3>
          <p className="text-base">{comment}</p>
        </div>
      )}
    </div>
  );
};

export default ReasonSection;
