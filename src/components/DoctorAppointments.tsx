import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Calendar, Clock, User, Search, FileText, History, Pill, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { API_ENDPOINTS } from '../config/api';

interface Appointment {
  id: string;
  sessionId: string;
  patientId: string;
  patientName: string;
  bookedAt: string;
  status: string;
  date?: string;
  time?: string;
  specialty?: string;
}

interface PatientHistoryRecord {
  id: string;
  appointmentId: string;
  notes: string;
  medications: string;
  createdAt: string;
}

interface DoctorAppointmentsProps {
  appointments?: Appointment[];
  onUpdate?: (appointment: Appointment) => void;
}

export default function DoctorAppointments({ onUpdate }: DoctorAppointmentsProps) {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patientHistory, setPatientHistory] = useState<PatientHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [prescriptionList, setPrescriptionList] = useState<{name: string, dosage: string, frequency: string, duration: string, instructions: string}[]>([]);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Predefined medication list
  const medications = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Lisinopril',
    'Metformin',
    'Aspirin',
    'Omeprazole',
    'Simvastatin',
    'Amlodipine',
    'Cetirizine',
    'Azithromycin',
    'Ciprofloxacin',
    'Doxycycline',
    'Prednisone',
    'Warfarin'
  ];

  const filteredMedications = medications.filter(med => 
    med.toLowerCase().includes(medicationSearch.toLowerCase())
  );

  const fetchPatientHistory = async (patientId: string) => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.PRESCRIPTIONS.PATIENT(patientId), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatientHistory(data);
      } else {
        setPatientHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
      setPatientHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewHistory = (patientName: string, patientId: string) => {
    setSelectedPatient(patientId);
    setIsHistoryOpen(true);
    fetchPatientHistory(patientId);
  };

  const handlePrescribe = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setPrescriptionNotes('');
    setPrescriptionList([]);
    setMedicationSearch('');
    setSelectedMedication('');
    setDosage('');
    setIsPrescribeOpen(true);
  };

  const handleAddMedication = () => {
    if (!selectedMedication || !dosage.trim() || !frequency.trim()) {
      toast.error('Please fill in medication, dosage, and frequency');
      return;
    }
    
    setPrescriptionList(prev => [...prev, { 
      name: selectedMedication, 
      dosage, 
      frequency, 
      duration: duration || '30 days', 
      instructions: instructions || 'Take as directed' 
    }]);
    setSelectedMedication('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setInstructions('');
    setMedicationSearch('');
    setShowDropdown(false);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectMedication = (medication: string) => {
    setSelectedMedication(medication);
    setMedicationSearch(medication);
    setShowDropdown(false);
  };

  const handleSavePrescription = async () => {
    if (!prescriptionNotes.trim()) {
      toast.error('Please add notes');
      return;
    }
    if (prescriptionList.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.PRESCRIPTIONS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment,
          notes: prescriptionNotes,
          medications: prescriptionList,
        }),
      });

      if (response.ok) {
        toast.success('Prescription saved successfully');
        setIsPrescribeOpen(false);
      } else {
        throw new Error('Failed to save prescription');
      }
    } catch (error) {
      toast.error('Failed to save prescription');
    }
  };

  const handleMarkComplete = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment && onUpdate) {
      onUpdate({ ...appointment, status: 'completed' });
      toast.success('Appointment marked as completed');
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingAppointments = filteredAppointments.filter(apt => apt.status === 'booked' || apt.status === 'started');
  const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled');

  const renderAppointments = (appointmentList: Appointment[]) => {
    if (appointmentList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="size-12 mx-auto mb-4 opacity-50" />
          <p>No appointments</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {appointmentList.map(appointment => (
          <div key={appointment.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <h4>{appointment.patientName || 'Patient'}</h4>
                  <span className="text-xs text-muted-foreground">#{appointment.id}</span>
                </div>
                {appointment.specialty && (
                  <p className="text-muted-foreground">{appointment.specialty}</p>
                )}
              </div>
              <Badge variant={
                appointment.status === 'confirmed' ? 'default' :
                appointment.status === 'completed' ? 'secondary' :
                'destructive'
              }>
                {appointment.status}
              </Badge>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{appointment.time}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleViewHistory(appointment.patientName || 'Patient', appointment.patientId)}
                >
                  <History className="size-4 mr-1" />
                  View Patient History
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handlePrescribe(appointment.id)}
                >
                  <Pill className="size-4 mr-1" />
                  Prescribe
                </Button>
                {appointment.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleMarkComplete(appointment.id)}
                  >
                    <CheckCircle className="size-4 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
        <CardDescription>View and manage patient appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by appointment number or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            {renderAppointments(upcomingAppointments)}
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            {renderAppointments(completedAppointments)}
          </TabsContent>
          <TabsContent value="cancelled" className="mt-4">
            {renderAppointments(cancelledAppointments)}
          </TabsContent>
        </Tabs>

        {/* Patient History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient History</DialogTitle>
            </DialogHeader>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-muted-foreground">Loading patient history...</p>
              </div>
            ) : patientHistory.length > 0 ? (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 font-medium">Date & Time</th>
                      <th className="text-left p-4 font-medium">Notes</th>
                      <th className="text-left p-4 font-medium">Medicine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientHistory.map(record => {
                      let medications = [];
                      try {
                        medications = JSON.parse(record.medications);
                      } catch (e) {
                        medications = [];
                      }
                      
                      return (
                        <tr key={record.id} className="border-b last:border-b-0">
                          <td className="p-4 align-top">
                            <div className="text-sm">
                              <div className="font-medium">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-muted-foreground">
                                {new Date(record.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <p className="text-sm">{record.notes}</p>
                          </td>
                          <td className="p-4 align-top">
                            <div className="space-y-2">
                              {medications.map((med: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <div className="font-medium">{med.name} - {med.dosage}</div>
                                  <div className="text-muted-foreground">
                                    {med.frequency} for {med.duration}
                                  </div>
                                  {med.instructions && (
                                    <div className="text-muted-foreground text-xs">
                                      {med.instructions}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="size-12 mx-auto mb-4 opacity-50" />
                <p>No patient history available</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Prescription Dialog */}
        <Dialog open={isPrescribeOpen} onOpenChange={setIsPrescribeOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Prescription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter consultation notes and instructions..."
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Add Medications</Label>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medication *</Label>
                      <div className="relative">
                        <Input
                          placeholder="Search medication..."
                          value={medicationSearch}
                          onChange={(e) => {
                            setMedicationSearch(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                        />
                        {showDropdown && filteredMedications.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                            {filteredMedications.map(medication => (
                              <div
                                key={medication}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelectMedication(medication)}
                              >
                                {medication}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Input
                        placeholder="e.g., 10mg, 500mg"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <Input
                        placeholder="e.g., Once daily, Twice daily"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 30 days, 1 week"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Input
                      placeholder="e.g., Take with food, Take before meals"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddMedication} className="w-full">
                    Add Medication
                  </Button>
                  
                  {prescriptionList.length > 0 && (
                    <div className="space-y-2">
                      <Label>Prescribed Medications</Label>
                      {prescriptionList.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{item.name} - {item.dosage}</div>
                              <div className="text-sm text-muted-foreground">{item.frequency} for {item.duration}</div>
                              {item.instructions && <div className="text-sm text-muted-foreground">{item.instructions}</div>}
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveMedication(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPrescribeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePrescription}>
                  Save Prescription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
