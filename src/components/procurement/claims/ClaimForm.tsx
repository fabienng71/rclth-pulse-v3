
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClaimForm } from './useClaimForm';
import ClaimVendorSection from './ClaimVendorSection';
import ClaimItemsSection from './ClaimItemsSection';
import ClaimDetailsSection from './ClaimDetailsSection';
import ClaimActionsSection from './ClaimActionsSection';

const ClaimForm: React.FC = () => {
  const {
    form,
    vendor,
    setVendor,
    items,
    addItem,
    removeItem,
    updateItem,
    reason,
    setReason,
    note,
    setNote,
    value,
    setValue,
    currency,
    setCurrency,
    status,
    onSaveDraft,
    onSendEmail,
    onGeneratePdf,
    isSubmitting,
    templates,
    applyNoteTemplate
  } = useClaimForm();

  return (
    <Card variant="enhanced">
      <CardHeader>
        <CardTitle>Claim Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <ClaimVendorSection vendor={vendor} setVendor={setVendor} disabled={isSubmitting} />
          <ClaimItemsSection
            items={items}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            disabled={isSubmitting}
          />
          <ClaimDetailsSection
            reason={reason}
            setReason={setReason}
            note={note}
            setNote={setNote}
            templates={templates}
            applyNoteTemplate={applyNoteTemplate}
            value={value}
            setValue={setValue}
            currency={currency}
            setCurrency={setCurrency}
            disabled={isSubmitting}
          />
          <ClaimActionsSection
            status={status}
            onSaveDraft={onSaveDraft}
            onSendEmail={onSendEmail}
            onGeneratePdf={onGeneratePdf}
            isSubmitting={isSubmitting}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default ClaimForm;
