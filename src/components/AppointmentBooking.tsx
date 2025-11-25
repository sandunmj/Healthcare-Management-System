import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Search, Calendar, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { API_ENDPOINTS } from '../config/api';

interface AppointmentBookingProps {
  patientId: string;
  onBook: (appointment: any) => void;
}

export default function AppointmentBooking({ patientId, onBook }: AppointmentBookingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.DOCTOR.ALL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        toast.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSessions = async (doctorId: string) => {
    setSessionsLoading(true);
    setAvailableSessions([]);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.SESSIONS.AVAILABLE(doctorId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSessions(data);
      } else {
        toast.error('Failed to fetch available sessions');
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to fetch available sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const specialties = Array.from(new Set(doctors.map(d => d.specialization || d.specialty)));

  const filteredDoctors = doctors.filter(doctor => {
    const specialty = doctor.specialization || doctor.specialty;
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSession) {
      toast.error('Please select a session');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please login again');
      return;
    }

    console.log('Booking appointment with sessionId:', selectedSession.id);
    console.log('Using token:', token.substring(0, 20) + '...');

    try {
      const response = await fetch(API_ENDPOINTS.APPOINTMENTS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: selectedSession.id,
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const appointment = {
          patientId,
          doctorId: selectedDoctor.userId || selectedDoctor.id,
          doctorName: selectedDoctor.name,
          specialty: selectedDoctor.specialization || selectedDoctor.specialty,
          date: selectedDate,
          time: selectedTime,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };

        onBook(appointment);
        toast.success('Appointment booked successfully!');
        
        // Reset form
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setSelectedSession(null);
        setAvailableSessions([]);
      } else if (response.status === 403) {
        toast.error('Access denied. Please login again.');
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        toast.error(`Failed to book appointment: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Doctor Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search for Doctors</CardTitle>
          <CardDescription>Find doctors by name, specialty, or availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Filter by Specialty</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-muted-foreground">Loading doctors...</p>
              </div>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoctor?.id === doctor.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    fetchAvailableSessions(doctor.userId || doctor.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4>{doctor.name}</h4>
                      <p className="text-muted-foreground">{doctor.specialization || doctor.specialty}</p>
                      <p className="text-muted-foreground">{doctor.experienceYears || doctor.experience} years experience</p>
                    </div>
                    <Badge variant="default">
                      Available
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="size-12 mx-auto mb-4 opacity-50" />
                <p>No doctors found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Book Appointment</CardTitle>
          <CardDescription>Select date and time slot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDoctor ? (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <h4>Selected Doctor</h4>
                <p className="text-muted-foreground">{selectedDoctor.name}</p>
                <p className="text-muted-foreground">{selectedDoctor.specialization || selectedDoctor.specialty}</p>
              </div>

              {selectedDoctor.availableDays && selectedDoctor.availableDays.length > 0 && (
                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.availableDays.map((day: string) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  <Calendar className="inline size-4 mr-2" />
                  Available Sessions
                </Label>
                {sessionsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading sessions...</p>
                  </div>
                ) : availableSessions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableSessions.map((session: any) => (
                      <div
                        key={session.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDate === session.date && selectedTime === `${session.startTime}-${session.endTime}` 
                            ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedDate(session.date);
                          setSelectedTime(`${session.startTime}-${session.endTime}`);
                          setSelectedSession(session);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.startTime === session.endTime 
                                ? new Date(`2000-01-01T${session.startTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                                : `${new Date(`2000-01-01T${session.startTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${new Date(`2000-01-01T${session.endTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                              }
                            </p>
                          </div>
                          <Badge variant="outline">
                            {session.bookedCount}/{session.capacity} booked
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No available sessions</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleBookAppointment} 
                className="w-full"
                disabled={!selectedSession}
              >
                Confirm Booking
              </Button>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="size-12 mx-auto mb-4 opacity-50" />
              <p>Please select a doctor from the list</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
