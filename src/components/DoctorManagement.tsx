import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, Edit, UserPlus, Clock } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  email: string;
  phone: string;
  password?: string;
  specialization: string;
  experienceYears: number;
  contactNumber: string;
  clinicAddress: string;
  qualifications: string;
  biography: string;
  available: boolean;
  availableDays: string[];
  timeSlots: string[];
}

interface DoctorManagementProps {
  doctors: Doctor[];
  onUpdate: (doctor: Doctor) => void;
  onCreate: (doctor: Omit<Doctor, 'id'>) => void;
}

export default function DoctorManagement({ doctors, onUpdate, onCreate }: DoctorManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const commonTimeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const emptyDoctor = {
    name: '',
    specialty: '',
    experience: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    experienceYears: 0,
    contactNumber: '',
    clinicAddress: '',
    qualifications: '',
    biography: '',
    available: true,
    availableDays: [],
    timeSlots: [],
  };

  const [formData, setFormData] = useState(emptyDoctor);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData(emptyDoctor);
    setEditingDoctor(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setIsCreating(false);
    setEditingDoctor(doctor);
    setFormData(doctor);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isCreating) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_ENDPOINTS.DOCTOR.ALL.replace('/doctor/all', '/admin/create-doctor')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password || 'doctorPassword123',
            specialization: formData.specialization,
            experienceYears: formData.experienceYears || 0,
            contactNumber: formData.contactNumber,
            clinicAddress: formData.clinicAddress,
            qualifications: formData.qualifications,
            biography: formData.biography,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create doctor');
        }

        const data = await response.json();
        onCreate({ ...formData, id: data.userId || Math.random().toString() });
        toast.success('Doctor profile created successfully');
      } catch (error) {
        toast.error('Failed to create doctor profile');
        return;
      }
    } else if (editingDoctor) {
      onUpdate({ ...formData, id: editingDoctor.id });
      toast.success('Doctor profile updated successfully');
    }

    setIsDialogOpen(false);
    setFormData(emptyDoctor);
  };

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      availableDays: formData.availableDays.includes(day)
        ? formData.availableDays.filter(d => d !== day)
        : [...formData.availableDays, day]
    });
  };

  const toggleTimeSlot = (slot: string) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.includes(slot)
        ? formData.timeSlots.filter(s => s !== slot)
        : [...formData.timeSlots, slot]
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Doctor Management</CardTitle>
            <CardDescription>Create and edit doctor profiles</CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            Add Doctor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {doctors.map(doctor => (
            <div key={doctor.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h4>{doctor.name}</h4>
                    <Badge variant={doctor.available ? 'default' : 'secondary'}>
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-muted-foreground">
                    <div>
                      <span>Specialty:</span> {doctor.specialty}
                    </div>
                    <div>
                      <span>Experience:</span> {doctor.experience} years
                    </div>
                    <div>
                      <span>Email:</span> {doctor.email}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableDays.slice(0, 3).map(day => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                    {doctor.availableDays.length > 3 && (
                      <Badge variant="outline">+{doctor.availableDays.length - 3} more</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Create Doctor Profile' : 'Edit Doctor Profile'}
              </DialogTitle>
              <DialogDescription>
                {isCreating ? 'Add a new doctor to the system' : 'Update doctor information'}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">
                  <UserPlus className="size-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="availability">
                  <Clock className="size-4 mr-2" />
                  Availability
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="Cardiology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinicAddress">Clinic Address</Label>
                    <Input
                      id="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                      placeholder="123 Medical Center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      placeholder="MD, FACC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biography">Biography</Label>
                    <Input
                      id="biography"
                      value={formData.biography}
                      onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                      placeholder="Experienced cardiologist"
                    />
                  </div>
                  {isCreating && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Leave empty for default password"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Label>Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {allDays.map(day => (
                      <Badge
                        key={day}
                        variant={formData.availableDays.includes(day) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Time Slots</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTimeSlots.map(slot => (
                      <Badge
                        key={slot}
                        variant={formData.timeSlots.includes(slot) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTimeSlot(slot)}
                      >
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isCreating ? 'Create' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
