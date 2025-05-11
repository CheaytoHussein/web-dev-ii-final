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
} from 'lucide-react';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { toast } from '@/components/ui/use-toast';
import LiveChat from '@/components/LiveChat';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDeliveryId, setChatDeliveryId] = useState('');
  const [chatClientName, setChatClientName] = useState('');

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

        const dashboardData = await dashboardResponse.json();
        setDashboardData(dashboardData);

        // Fetch driver availability status
        const availabilityResponse = await fetch('http://localhost:8000/api/driver/availability', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          setIsAvailable(availabilityData.isAvailable);
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

      const response = await fetch('http://localhost:8000/api/driver/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
        toast({
          title: !isAvailable ? 'You are now online' : 'You are now offline',
          description: !isAvailable ?
              'You will now receive delivery requests' :
              'You will not receive new delivery requests',
        });
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
              <p className="text-muted-foreground">Manage your deliveries and track earnings</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                    id="availability"
                    checked={isAvailable}
                    onCheckedChange={toggleAvailability}
                />
                <Label htmlFor="availability" className="font-medium">
                  {isAvailable ? (
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

              <Button variant="outline" onClick={() => navigate('/driver/profile')}>
                Driver Profile
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-6 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Earnings Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Earnings</CardTitle>
                <CardDescription>Your latest earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${dashboardData.totalEarnings?.toFixed(2) || '0.00'}</div>
                <p className="text-muted-foreground text-sm">Total earnings</p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xl font-semibold">${dashboardData.todayEarnings?.toFixed(2) || '0.00'}</p>
                    <p className="text-muted-foreground text-sm">Today</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">${dashboardData.weeklyEarnings?.toFixed(2) || '0.00'}</p>
                    <p className="text-muted-foreground text-sm">This week</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={() => navigate('/driver/earnings')}>
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
                    {dashboardData.activeDeliveries || 0}
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
                    {dashboardData.completedDeliveries || 0}
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
                    {dashboardData.availableDeliveries || 0}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={() => navigate('/driver/deliveries')}>
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
          {dashboardData.activeDelivery && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Active Delivery</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {dashboardData.activeDelivery.status.charAt(0).toUpperCase() +
                          dashboardData.activeDelivery.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Tracking #</p>
                          <p className="font-medium">{dashboardData.activeDelivery.tracking_number}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Client</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{dashboardData.activeDelivery.client.name}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleChatOpen(
                                    dashboardData.activeDelivery.id,
                                    dashboardData.activeDelivery.client.name
                                )}
                            >
                              Chat with Client
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Pickup Address</p>
                            <p>{dashboardData.activeDelivery.pickup_address}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                            <p>{dashboardData.activeDelivery.delivery_address}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6">
                          <Button onClick={() => navigate(`/driver/deliveries/${dashboardData.activeDelivery.id}`)}>
                            View Details
                          </Button>
                          <Button
                              variant="outline"
                              onClick={() => navigate(`/driver/deliveries/${dashboardData.activeDelivery.id}/status`)}
                          >
                            Update Status
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-[200px]">
                        <GoogleMapComponent
                            pickupAddress={dashboardData.activeDelivery.pickup_address}
                            deliveryAddress={dashboardData.activeDelivery.delivery_address}
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
              {dashboardData.recentDeliveries?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentDeliveries.map((delivery: any) => (
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
                                  onClick={() => navigate(`/driver/deliveries/${delivery.id}`)}
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
              <Button variant="outline" onClick={() => navigate('/driver/deliveries')}>
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
      </div>
  );
};

export default DriverDashboard;