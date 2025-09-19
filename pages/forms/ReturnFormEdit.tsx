
import React from 'react';
import { useParams } from 'react-router-dom';
import LegacyReturnFormRedirect from '@/components/forms/LegacyReturnFormRedirect';

// @deprecated This component is deprecated. Use enhanced return form instead.
console.warn('⚠️ DEPRECATED: ReturnFormEdit is deprecated. Redirecting to enhanced form.');

const ReturnFormEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <LegacyReturnFormRedirect
      title="Edit Return Request"
      description="The legacy edit return request form"
      redirectTo={id ? `/forms/return/view/${id}` : '/forms/return'}
    />
  );
};

export default ReturnFormEdit;
