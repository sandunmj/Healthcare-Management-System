import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User } from '../App';
import { LogOut, BarChart3, Users, UserCog } from 'lucide-react';
import DoctorManagement from './DoctorManagement';
import { mockDoctors, mockAppointments, mockPatients } from './mockData';
import { API_ENDPOINTS } from '../config/api';

// Lazy load AdminReports to reduce initial memory usage (it imports recharts)
const AdminReports = lazy(() => import('./AdminReports'));

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.DOCTOR.ALL.replace('/doctor/all', '/admin/doctors')}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map API response to match component interface
        const mappedDoctors = data.map((doctor: any) => ({
          id: doctor.id || doctor.userId,
          name: doctor.name,
          specialty: doctor.specialization,
          specialization: doctor.specialization,
          experience: doctor.experienceYears?.toString() || '0',
          experienceYears: doctor.experienceYears || 0,
          email: doctor.email,
          phone: doctor.contactNumber,
          contactNumber: doctor.contactNumber,
          clinicAddress: doctor.clinicAddress,
          qualifications: doctor.qualifications,
          biography: doctor.biography,
          available: true,
          availableDays: [],
          timeSlots: [],
        }));
        setDoctors(mappedDoctors);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctor = (updatedDoctor: any) => {
    setDoctors(doctors.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc));
  };

  const handleCreateDoctor = (newDoctor: any) => {
    setDoctors([...doctors, { ...newDoctor, id: Math.random().toString(36).substr(2, 9) }]);
    fetchDoctors(); // Refresh the list after creation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1>Admin Portal</h1>
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
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">
              <BarChart3 className="size-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="doctors">
              <UserCog className="size-4 mr-2" />
              Doctor Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-muted-foreground">Loading reports...</p>
                </div>
              </div>
            }>
              <AdminReports
                appointments={mockAppointments}
                doctors={doctors}
                patients={mockPatients}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorManagement
              doctors={doctors}
              onUpdate={handleUpdateDoctor}
              onCreate={handleCreateDoctor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
