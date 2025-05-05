import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Users,
  Truck,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Search,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        // Mock data for demonstration
        const mockData = {
          stats: {
            totalClients: 48,
            totalDrivers: 25,
            verifiedDrivers: 18,
            pendingVerifications: 7,
            activeDeliveries: 12,
            completedDeliveries: 156,
            totalRevenue: 4875.50,
          },
          recentDeliveries: [
            {
              id: 'del_123456',
              tracking_number: 'TRK-123456',
              client_name: 'Acme Corp',
              driver_name: 'John Smith',
              status: 'in_transit',
              created_at: new Date().toISOString(),
              price: 49.99,
            },
            {
              id: 'del_123455',
              tracking_number: 'TRK-123455',
              client_name: 'Tech Solutions Inc',
              driver_name: 'Maria Johnson',
              status: 'delivered',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              price: 32.50,
            },
            {
              id: 'del_123454',
              tracking_number: 'TRK-123454',
              client_name: 'Quantum Enterprises',
              driver_name: 'Robert Lee',
              status: 'pending',
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              price: 79.99,
            }
          ],
          drivers: [
            {
              id: 'drv_1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '+1 (555) 123-4567',
              is_verified: true,
              is_available: true,
              completed_deliveries: 52,
              rating: 4.8,
              vehicle_type: 'sedan',
              joined_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'drv_2',
              name: 'Maria Johnson',
              email: 'maria.johnson@example.com',
              phone: '+1 (555) 987-6543',
              is_verified: true,
              is_available: true,
              completed_deliveries: 37,
              rating: 4.9,
              vehicle_type: 'suv',
              joined_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'drv_3',
              name: 'Robert Lee',
              email: 'robert.lee@example.com',
              phone: '+1 (555) 456-7890',
              is_verified: false,
              is_available: false,
              completed_deliveries: 0,
              rating: 0,
              vehicle_type: 'van',
              joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          clients: [
            {
              id: 'clt_1',
              name: 'Acme Corp',
              email: 'contact@acme.com',
              phone: '+1 (555) 111-2222',
              deliveries_count: 23,
              total_spent: 1245.75,
              joined_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'clt_2',
              name: 'Tech Solutions Inc',
              email: 'info@techsolutions.com',
              phone: '+1 (555) 333-4444',
              deliveries_count: 15,
              total_spent: 892.50,
              joined_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'clt_3',
              name: 'Quantum Enterprises',
              email: 'support@quantum.com',
              phone: '+1 (555) 555-6666',
              deliveries_count: 7,
              total_spent: 459.95,
              joined_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ]
        };
        
        setDashboardData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
        navigate('/admin/login');
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleVerifyDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    setIsVerifyDialogOpen(true);
  };

  const confirmVerification = () => {
    if (!selectedDriverId) return;
    
    // Find the driver
    const updatedDrivers = dashboardData.drivers.map((driver: any) => {
      if (driver.id === selectedDriverId) {
        return {
          ...driver,
          is_verified: !driver.is_verified
        };
      }
      return driver;
    });
    
    // Update the dashboard data
    setDashboardData({
      ...dashboardData,
      drivers: updatedDrivers,
      stats: {
        ...dashboardData.stats,
        verifiedDrivers: driver.is_verified 
          ? dashboardData.stats.verifiedDrivers - 1 
          : dashboardData.stats.verifiedDrivers + 1,
        pendingVerifications: driver.is_verified 
          ? dashboardData.stats.pendingVerifications + 1 
          : dashboardData.stats.pendingVerifications - 1,
      }
    });
    
    // Close the dialog and show toast
    setIsVerifyDialogOpen(false);
    setVerificationNote('');
    
    const driver = dashboardData.drivers.find((d: any) => d.id === selectedDriverId);
    const action = driver.is_verified ? 'unverified' : 'verified';
    
    toast({
      title: `Driver ${action}`,
      description: `${driver.name} has been ${action} successfully.`,
    });
  };

  const filterData = (data: any[], term: string) => {
    if (!term) return data;
    return data.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.email.toLowerCase().includes(term.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b py-4 px-4 md:px-6 bg-background sticky top-0 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center container">
          <div className="mb-4 md:mb-0 flex items-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <div>
              <h1 className="text-2xl font-bold">SwiftTrack Admin</h1>
              <p className="text-muted-foreground">Dashboard Overview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/admin/settings')}>
              Settings
            </Button>
            <Button variant="destructive" onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_type');
              navigate('/admin/login');
            }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4 md:px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <div className="text-2xl font-bold">
                  {dashboardData.stats.totalClients + dashboardData.stats.totalDrivers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.stats.totalClients} clients, {dashboardData.stats.totalDrivers} drivers
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-green-100 rounded-full p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deliveries</p>
                <div className="text-2xl font-bold">
                  {dashboardData.stats.activeDeliveries + dashboardData.stats.completedDeliveries}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.stats.activeDeliveries} active, {dashboardData.stats.completedDeliveries} completed
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drivers</p>
                <div className="text-2xl font-bold">{dashboardData.stats.totalDrivers}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.stats.verifiedDrivers} verified, {dashboardData.stats.pendingVerifications} pending
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <div className="text-2xl font-bold">${dashboardData.stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From {dashboardData.stats.activeDeliveries + dashboardData.stats.completedDeliveries} deliveries
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>
                The latest delivery activity across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Tracking #</th>
                        <th className="py-3 px-4 text-left font-medium">Client</th>
                        <th className="py-3 px-4 text-left font-medium">Driver</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Amount</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentDeliveries.map((delivery: any) => (
                        <tr key={delivery.id} className="border-t">
                          <td className="py-3 px-4 font-medium">
                            {delivery.tracking_number}
                          </td>
                          <td className="py-3 px-4">
                            {delivery.client_name}
                          </td>
                          <td className="py-3 px-4">
                            {delivery.driver_name || 'Unassigned'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`
                                ${delivery.status === 'delivered' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                ${delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                                ${delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                              `}
                            >
                              {delivery.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(delivery.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            ${delivery.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => navigate('/admin/deliveries')}>
                  View All Deliveries
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="drivers">
          <TabsList className="mb-4">
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="drivers">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <div>
                    <CardTitle>Registered Drivers</CardTitle>
                    <CardDescription>
                      Manage driver accounts and verification
                    </CardDescription>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search drivers..."
                      className="pl-8 w-full md:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Email</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Vehicle</th>
                        <th className="py-3 px-4 text-left font-medium">Rating</th>
                        <th className="py-3 px-4 text-left font-medium">Deliveries</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterData(dashboardData.drivers, searchTerm).map((driver: any) => (
                        <tr key={driver.id} className="border-t">
                          <td className="py-3 px-4 font-medium">
                            {driver.name}
                          </td>
                          <td className="py-3 px-4">
                            {driver.email}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={driver.is_verified ? 
                                'bg-green-100 text-green-800 hover:bg-green-100' : 
                                'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                              }
                            >
                              {driver.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            {driver.vehicle_type}
                          </td>
                          <td className="py-3 px-4">
                            {driver.rating > 0 ? driver.rating.toFixed(1) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {driver.completed_deliveries}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVerifyDriver(driver.id)}
                              >
                                {driver.is_verified ? 'Unverify' : 'Verify'}
                              </Button>
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clients">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <div>
                    <CardTitle>Client Accounts</CardTitle>
                    <CardDescription>
                      Manage client profiles and transactions
                    </CardDescription>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search clients..."
                      className="pl-8 w-full md:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Email</th>
                        <th className="py-3 px-4 text-left font-medium">Phone</th>
                        <th className="py-3 px-4 text-left font-medium">Joined</th>
                        <th className="py-3 px-4 text-left font-medium">Deliveries</th>
                        <th className="py-3 px-4 text-left font-medium">Total Spent</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterData(dashboardData.clients, searchTerm).map((client: any) => (
                        <tr key={client.id} className="border-t">
                          <td className="py-3 px-4 font-medium">
                            {client.name}
                          </td>
                          <td className="py-3 px-4">
                            {client.email}
                          </td>
                          <td className="py-3 px-4">
                            {client.phone}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(client.joined_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {client.deliveries_count}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            ${client.total_spent.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Driver Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dashboardData.drivers.find((d: any) => d.id === selectedDriverId)?.is_verified
                ? 'Remove Driver Verification'
                : 'Verify Driver'}
            </DialogTitle>
            <DialogDescription>
              {dashboardData.drivers.find((d: any) => d.id === selectedDriverId)?.is_verified
                ? 'Are you sure you want to remove verification status from this driver?'
                : 'Approving this driver will allow them to accept delivery requests.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-note">Note (optional)</Label>
              <Input
                id="verification-note"
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Add a note about this action"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsVerifyDialogOpen(false);
                setVerificationNote('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmVerification}>
              {dashboardData.drivers.find((d: any) => d.id === selectedDriverId)?.is_verified
                ? 'Remove Verification'
                : 'Verify Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;