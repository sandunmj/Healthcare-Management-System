import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface DoctorProfileProps {
  userId: string;
  userEmail: string;
}

export default function DoctorProfile({ userId, userEmail }: DoctorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
    qualification: '',
    phone: '',
    bio: '',
    clinicAddress: '',
    availableDays: [],
    timeSlots: [],
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [userEmail]);

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.DOCTOR.ALL.replace('/doctor/all', `/doctor/query/${userEmail}`)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          specialty: data.specialization || '',
          experience: data.experienceYears?.toString() || '',
          qualification: data.qualifications || '',
          phone: data.contactNumber || '',
          bio: data.biography || '',
          clinicAddress: data.clinicAddress || '',
          availableDays: [],
          timeSlots: [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.DOCTOR.ALL.replace('/doctor/all', '/doctor/update')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          specialization: profile.specialty,
          experienceYears: parseInt(profile.experience) || 0,
          contactNumber: profile.phone,
          clinicAddress: profile.clinicAddress,
          qualifications: profile.qualification,
          biography: profile.bio,
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const toggleDay = (day: string) => {
    setProfile({
      ...profile,
      availableDays: profile.availableDays.includes(day)
        ? profile.availableDays.filter(d => d !== day)
        : [...profile.availableDays, day]
    });
  };

  const addTimeSlot = (time: string) => {
    if (time && !profile.timeSlots.includes(time)) {
      setProfile({
        ...profile,
        timeSlots: [...profile.timeSlots, time].sort()
      });
    }
  };

  const removeTimeSlot = (time: string) => {
    setProfile({
      ...profile,
      timeSlots: profile.timeSlots.filter(t => t !== time)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Doctor Profile</CardTitle>
              <CardDescription>Manage your professional information</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualifications</Label>
              <Input
                id="qualification"
                value={profile.qualification}
                onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicAddress">Clinic Address</Label>
              <Input
                id="clinicAddress"
                value={profile.clinicAddress}
                onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
