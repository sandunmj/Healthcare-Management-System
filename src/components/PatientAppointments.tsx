import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, User, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { API_ENDPOINTS } from '../config/api';

interface Appointment {
  id: string;
  sessionId: string;
  patientId: string;
  bookedAt: string;
  status: string;
  patientName: string | null;
  doctorName: string;
  date?: string;
  time?: string;
  specialty?: string;
}

interface PatientAppointmentsProps {
  appointments?: Appointment[];
  onCancel?: (id: string) => void;
}

export default function PatientAppointments({ onCancel }: PatientAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS.LIST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map API response to component format
        const mappedAppointments = data.map((apt: any) => {
          const bookedDate = new Date(apt.bookedAt);
          return {
            ...apt,
            date: bookedDate.toLocaleDateString(),
            time: bookedDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: apt.status.toLowerCase(),
            specialty: 'General Medicine',
          };
        });
        setAppointments(mappedAppointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = (id: string) => {
    onCancel(id);
    toast.success('Appointment cancelled');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'booked':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-muted-foreground">Loading appointments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Appointments</CardTitle>
        <CardDescription>View and manage your appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="size-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled</p>
            </div>
          ) : (
            appointments.map(appointment => (
              <div key={appointment.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4>{appointment.doctorName}</h4>
                    <p className="text-muted-foreground">{appointment.specialty}</p>
                  </div>
                  <Badge variant={getStatusVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{appointment.time}</span>
                  </div>
                </div>

                {appointment.status === 'booked' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <XCircle className="size-4 mr-2" />
                        Cancel Appointment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this appointment with {appointment.doctorName}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancel(appointment.id)}>
                          Cancel Appointment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
