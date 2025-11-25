import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User } from '../App';
import { LogOut, UserCircle, Calendar, FileText, ClipboardList, Clock } from 'lucide-react';
import DoctorProfile from './DoctorProfile';
import MySessions from './MySessions';
import DoctorAppointments from './DoctorAppointments';
import { mockAppointments } from './mockData';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  console.log('DoctorDashboard user:', user);
  const [appointments, setAppointments] = useState(mockAppointments);

  const handleUpdateAppointment = (updatedAppointment: any) => {
    setAppointments(appointments.map(apt =>
      apt.id === updatedAppointment.id ? updatedAppointment : apt
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1>Doctor Portal</h1>
              <p className="text-muted-foreground">Welcome, Dr. {user.name}</p>
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
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <UserCircle className="size-4 mr-2" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Clock className="size-4 mr-2" />
              My Sessions
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="size-4 mr-2" />
              Appointments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <DoctorProfile userId={user.id} userEmail={user.email} />
          </TabsContent>

          <TabsContent value="sessions">
            <MySessions userId={user?.id} />
          </TabsContent>

          <TabsContent value="appointments">
            <DoctorAppointments onUpdate={handleUpdateAppointment} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
