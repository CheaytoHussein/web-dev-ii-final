import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { Star, MapPin, Phone, Mail, Clock, Car } from 'lucide-react';
import ClientLayout from '@/components/layouts/ClientLayout';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  profile_picture?: string;
  vehicle_type: string;
  vehicle_model?: string;
  is_available: boolean;
  distance: number;
  latitude: number;
  longitude: number;
  completed_deliveries: number;
}

const FindDrivers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: '',
    vehicleType: '',
    radius: '10',
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/drivers/available", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch available drivers");
        }

        const data = await response.json();
        setDrivers(data.drivers || []);
      } catch (error) {
        console.error("Drivers fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load available drivers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVehicleTypeChange = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      vehicleType: value,
    }));
  };

  const handleSearch = () => {
    toast({
      title: 'Searching',
      description: 'Searching for drivers with your criteria...',
    });

    // Filter the drivers based on search criteria
    const filtered = drivers.filter(driver => {
      const matchesVehicleType = !searchParams.vehicleType ||
          searchParams.vehicleType === "any" ||
          driver.vehicle_type.toLowerCase() === searchParams.vehicleType.toLowerCase();

      // In a real app, you would also filter by location and radius here
      return matchesVehicleType && driver.is_available;
    });

    setDrivers(filtered.length ? filtered : drivers);
  };

  const selectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleRequestDriver = () => {
    if (!selectedDriver) return;

    toast({
      title: 'Request Sent',
      description: `Request sent to ${selectedDriver.name}. They'll respond shortly.`,
    });

    navigate('/client/deliveries/new', {
      state: { selectedDriver: selectedDriver.id }
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
          <Star
              key={i}
              className={`h-4 w-4 ${i < roundedRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
      );
    }
    return stars;
  };

  return (
      <ClientLayout>
        <div className="container px-4 py-8">
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Find Drivers</h1>
              <p className="text-muted-foreground">Search for available drivers in your area for your next delivery</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Search Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Pickup Location</Label>
                    <Input
                        id="location"
                        name="location"
                        placeholder="Enter address or zip code"
                        value={searchParams.location}
                        onChange={handleSearchChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select
                        value={searchParams.vehicleType}
                        onValueChange={handleVehicleTypeChange}
                    >
                      <SelectTrigger id="vehicleType">
                        <SelectValue placeholder="Any vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any vehicle</SelectItem>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Search Radius (miles)</Label>
                    <Input
                        id="radius"
                        name="radius"
                        type="number"
                        min="1"
                        max="50"
                        value={searchParams.radius}
                        onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSearch}>Search Drivers</Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold mb-4">Available Drivers</h2>
                {loading ? (
                    <p className="text-muted-foreground text-center py-8">Loading drivers...</p>
                ) : drivers.length > 0 ? (
                    <div className="space-y-4">
                      {drivers.filter(d => d.is_available).map(driver => (
                          <Card
                              key={driver.id}
                              className={`cursor-pointer transition-all hover:border-primary ${selectedDriver?.id === driver.id ? 'border-primary border-2' : ''}`}
                              onClick={() => selectDriver(driver)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={driver.profile_picture} alt={driver.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {driver.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-medium">{driver.name}</h3>
                                      <div className="flex items-center space-x-1 mb-1">
                                        {renderStars(driver.rating)}
                                        <span className="text-sm ml-1">{driver.rating.toFixed(1)}</span>
                                      </div>
                                    </div>
                                    {driver.is_available && (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Car className="h-3 w-3 mr-1" />
                                    <span className="capitalize">{driver.vehicle_type}</span>
                                    {driver.vehicle_model && (
                                        <span className="ml-1">- {driver.vehicle_model}</span>
                                    )}
                                  </div>

                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{driver.distance.toFixed(1)} miles away</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                      ))}
                    </div>
                ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground">No available drivers found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search criteria</p>
                      </CardContent>
                    </Card>
                )}
              </div>

              <div className="lg:col-span-2">
                {selectedDriver ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Driver Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={selectedDriver.profile_picture} alt={selectedDriver.name} />
                                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                    {selectedDriver.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>

                                <div>
                                  <h2 className="text-xl font-semibold">{selectedDriver.name}</h2>
                                  <div className="flex items-center">
                                    {renderStars(selectedDriver.rating)}
                                    <span className="text-sm ml-2">
                                      {selectedDriver.rating.toFixed(1)} ({selectedDriver.completed_deliveries} deliveries)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Tabs defaultValue="info">
                                <TabsList className="mb-4">
                                  <TabsTrigger value="info">Info</TabsTrigger>
                                  <TabsTrigger value="contact">Contact</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-4">
                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Vehicle Information</h3>
                                    <div className="flex items-center space-x-4">
                                      <Badge className="capitalize">{selectedDriver.vehicle_type}</Badge>
                                      {selectedDriver.vehicle_model && (
                                          <span>{selectedDriver.vehicle_model}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span>{selectedDriver.distance.toFixed(1)} miles away</span>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Availability</h3>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span>Available now</span>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="contact">
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{selectedDriver.phone}</span>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{selectedDriver.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <div className="mt-6">
                                <Button onClick={handleRequestDriver}>Request This Driver</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="h-[300px]">
                        <GoogleMapComponent
                            driverLocation={{ lat: selectedDriver.latitude, lng: selectedDriver.longitude }}
                            isLive={true}
                            height="100%"
                        />
                      </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center">
                      <p className="text-muted-foreground mb-4">Select a driver to view more details</p>
                      <div className="rounded-lg bg-muted/50 h-60 w-full flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
  );
};

export default FindDrivers;