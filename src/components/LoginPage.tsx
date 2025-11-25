import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { User, UserRole } from '../App';
import { Stethoscope } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    nicNumber: '',
    bloodGroup: ''
  });

  const handleLogin = async (role: UserRole) => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: role?.toUpperCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      const user: User = {
        id: data.userId,
        email: data.email,
        role: data.role.toLowerCase() as UserRole,
        name: data.name,
      };

      toast.success(data.message);
      onLogin(user);
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.contactNumber || !signupData.nicNumber || !signupData.bloodGroup) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      const user: User = {
        id: data.userId,
        email: data.email,
        role: data.role.toLowerCase() as UserRole,
        name: data.name,
      };

      toast.success(data.message);
      setIsSignupOpen(false);
      onLogin(user);
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="size-16 bg-primary rounded-full flex items-center justify-center">
              <Stethoscope className="size-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>HealthCare Management System</CardTitle>
          <CardDescription>Login to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <form onSubmit={(e) => { e.preventDefault(); handleLogin('patient'); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-password">Password</Label>
                  <Input
                    id="patient-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Login as Patient</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsSignupOpen(true)}>Sign Up as Patient</Button>
              </form>
            </TabsContent>

            <TabsContent value="doctor">
              <form onSubmit={(e) => { e.preventDefault(); handleLogin('doctor'); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-email">Email</Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-password">Password</Label>
                  <Input
                    id="doctor-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Login as Doctor</Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={(e) => { e.preventDefault(); handleLogin('admin'); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Login as Admin</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Patient Signup Dialog */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Up as Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                placeholder="John Doe"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="john.doe@example.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-contact">Contact Number</Label>
              <Input
                id="signup-contact"
                placeholder="+1234567890"
                value={signupData.contactNumber}
                onChange={(e) => setSignupData({ ...signupData, contactNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-nic">NIC Number</Label>
              <Input
                id="signup-nic"
                placeholder="123456789V"
                value={signupData.nicNumber}
                onChange={(e) => setSignupData({ ...signupData, nicNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-blood">Blood Group</Label>
              <Input
                id="signup-blood"
                placeholder="O+"
                value={signupData.bloodGroup}
                onChange={(e) => setSignupData({ ...signupData, bloodGroup: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsSignupOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSignup} disabled={loading}>Sign Up</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
