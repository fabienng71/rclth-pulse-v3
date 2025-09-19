
import React from 'react';

interface CustomerInfoSectionProps {
  customerCode: string;
  customerName?: string | null;
  searchName?: string | null;
  productCode: string;
  productDescription?: string | null;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customerCode,
  customerName,
  searchName,
  productCode,
  productDescription
}) => {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Customer Information</h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-500">Customer</p>
          <p className="text-base">
            {searchName || customerName || customerCode}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Product</p>
          <p className="text-base">
            {productDescription ? (
              <>
                <span className="font-medium">{productCode}</span>
                <span className="ml-2 text-gray-600">- {productDescription}</span>
              </>
            ) : (
              productCode
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoSection;
