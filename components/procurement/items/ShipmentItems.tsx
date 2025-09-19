
import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { getItemsCount } from '../utils/shipmentUtils';

type ShipmentItemsProps = {
  shipmentId: string;
};

const ShipmentItems: React.FC<ShipmentItemsProps> = ({ shipmentId }) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchItemsCount = async () => {
      try {
        setLoading(true);
        const { count } = await getItemsCount(shipmentId);
        setCount(count);
      } catch (error) {
        console.error('Error fetching items count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemsCount();
  }, [shipmentId]);

  return (
    <div className="flex items-center justify-center">
      <Package className="h-4 w-4 mr-2 text-gray-500" />
      {loading ? (
        <span className="text-sm text-gray-400">Loading...</span>
      ) : (
        <span className="font-medium">{count} items</span>
      )}
    </div>
  );
};

export default ShipmentItems;
