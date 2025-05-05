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
  rating: number;
  profilePicture?: string;
  vehicleType: any;
  vehicleModel?: string;
  isAvailable: boolean;
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
  completedDeliveries: number;
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
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Mock data for demonstration
        const mockDrivers: Driver[] = [
          {
            id: '1',
            name: 'John Smith',
            rating: 4.8,
            profilePicture: undefined,
            vehicleType: 'sedan',
            vehicleModel: 'Toyota Camry',
            isAvailable: true,
            distance: 2.4,
            location: { lat: 37.7749, lng: -122.4194 },
            completedDeliveries: 148
          },
          {
            id: '2',
            name: 'Maria Johnson',
            rating: 4.9,
            profilePicture: undefined,
            vehicleType: 'suv',
            vehicleModel: 'Honda CR-V',
            isAvailable: true,
            distance: 3.7,
            location: { lat: 37.7831, lng: -122.4039 },
            completedDeliveries: 215
          },
          {
            id: '3',
            name: 'Robert Lee',
            rating: 4.6,
            profilePicture: undefined,
            vehicleType: 'van',
            vehicleModel: 'Ford Transit',
            isAvailable: true,
            distance: 5.2,
            location: { lat: 37.7694, lng: -122.4268 },
            completedDeliveries: 97
          },
          {
            id: '4',
            name: 'Sarah Williams',
            rating: 4.7,
            profilePicture: undefined,
            vehicleType: 'truck',
            vehicleModel: 'Ford F-150',
            isAvailable: false,
            distance: 7.1,
            location: { lat: 37.7576, lng: -122.4081 },
            completedDeliveries: 132
          }
        ];

        setDrivers(mockDrivers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available drivers',
          variant: 'destructive',
        });
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
    // In a real app, this would call an API with the search parameters
    toast({
      title: 'Searching',
      description: 'Searching for drivers with your criteria...',
    });
    
    // For demo, we'll just filter the mock data
    setTimeout(() => {
      const filtered = drivers.filter(driver => {
        if (searchParams.vehicleType && searchParams.vehicleType !== "any" && driver.vehicleType !== searchParams.vehicleType) {
          return false;
        }
        return driver.isAvailable;
      });
      setDrivers(filtered.length ? filtered : drivers);
    }, 1000);
  };

  const selectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleRequestDriver = () => {
    if (!selectedDriver) return;
    
    // In a real app, this would call your API
    toast({
      title: 'Request Sent',
      description: `Request sent to ${selectedDriver.name}. They'll respond shortly.`,
    });
    
    // Navigate to new delivery
    navigate('/client/deliveries/new', { 
      state: { selectedDriver: selectedDriver.id }
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
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
                  {drivers.filter(d => d.isAvailable).map(driver => (
                    <Card 
                      key={driver.id} 
                      className={`cursor-pointer transition-all hover:border-primary ${selectedDriver?.id === driver.id ? 'border-primary border-2' : ''}`}
                      onClick={() => selectDriver(driver)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={driver.profilePicture} />
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
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Car className="h-3 w-3 mr-1" />
                              <span className="capitalize">{driver.vehicleType}</span>
                              {driver.vehicleModel && (
                                <span className="ml-1">- {driver.vehicleModel}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{driver.distance} miles away</span>
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
                              <AvatarImage src={selectedDriver.profilePicture} />
                              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {selectedDriver.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h2 className="text-xl font-semibold">{selectedDriver.name}</h2>
                              <div className="flex items-center">
                                {renderStars(selectedDriver.rating)}
                                <span className="text-sm ml-2">{selectedDriver.rating.toFixed(1)} ({selectedDriver.completedDeliveries} deliveries)</span>
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
                                  <Badge className="capitalize">{selectedDriver.vehicleType}</Badge>
                                  {selectedDriver.vehicleModel && (
                                    <span>{selectedDriver.vehicleModel}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>{selectedDriver.distance} miles away</span>
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
                                    <span>(555) 123-4567</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{selectedDriver.name.toLowerCase().replace(' ', '.') + '@example.com'}</span>
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
                      driverLocation={selectedDriver.location}
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
