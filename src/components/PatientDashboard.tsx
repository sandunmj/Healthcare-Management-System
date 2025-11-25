import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User } from '../App';
import { Calendar, LogOut, FileText, Bell, Search } from 'lucide-react';
import AppointmentBooking from './AppointmentBooking';
import PatientAppointments from './PatientAppointments';
import PatientPrescriptions from './PatientPrescriptions';
import { mockAppointments, mockPrescriptions } from './mockData';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [appointments, setAppointments] = useState(
    mockAppointments.filter(apt => apt.patientId === user.id)
  );
  const [prescriptions] = useState(
    mockPrescriptions.filter(rx => rx.patientId === user.id)
  );

  const handleBookAppointment = (newAppointment: any) => {
    setAppointments([...appointments, { ...newAppointment, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1>Patient Portal</h1>
              <p className="text-muted-foreground">Welcome, {user.name}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">
              <Calendar className="size-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="book">
              <Search className="size-4 mr-2" />
              Book Appointment
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <FileText className="size-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="size-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <PatientAppointments
              onCancel={handleCancelAppointment}
            />
          </TabsContent>

          <TabsContent value="book">
            <AppointmentBooking
              patientId={user.id}
              onBook={handleBookAppointment}
            />
          </TabsContent>

          <TabsContent value="prescriptions">
            <PatientPrescriptions prescriptions={prescriptions} />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Your recent notifications and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments
                  .filter(apt => apt.status === 'confirmed')
                  .slice(0, 3)
                  .map(apt => (
                    <div key={apt.id} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                      <Bell className="size-5 text-blue-600 mt-0.5" />
                      <div>
                        <p>Appointment Confirmed</p>
                        <p className="text-muted-foreground">
                          Your appointment with Dr. {apt.doctorName} is scheduled for {apt.date} at {apt.time}
                        </p>
                      </div>
                    </div>
                  ))}
                {appointments.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No notifications</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
