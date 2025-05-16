import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Package,
  TrendingUp,
  CheckCircle,
  Loader2,
  MapPin,
  Truck,
  Users,
  Star,
  Car,
  User,
  X,
} from 'lucide-react';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { toast } from '@/components/ui/use-toast';
import LiveChat from '@/components/LiveChat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Driver {
  name: string;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  vehicle_info: {
    type: string;
    model: string;
    color: string;
    plate_number: string;
  };
  profile_picture: string;
}

interface Stats {
  completed_deliveries: number;
  active_deliveries: number;
  today_earnings: number;
  week_earnings: number;
  total_earnings: number;
}

interface Delivery {
  id: string;
  tracking_number: string;
  status: string;
  created_at: string;
  pickup_address: string;
  delivery_address: string;
  price: number;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  payment?: {
    status: string;
    amount: number;
  };
}

interface DashboardData {
  driver: Driver;
  stats: Stats;
  recent_deliveries: Delivery[];
  pending_deliveries?: Delivery[];
  active_delivery?: Delivery & {
    pickup_contact: string;
    pickup_phone: string;
    recipient_name: string;
    recipient_phone: string;
    package_size: string;
    package_weight: number;
    package_description: string;
    is_fragile: boolean;
    delivery_instructions: string;
    status_history: Array<{
      status: string;
      notes: string;
      location: string;
      created_at: string;
    }>;
  };
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDeliveryId, setChatDeliveryId] = useState('');
  const [chatClientName, setChatClientName] = useState('');

  // Dialog states
  const [deliveryDetailsOpen, setDeliveryDetailsOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [deliveriesDialogOpen, setDeliveriesDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login?type=driver');
          return;
        }

        // Fetch dashboard data
        const dashboardResponse = await fetch('http://localhost:8000/api/driver/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await dashboardResponse.json();
        setDashboardData(data);

        // Check for active delivery
        const activeDelivery = data.recent_deliveries.find(
            (delivery: Delivery) => ['accepted', 'picked_up', 'in_transit'].includes(delivery.status)
        );

        if (activeDelivery) {
          // Fetch full details of active delivery
          const deliveryResponse = await fetch(`http://localhost:8000/api/driver/deliveries/${activeDelivery.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (deliveryResponse.ok) {
            const deliveryData = await deliveryResponse.json();
            setDashboardData(prev => ({
              ...prev!,
              active_delivery: deliveryData.delivery
            }));
          }
        }

        // Fetch pending deliveries if driver is available
        if (data.driver.is_available) {
          const pendingResponse = await fetch('http://localhost:8000/api/driver/deliveries?status=pending', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            setDashboardData(prev => ({
              ...prev!,
              pending_deliveries: pendingData.deliveries
            }));
          }
        }

        // Get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              async (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                setCurrentLocation(location);
                setLocationStatus('success');

                // Update driver location in backend
                await fetch('http://localhost:8000/api/driver/location', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(location),
                });
              },
              () => {
                setLocationStatus('error');
                toast({
                  title: 'Location Error',
                  description: 'Could not access your location. Please enable location services.',
                  variant: 'destructive',
                });
              }
          );
        } else {
          setLocationStatus('error');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login?type=driver');
        return;
      }

      const newAvailability = !dashboardData?.driver.is_available;
      const response = await fetch('http://localhost:8000/api/driver/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_available: newAvailability }),
      });

      if (response.ok) {
        setDashboardData(prev => prev ? {
          ...prev,
          driver: {
            ...prev.driver,
            is_available: newAvailability
          }
        } : null);
        toast({
          title: newAvailability ? 'You are now online' : 'You are now offline',
          description: newAvailability ?
              'You will now receive delivery requests' :
              'You will not receive new delivery requests',
        });

        // If becoming available, fetch pending deliveries
        if (newAvailability) {
          const pendingResponse = await fetch('http://localhost:8000/api/driver/deliveries?status=pending', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            setDashboardData(prev => prev ? {
              ...prev,
              pending_deliveries: pendingData.deliveries
            } : null);
          }
        }
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability status',
        variant: 'destructive',
      });
    }
  };

  const updateLocation = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login?type=driver');
        return;
      }

      if (navigator.geolocation) {
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setCurrentLocation(location);

              const response = await fetch('http://localhost:8000/api/driver/location', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(location),
              });

              if (response.ok) {
                setLocationStatus('success');
                toast({
                  title: 'Location Updated',
                  description: 'Your location has been successfully updated',
                });
              } else {
                setLocationStatus('error');
                throw new Error('Failed to update location');
              }
            },
            () => {
              setLocationStatus('error');
              toast({
                title: 'Location Error',
                description: 'Could not access your location. Please enable location services.',
                variant: 'destructive',
              });
            }
        );
      } else {
        setLocationStatus('error');
        toast({
          title: 'Location Error',
          description: 'Geolocation is not supported by this browser.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location',
        variant: 'destructive',
      });
    }
  };

  const handleChatOpen = (deliveryId: string, clientName: string) => {
    setChatDeliveryId(deliveryId);
    setChatClientName(clientName);
    setIsChatOpen(true);
  };

  const handleUpdateStatus = (deliveryId: string) => {
    navigate(`/driver/deliveries/${deliveryId}/status`);
  };

  const acceptDelivery = async (deliveryId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login?type=driver');
        return;
      }

      const response = await fetch(
          `http://localhost:8000/api/driver/deliveries/${deliveryId}/accept`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept delivery');
      }

      const data = await response.json();

      toast({
        title: 'Delivery Accepted',
        description: data.message || 'You have successfully accepted the delivery',
      });

      // Refresh dashboard data
      const dashboardResponse = await fetch('http://localhost:8000/api/driver/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboardData(dashboardData);
      }
    } catch (error: any) {
      console.error('Error accepting delivery:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept delivery',
        variant: 'destructive',
      });
    }
  };

  const openDeliveryDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryDetailsOpen(true);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!dashboardData) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p>Failed to load dashboard data</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b py-4 px-4 md:px-6 bg-background sticky top-0 z-10">
          <div className="flex flex-col md:flex-row justify-between items-center container">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold">Driver Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {dashboardData.driver.name}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                    id="availability"
                    checked={dashboardData.driver.is_available}
                    onCheckedChange={toggleAvailability}
                    disabled={!dashboardData.driver.is_verified}
                />
                <Label htmlFor="availability" className="font-medium">
                  {dashboardData.driver.is_available ? (
                      <span className="text-green-600 flex items-center">
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Available
                      </span>
                  ) : (
                      <span className="text-gray-500">Offline</span>
                  )}
                </Label>
              </div>

              <Button variant="outline" onClick={() => setProfileDialogOpen(true)}>
                <User className="h-4 w-4 mr-2" /> Driver Profile
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-6 px-4 md:px-6">
          {/* Pending Deliveries */}
          {dashboardData.pending_deliveries && dashboardData.pending_deliveries.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Available Deliveries</CardTitle>
                  <CardDescription>New delivery requests waiting for acceptance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.pending_deliveries.map((delivery) => (
                      <Card key={delivery.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">#{delivery.tracking_number}</h3>
                                <Badge variant="secondary">Pending</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(delivery.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${delivery.price?.toFixed(2) || '0.00'}</div>
                              <div className="text-sm text-muted-foreground">Earning: ${(delivery.price * 0.8)?.toFixed(2) || '0.00'}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">From</p>
                              <p className="text-sm truncate">{delivery.pickup_address}</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">To</p>
                              <p className="text-sm truncate">{delivery.delivery_address}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeliveryDetails(delivery)}
                            >
                              View Details
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => acceptDelivery(delivery.id)}
                                disabled={loading}
                            >
                              Accept Delivery
                            </Button>
                          </div>
                        </div>
                      </Card>
                  ))}
                </CardContent>
              </Card>
          )}

          {/* Driver Status Bar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Card className="flex-1 min-w-[200px]">
              <CardContent className="flex items-center p-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-semibold">{dashboardData.driver.rating.toFixed(1)}/5.0</p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[200px]">
              <CardContent className="flex items-center p-4">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold">{dashboardData.stats.completed_deliveries}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[200px]">
              <CardContent className="flex items-center p-4">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <Car className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="text-xl font-semibold">{dashboardData.driver.vehicle_info.type}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Earnings Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Earnings</CardTitle>
                <CardDescription>Your latest earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${dashboardData.stats.total_earnings.toFixed(2)}</div>
                <p className="text-muted-foreground text-sm">Total earnings</p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xl font-semibold">${dashboardData.stats.today_earnings.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">Today</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">${dashboardData.stats.week_earnings.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">This week</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={() => setEarningsDialogOpen(true)}>
                  <TrendingUp className="w-4 h-4 mr-2" /> View Earnings
                </Button>
              </CardFooter>
            </Card>

            {/* Delivery Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Delivery Stats</CardTitle>
                <CardDescription>Your delivery performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Active Deliveries</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-50">
                    {dashboardData.stats.active_deliveries}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Completed</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50">
                    {dashboardData.stats.completed_deliveries}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Available Jobs</span>
                  </div>
                  <Badge variant="outline" className="bg-purple-50">
                    {dashboardData.stats.active_deliveries > 0 ? 0 : 5}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={() => setDeliveriesDialogOpen(true)}>
                  <Truck className="w-4 h-4 mr-2" /> View All Deliveries
                </Button>
              </CardFooter>
            </Card>

            {/* Current Location */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Location</CardTitle>
                <CardDescription>Your real-time position</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="h-[180px] bg-muted rounded-md overflow-hidden">
                  {locationStatus === 'loading' ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                  ) : locationStatus === 'error' ? (
                      <div className="h-full flex items-center justify-center text-center p-4">
                        <p className="text-sm text-muted-foreground">
                          Could not access your location. Please enable location services.
                        </p>
                      </div>
                  ) : (
                      <GoogleMapComponent
                          driverLocation={currentLocation}
                          isLive={true}
                          height="180px"
                      />
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={updateLocation}
                    disabled={locationStatus === 'loading'}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {locationStatus === 'loading' ? 'Updating...' : 'Update Location'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Active Delivery */}
          {dashboardData.active_delivery && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Active Delivery</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {dashboardData.active_delivery.status.charAt(0).toUpperCase() +
                          dashboardData.active_delivery.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Tracking #</p>
                          <p className="font-medium">{dashboardData.active_delivery.tracking_number}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Client</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{dashboardData.active_delivery.client.name}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleChatOpen(
                                    dashboardData.active_delivery!.id,
                                    dashboardData.active_delivery!.client.name
                                )}
                            >
                              Chat with Client
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Pickup Address</p>
                            <p>{dashboardData.active_delivery.pickup_address}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                            <p>{dashboardData.active_delivery.delivery_address}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Package Details</p>
                            <p>
                              {dashboardData.active_delivery.package_size} - {dashboardData.active_delivery.package_weight}kg
                            </p>
                            {dashboardData.active_delivery.is_fragile && (
                                <Badge variant="destructive" className="mt-1">Fragile</Badge>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                            <p>{dashboardData.active_delivery.delivery_instructions || 'None'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6">
                          <Button onClick={() => navigate(`/driver/deliveries/${dashboardData.active_delivery!.id}`)}>
                            View Details
                          </Button>
                          <Button
                              variant="outline"
                              onClick={() => handleUpdateStatus(dashboardData.active_delivery!.id)}
                          >
                            Update Status
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-[200px]">
                        <GoogleMapComponent
                            pickupAddress={dashboardData.active_delivery.pickup_address}
                            deliveryAddress={dashboardData.active_delivery.delivery_address}
                            driverLocation={currentLocation}
                            height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Recent Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>Your recent delivery history</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recent_deliveries?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recent_deliveries.map((delivery) => (
                        <Card key={delivery.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">#{delivery.tracking_number}</h3>
                                  <Badge variant={delivery.status === 'delivered' ? 'outline' : undefined}>
                                    {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(delivery.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${delivery.price?.toFixed(2) || '0.00'}</div>
                                <div className="text-sm text-muted-foreground">Earning: ${(delivery.price * 0.8)?.toFixed(2) || '0.00'}</div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">From</p>
                                <p className="text-sm truncate">{delivery.pickup_address}</p>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">To</p>
                                <p className="text-sm truncate">{delivery.delivery_address}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeliveryDetails(delivery)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No past deliveries yet</p>
                  </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" onClick={() => setDeliveriesDialogOpen(true)}>
                View All Deliveries
              </Button>
            </CardFooter>
          </Card>
        </main>

        {/* Live Chat Component */}
        <LiveChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            deliveryId={chatDeliveryId}
            driverName={chatClientName}
        />

        {/* Delivery Details Dialog */}
        <Dialog open={deliveryDetailsOpen} onOpenChange={setDeliveryDetailsOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>
                Tracking #: {selectedDelivery?.tracking_number}
              </DialogDescription>
            </DialogHeader>
            {selectedDelivery && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                      <Badge>
                        {selectedDelivery.status.charAt(0).toUpperCase() + selectedDelivery.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Price</h4>
                      <p>${selectedDelivery.price?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Pickup Address</h4>
                      <p>{selectedDelivery.pickup_address}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery Address</h4>
                      <p>{selectedDelivery.delivery_address}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Client</h4>
                    <p>{selectedDelivery.client.name}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                    <p>{new Date(selectedDelivery.created_at).toLocaleString()}</p>
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button onClick={() => setDeliveryDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Earnings Dialog */}
        <Dialog open={earningsDialogOpen} onOpenChange={setEarningsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Your Earnings</DialogTitle>
              <DialogDescription>
                Detailed breakdown of your earnings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardData.stats.today_earnings.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardData.stats.week_earnings.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardData.stats.total_earnings.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center py-4">
                <Button onClick={() => navigate('/driver/earnings')}>View Full Earnings History</Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setEarningsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deliveries Dialog */}
        <Dialog open={deliveriesDialogOpen} onOpenChange={setDeliveriesDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Your Deliveries</DialogTitle>
              <DialogDescription>
                Overview of all your deliveries
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.stats.active_deliveries}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.stats.completed_deliveries}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.active_deliveries + dashboardData.stats.completed_deliveries}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center py-4">
                <Button onClick={() => navigate('/driver/deliveries')}>View Full Delivery History</Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDeliveriesDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Driver Profile</DialogTitle>
              <DialogDescription>
                Your driver profile information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 rounded-full p-2">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{dashboardData.driver.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.driver.is_verified ? (
                        <span className="text-green-600">Verified Driver</span>
                    ) : (
                        <span className="text-yellow-600">Verification Pending</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Rating</h4>
                  <p>{dashboardData.driver.rating.toFixed(1)}/5.0</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <p>
                    {dashboardData.driver.is_available ? (
                        <span className="text-green-600">Available</span>
                    ) : (
                        <span className="text-gray-500">Offline</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Vehicle Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p><span className="font-medium">Type:</span> {dashboardData.driver.vehicle_info.type}</p>
                  <p><span className="font-medium">Model:</span> {dashboardData.driver.vehicle_info.model}</p>
                  <p><span className="font-medium">Color:</span> {dashboardData.driver.vehicle_info.color}</p>
                  <p><span className="font-medium">Plate:</span> {dashboardData.driver.vehicle_info.plate_number}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => navigate('/driver/profile')}>Edit Profile</Button>
              <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default DriverDashboard;