import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import DriverLayout from '@/components/layouts/DriverLayout';

const DriverProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    vehicle_type: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        setUser(data.user);
        setProfile(data.user.driverProfile);

        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          license_number: data.user.driverProfile?.license_number || '',
          vehicle_type: data.user.driverProfile?.vehicle_type || '',
        });

        setLoading(false);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/driver/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          password: passwordData.new_password,
          password_confirmation: passwordData.confirm_password,
        }),
      });

      if (!response.ok) throw new Error('Failed to update password');

      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      toast({ title: 'Success', description: 'Password updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update password', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DriverLayout>
        <div className="container px-4 py-8 text-center">
          <p>Loading profile...</p>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Driver Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="col-span-1">
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile?.profile_picture} />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <span className="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">Driver</span>
            </CardContent>
          </Card>

          <div className="col-span-1 md:col-span-3">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input name="email" value={formData.email} disabled />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="license_number">License Number</Label>
                          <Input name="license_number" value={formData.license_number} onChange={handleInputChange} />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="vehicle_type">Vehicle Type</Label>
                          <Input name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required />
                      </div>
                      <div>
                        <Label htmlFor="new_password">New Password</Label>
                        <Input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required />
                      </div>
                      <div>
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">Update Password</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverProfile;
