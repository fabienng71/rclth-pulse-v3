
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users } from 'lucide-react';
import { useForecastSessions } from '@/hooks/useForecastSessions';
import VendorSearch from '@/components/procurement/search/VendorSearch';
import { toast } from 'sonner';

interface CreateSessionDialogProps {
  onSessionCreated: (sessionId: string) => void;
}

export const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({ onSessionCreated }) => {
  const [open, setOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<{ vendor_code: string; vendor_name: string } | null>(null);
  const [etaDate, setEtaDate] = useState('');
  const [notes, setNotes] = useState('');
  const { createSession } = useForecastSessions();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    if (!selectedVendor) {
      toast.error('Please select a vendor');
      return;
    }

    setCreating(true);
    try {
      console.log('Starting session creation...');
      
      const session = await createSession({
        session_name: sessionName.trim(),
        vendor_code: selectedVendor.vendor_code,
        eta_date: etaDate || undefined,
        notes: notes.trim() || undefined
      });

      console.log('Session creation completed:', session);
      toast.success('Collaborative forecast session created');
      
      // Handle the session response properly - use type assertion for the new table
      const sessionResult = session as any;
      const sessionId = sessionResult?.id;
      if (sessionId) {
        onSessionCreated(sessionId);
        setOpen(false);
        
        // Reset form
        setSessionName('');
        setSelectedVendor(null);
        setEtaDate('');
        setNotes('');
      } else {
        console.error('No session ID returned from creation');
        toast.error('Session created but ID not found');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      
      // More detailed error reporting
      let errorMessage = 'Failed to create forecast session';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Users className="mr-2 h-4 w-4" />
          Start Collaborative Forecast
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Collaborative Forecast Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              placeholder="e.g., Q2 2024 Forecast - Vendor ABC"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Vendor</Label>
            <VendorSearch
              selectedVendorCode={selectedVendor?.vendor_code}
              onSelect={setSelectedVendor}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eta-date">Expected Delivery Date (ETA)</Label>
            <Input
              id="eta-date"
              type="date"
              value={etaDate}
              onChange={(e) => setEtaDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this forecast session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Session
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
