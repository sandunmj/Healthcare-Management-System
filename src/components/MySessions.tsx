import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { Calendar, Clock, Users, Play, X, CheckCircle, Plus } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Session {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  capacity: number;
  bookedCount: number;
}

interface MySessionsProps {
  userId?: string;
}

export default function MySessions({ userId }: MySessionsProps) {
  console.log('MySessions received userId:', userId);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDateTime: '',
    endDateTime: '',
    maxAppointments: 10,
  });

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.SESSIONS.CREATE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleStartSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, status: 'SCHEDULED' as const } : session
    ));
    toast.success('Session started successfully');
  };

  const handleCancelSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, status: 'CANCELLED' as const } : session
    ));
    toast.success('Session cancelled');
  };

  const handleCompleteSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, status: 'COMPLETED' as const } : session
    ));
    toast.success('Session completed');
  };

  const handleCreateSession = async () => {
    if (!formData.startDateTime || !formData.endDateTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!userId) {
      console.error('userId is missing:', userId);
      toast.error('Doctor ID not found. Please login again.');
      return;
    }

    const payload = {
      doctorId: userId,
      sessionStartTime: formData.startDateTime,
      sessionEndTime: formData.endDateTime,
      maxAppointmentCount: formData.maxAppointments,
    };

    console.log('Creating session with payload:', payload);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.SESSIONS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      await fetchSessions(); // Refresh the sessions list
      setFormData({ startDateTime: '', endDateTime: '', maxAppointments: 10 });
      setIsDialogOpen(false);
      toast.success('Session created successfully');
    } catch (error) {
      toast.error('Failed to create session. Please try again.');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'CANCELLED': return 'destructive';
      case 'COMPLETED': return 'secondary';
      default: return 'outline';
    }
  };

  const getActionButton = (session: Session) => {
    switch (session.status) {
      case 'SCHEDULED':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleStartSession(session.id)}>
              <Play className="size-4 mr-1" />
              Start Session
            </Button>
            <Button size="sm" onClick={() => handleCompleteSession(session.id)}>
              <CheckCircle className="size-4 mr-1" />
              Complete
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleCancelSession(session.id)}>
              <X className="size-4 mr-1" />
              Cancel
            </Button>
          </div>
        );
      case 'CANCELLED':
        return (
          <Button size="sm" onClick={() => handleStartSession(session.id)}>
            <Play className="size-4 mr-1" />
            Reschedule
          </Button>
        );
      case 'COMPLETED':
        return <span className="text-muted-foreground">Session completed</span>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Sessions</CardTitle>
            <CardDescription>Manage your scheduled sessions</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startDateTime">Start Date & Time</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDateTime">End Date & Time</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAppointments">Maximum Appointments</Label>
                  <Input
                    id="maxAppointments"
                    type="number"
                    min="1"
                    value={formData.maxAppointments}
                    onChange={(e) => setFormData({ ...formData, maxAppointments: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>
                    Create Session
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(session.status)}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span>Date: {formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>Time: {formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span>Appointments: {session.bookedCount}/{session.capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {getActionButton(session)}
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sessions found. Create your first session to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}