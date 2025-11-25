import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, UserCheck, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface AdminReportsProps {
  appointments: any[];
  doctors: any[];
  patients: any[];
}

export default function AdminReports({ appointments, doctors, patients }: AdminReportsProps) {
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  const appointmentsBySpecialty = doctors.reduce((acc: any[], doctor) => {
    const count = appointments.filter(a => a.specialty === doctor.specialty).length;
    const existing = acc.find(item => item.specialty === doctor.specialty);
    if (existing) {
      existing.count += count;
    } else if (count > 0) {
      acc.push({ specialty: doctor.specialty, count });
    }
    return acc;
  }, []);

  const appointmentsByStatus = [
    { name: 'Confirmed', value: confirmedAppointments, color: '#030213' },
    { name: 'Completed', value: completedAppointments, color: '#717182' },
    { name: 'Cancelled', value: cancelledAppointments, color: '#d4183d' },
  ];

  const handleGenerateReport = () => {
    toast.success('Generating summary report...');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl">{totalAppointments}</div>
                <p className="text-muted-foreground">All time</p>
              </div>
              <Calendar className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl">{doctors.length}</div>
                <p className="text-muted-foreground">Active</p>
              </div>
              <UserCheck className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl">{patients.length}</div>
                <p className="text-muted-foreground">Registered</p>
              </div>
              <Users className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl">
                  {totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}%
                </div>
                <p className="text-muted-foreground">Success rate</p>
              </div>
              <TrendingUp className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Button */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Reports</CardTitle>
          <CardDescription>Generate comprehensive system reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointments by Specialty</CardTitle>
            <CardDescription>Distribution of appointments across specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentsBySpecialty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="specialty" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#030213" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
