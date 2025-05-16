import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Car, User, Lock, Star } from 'lucide-react';
import DriverLayout from '@/components/layouts/DriverLayout';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  driverProfile?: DriverProfile;
}

interface DriverProfile {
  address: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_plate_number: string;
  driver_license: string;
  profile_picture?: string;
  rating: number;
  is_verified: boolean;
  is_available: boolean;
}

const API_BASE_URL = 'http://localhost:8000/api';

const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Motorcycle",
  "Bicycle",
  "Other"
];

const DriverProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    driver_license: '',
    profile_picture: '',
  });

  const [vehicleData, setVehicleData] = useState({
    vehicle_type: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_plate_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [availability, setAvailability] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userRes = await fetch(`${API_BASE_URL}/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) throw new Error('Unauthorized');

        const userData = await userRes.json();
        const { user } = userData;

        // Fetch driver profile data
        const profileRes = await fetch(`${API_BASE_URL}/driver/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileRes.ok) throw new Error('Failed to load profile');

        const profileData = await profileRes.json();

        setUser(user);
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: profileData.profile.address || '',
          driver_license: profileData.profile.driver_license || '',
          profile_picture: profileData.profile.profile_picture || '',
        });
        setVehicleData({
          vehicle_type: profileData.profile.vehicle_type || '',
          vehicle_model: profileData.profile.vehicle_model || '',
          vehicle_color: profileData.profile.vehicle_color || '',
          vehicle_plate_number: profileData.profile.vehicle_plate_number || '',
        });
        setAvailability(profileData.profile.is_available || false);

        setLoading(false);
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Profile handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  // Vehicle handlers
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleVehicleSelect = (name: string, value: string) => {
    setVehicleData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  // Password handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const clearError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Form submissions
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/driver/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update the user state
      setUser(prev => prev ? {
        ...prev,
        name: profileData.name,
        phone: profileData.phone,
        driverProfile: {
          ...prev.driverProfile,
          address: profileData.address,
          driver_license: profileData.driver_license,
          profile_picture: profileData.profile_picture
        }
      } : null);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/driver/profile/vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.message || 'Failed to update vehicle information');
      }

      // Update the user state
      setUser(prev => prev ? {
        ...prev,
        driverProfile: {
          ...prev.driverProfile,
          vehicle_type: vehicleData.vehicle_type,
          vehicle_model: vehicleData.vehicle_model,
          vehicle_color: vehicleData.vehicle_color,
          vehicle_plate_number: vehicleData.vehicle_plate_number
        }
      } : null);

      toast({
        title: 'Success',
        description: 'Vehicle information updated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update vehicle information',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          password: passwordData.new_password,
          password_confirmation: passwordData.confirm_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.message || 'Failed to update password');
      }

      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update password',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/driver/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: checked }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update availability');
      }

      setAvailability(checked);
      setUser(prev => prev ? {
        ...prev,
        driverProfile: {
          ...prev.driverProfile,
          is_available: checked
        }
      } : null);

      toast({
        title: 'Success',
        description: `You are now ${checked ? 'available' : 'unavailable'} for deliveries`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update availability',
        variant: 'destructive',
      });
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Driver Profile</h1>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="col-span-1">
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage
                      src={profileData.profile_picture || user?.driverProfile?.profile_picture}
                      alt="Profile picture"
                  />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{profileData.name || user?.name}</h2>
                <p className="text-muted-foreground">{profileData.email || user?.email}</p>

                <div className="mt-4 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <Badge variant="outline" className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {user?.driverProfile?.rating?.toFixed(1) || '5.0'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={user?.driverProfile?.is_verified ? 'default' : 'secondary'}>
                      {user?.driverProfile?.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="col-span-1 md:col-span-3">
              <Tabs defaultValue="general">
                <TabsList className="mb-4">
                  <TabsTrigger value="general" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> General
                  </TabsTrigger>
                  <TabsTrigger value="vehicle" className="flex items-center gap-2">
                    <Car className="h-4 w-4" /> Vehicle
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Security
                  </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                required
                            />
                            {formErrors.name && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.name[0]}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input name="email" value={profileData.email} disabled />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                            />
                            {formErrors.phone && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.phone[0]}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="driver_license">Driver License</Label>
                            <Input
                                name="driver_license"
                                value={profileData.driver_license}
                                onChange={handleProfileChange}
                                required
                            />
                            {formErrors.driver_license && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.driver_license[0]}</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                name="address"
                                value={profileData.address}
                                onChange={handleProfileChange}
                            />
                            {formErrors.address && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.address[0]}</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="profile_picture">Profile Picture URL</Label>
                            <Input
                                name="profile_picture"
                                value={profileData.profile_picture}
                                onChange={handleProfileChange}
                                placeholder="https://example.com/profile.jpg"
                            />
                            {formErrors.profile_picture && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.profile_picture[0]}</p>
                            )}
                            {profileData.profile_picture && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground">Preview:</p>
                                  <img
                                      src={profileData.profile_picture}
                                      alt="Profile preview"
                                      className="h-20 w-20 object-cover rounded-md mt-1 border"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                  />
                                </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vehicle Tab */}
                <TabsContent value="vehicle">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Information</CardTitle>
                      <CardDescription>Update your vehicle details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleVehicleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vehicle_type">Vehicle Type</Label>
                            <Select
                                value={vehicleData.vehicle_type}
                                onValueChange={(value) => handleVehicleSelect('vehicle_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.vehicle_type && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.vehicle_type[0]}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="vehicle_model">Model</Label>
                            <Input
                                name="vehicle_model"
                                value={vehicleData.vehicle_model}
                                onChange={handleVehicleChange}
                            />
                            {formErrors.vehicle_model && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.vehicle_model[0]}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="vehicle_color">Color</Label>
                            <Input
                                name="vehicle_color"
                                value={vehicleData.vehicle_color}
                                onChange={handleVehicleChange}
                            />
                            {formErrors.vehicle_color && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.vehicle_color[0]}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="vehicle_plate_number">License Plate</Label>
                            <Input
                                name="vehicle_plate_number"
                                value={vehicleData.vehicle_plate_number}
                                onChange={handleVehicleChange}
                            />
                            {formErrors.vehicle_plate_number && (
                                <p className="text-sm text-red-500 mt-1">{formErrors.vehicle_plate_number[0]}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit">Save Vehicle Info</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="current_password">Current Password</Label>
                          <Input
                              type="password"
                              name="current_password"
                              value={passwordData.current_password}
                              onChange={handlePasswordChange}
                              required
                          />
                          {formErrors.current_password && (
                              <p className="text-sm text-red-500 mt-1">{formErrors.current_password[0]}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="new_password">New Password</Label>
                          <Input
                              type="password"
                              name="new_password"
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              required
                          />
                          {formErrors.new_password && (
                              <p className="text-sm text-red-500 mt-1">{formErrors.new_password[0]}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="confirm_password">Confirm New Password</Label>
                          <Input
                              type="password"
                              name="confirm_password"
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              required
                          />
                          {formErrors.confirm_password && (
                              <p className="text-sm text-red-500 mt-1">{formErrors.confirm_password[0]}</p>
                          )}
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