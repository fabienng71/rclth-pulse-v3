import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateSessionDialog } from '../CreateSessionDialog';
import { AdministrativeForecastManagement } from './AdministrativeForecastManagement';
import { ForecastSession } from '@/hooks/useForecastSessions';

interface StartViewProps {
  isAdmin: boolean;
  sessions: ForecastSession[];
  onStartIndividual: () => void;
  onJoinSession: (sessionId: string) => void;
  onSessionCreated: (sessionId: string) => void;
}

export const StartView: React.FC<StartViewProps> = ({
  isAdmin,
  sessions,
  onStartIndividual,
  onJoinSession,
  onSessionCreated
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">Ready to Create Sales Forecast?</h3>
          <p className="text-muted-foreground">
            Choose how you want to create your forecast.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onStartIndividual} size="lg" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Individual Forecast
          </Button>
          
          <CreateSessionDialog onSessionCreated={onSessionCreated} />
        </div>
      </div>

      {/* Admin Management Section */}
      {isAdmin && <AdministrativeForecastManagement />}

      {/* Active Sessions */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collaborative Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{session.session_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Vendor: {session.vendor_code} • Created by: {session.creator_name || session.creator_email}
                    </div>
                    {session.eta_date && (
                      <div className="text-sm text-muted-foreground">
                        ETA: {new Date(session.eta_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <Button size="sm" onClick={() => onJoinSession(session.id)}>
                      {session.status === 'active' ? 'Join Session' : 'View Session'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};