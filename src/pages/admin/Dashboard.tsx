// AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import {
  Users, Truck, Package, TrendingUp, Shield, Eye, Search, Download, User,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status?: string;
  deliveries_count?: number;
  is_verified?: boolean;
}

interface StatData {
  users?: {
    total_clients?: number;
    total_drivers?: number;
  };
  deliveries?: {
    total?: number;
    active?: number;
    completed?: number;
  };
  revenue?: {
    total?: number;
  };
  recent_deliveries?: any[];
}

interface Delivery {
  id: string;
  client: {
    name: string;
    email: string;
  };
  driver: {
    name: string;
    email: string;
  };
  status: string;
  delivery_address: string;
  package_size: string;
  package_description: string;
  delivery_date: string;
  created_at: string;
}

const Stat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow hover:shadow-md transition">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value ?? 0}</p>
      </div>
    </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatData>({});
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [searchDrivers, setSearchDrivers] = useState('');
  const [searchClients, setSearchClients] = useState('');
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bulkDrivers, setBulkDrivers] = useState<string[]>([]);
  const [driverFilter, setDriverFilter] = useState('');

  const token = localStorage.getItem('auth_token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const handleViewDetails = (deliveryId: string) => {
    navigate(`/admin/deliveries/${deliveryId}`);
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/dashboard', { headers });
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setStats(data);
        setRecentDeliveries(data.recent_deliveries || []);
      } catch (error) {
        console.error('Dashboard fetch failed:', error);
        navigate('/admin/login');
      }
    };

    fetchDashboard();
    fetchDrivers();
    fetchClients();
  }, [token, navigate]);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/drivers', { headers });
      if (!res.ok) throw new Error('Failed to fetch drivers');
      const data = await res.json();
      setDrivers(data.drivers?.data || data.drivers || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch drivers',
        variant: 'destructive',
      });
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/clients', { headers });
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data.clients?.data || data.clients || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyDriver = async (driverId?: string) => {
    const idToVerify = driverId || selectedDriverId;
    if (!idToVerify) {
      toast({ title: 'No driver selected', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/admin/drivers/${idToVerify}/verify`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      setDrivers(prevDrivers =>
          prevDrivers.map(driver =>
              driver.id === idToVerify
                  ? { ...driver, is_verified: true }
                  : driver
          )
      );

      toast({
        title: 'Driver verified successfully',
        description: 'Driver has been verified and can now accept deliveries',
        variant: 'default',
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsVerifyDialogOpen(false);
      setSelectedDriverId(null);
    }
  };

  const handleUnverifyDriver = async (driverId?: string) => {
    const idToUnverify = driverId || selectedDriverId;
    if (!idToUnverify) {
      toast({ title: 'No driver selected', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/admin/drivers/${idToUnverify}/unverify`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Unverification failed');
      }

      setDrivers(prevDrivers =>
          prevDrivers.map(driver =>
              driver.id === idToUnverify
                  ? { ...driver, is_verified: false }
                  : driver
          )
      );

      toast({
        title: 'Driver unverified successfully',
        description: 'Driver has been unverified and cannot accept new deliveries',
        variant: 'default',
      });

    } catch (error) {
      console.error('Unverification error:', error);
      toast({
        title: 'Unverification failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsVerifyDialogOpen(false);
      setSelectedDriverId(null);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      toast({
        title: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(field => `"${row[field] ?? ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterData = (data: User[], term: string, filter: string) =>
      data
          .filter(user => user.name?.toLowerCase().includes(term.toLowerCase()))
          .filter(user => {
            if (!filter) return true;
            if (filter === 'verified') return user.is_verified;
            if (filter === 'unverified') return !user.is_verified;
            return user.status === filter;
          });

  const toggleBulkSelect = (id: string) => {
    setBulkDrivers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDriverStatusChange = async (driverId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/drivers/${driverId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await res.json();
      toast({
        title: 'Driver Status Updated',
        description: data.message,
        variant: 'default'
      });
      await fetchDrivers();
    } catch (error) {
      toast({
        title: 'Status Update Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="border-b py-4 px-4 md:px-6 bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center container">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SwiftTrack Admin</h1>
                <p className="text-muted-foreground text-sm">Manage Clients & Drivers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100"
                  onClick={() => navigate('/admin/settings')}
              >
                Settings
              </Button>
              <Button
                  variant="destructive"
                  className="hover:bg-red-600"
                  onClick={() => {
                    localStorage.clear();
                    navigate('/admin/login');
                  }}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Dashboard Statistics</CardTitle>
            <CardDescription className="text-gray-500">Summary overview of key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Stat
                  icon={<Users className="h-6 w-6 text-blue-600" />}
                  label="Clients"
                  value={stats.users?.total_clients}
              />
              <Stat
                  icon={<Shield className="h-6 w-6 text-green-600" />}
                  label="Drivers"
                  value={stats.users?.total_drivers}
              />
              <Stat
                  icon={<Package className="h-6 w-6 text-purple-600" />}
                  label="Completed Deliveries"
                  value={stats.deliveries?.completed}
              />
              <Stat
                  icon={<Truck className="h-6 w-6 text-yellow-600" />}
                  label="Active Deliveries"
                  value={stats.deliveries?.active}
              />
              <Stat
                  icon={<TrendingUp className="h-6 w-6 text-rose-600" />}
                  label="Revenue"
                  value={`$${stats.revenue?.total?.toLocaleString() || 0}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Recent Deliveries</CardTitle>
            <CardDescription className="text-gray-500">Latest delivery activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-muted-foreground">No recent deliveries available.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {recentDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {delivery.client?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {delivery.driver?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                                variant={
                                  delivery.status === 'completed'
                                      ? 'secondary'
                                      : delivery.status === 'active'
                                          ? 'default'
                                          : 'outline'
                                }
                                className="capitalize"
                            >
                              {delivery.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {delivery.delivery_address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col">
                              <span className="font-medium">{delivery.package_size}</span>
                              <span className="text-xs text-gray-400 truncate max-w-xs">
                          {delivery.package_description}
                        </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(delivery.delivery_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                                onClick={() => handleViewDetails(delivery.id)}
                                className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Users */}
        <Card className="shadow-lg">
          <CardHeader>
            <Tabs defaultValue="drivers">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <TabsList>
                  <TabsTrigger value="drivers" className="data-[state=active]:bg-blue-50">
                    <Truck className="h-4 w-4 mr-2" />
                    Drivers
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="data-[state=active]:bg-blue-50">
                    <Users className="h-4 w-4 mr-2" />
                    Clients
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2">
                  {bulkDrivers.length > 0 && (
                      <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              bulkDrivers.forEach(id => handleVerifyDriver(id));
                              setBulkDrivers([]);
                            }}
                        >
                          Bulk Verify
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              bulkDrivers.forEach(id => handleUnverifyDriver(id));
                              setBulkDrivers([]);
                            }}
                        >
                          Bulk Unverify
                        </Button>
                      </>
                  )}
                </div>
              </div>

              {/* Drivers Tab */}
              <TabsContent value="drivers" className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search drivers..."
                        value={searchDrivers}
                        onChange={(e) => setSearchDrivers(e.target.value)}
                        className="w-full pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <select
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={driverFilter}
                        onChange={(e) => setDriverFilter(e.target.value)}
                    >
                      <option value="">All Drivers</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                    </select>
                    <Button
                        onClick={() => exportToCSV(drivers, 'drivers.csv')}
                        variant="outline"
                        className="border-gray-300"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Checkbox
                            checked={bulkDrivers.length === drivers.length && drivers.length > 0}
                            onCheckedChange={() => {
                              if (bulkDrivers.length === drivers.length) {
                                setBulkDrivers([]);
                              } else {
                                setBulkDrivers(drivers.map(d => d.id));
                              }
                            }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filterData(drivers, searchDrivers, driverFilter).map(driver => (
                        <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                                checked={bulkDrivers.includes(driver.id)}
                                onCheckedChange={() => toggleBulkSelect(driver.id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {driver.avatar_url ? (
                                    <img className="h-10 w-10 rounded-full" src={driver.avatar_url} alt="" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {driver.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <Badge
                                  variant={
                                    driver.is_verified
                                        ? 'default'
                                        : 'destructive'
                                  }
                                  className="w-fit"
                              >
                                {driver.is_verified ? 'Verified' : 'Unverified'}
                              </Badge>
                              {driver.status && (
                                  <Badge
                                      variant={
                                        driver.status === 'active'
                                            ? 'secondary'
                                            : 'outline'
                                      }
                                      className="w-fit capitalize"
                                  >
                                    {driver.status}
                                  </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1 text-gray-400" />
                              {driver.deliveries_count ?? 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {!driver.is_verified ? (
                                  <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => {
                                        setSelectedDriverId(driver.id);
                                        setIsVerifyDialogOpen(true);
                                      }}
                                  >
                                    Verify
                                  </Button>
                              ) : (
                                  <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedDriverId(driver.id);
                                        setIsVerifyDialogOpen(true);
                                      }}
                                  >
                                    Unverify
                                  </Button>
                              )}
                              <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300"
                                  onClick={() => setSelectedUser(driver)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300"
                                  onClick={() => {
                                    const newStatus = driver.status === 'active' ? 'pending' : 'active';
                                    handleDriverStatusChange(driver.id, newStatus);
                                  }}
                              >
                                {driver.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Clients Tab */}
              <TabsContent value="clients" className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search clients..."
                        value={searchClients}
                        onChange={(e) => setSearchClients(e.target.value)}
                        className="w-full pl-10"
                    />
                  </div>
                  <Button
                      onClick={() => exportToCSV(clients, 'clients.csv')}
                      variant="outline"
                      className="border-gray-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filterData(clients, searchClients, '').map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {client.avatar_url ? (
                                    <img className="h-10 w-10 rounded-full" src={client.avatar_url} alt="" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300"
                                onClick={() => setSelectedUser(client)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Verify Dialog */}
        <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Verify Driver</DialogTitle>
              <DialogDescription>
                This will grant the driver full access to the driver dashboard and allow them to accept deliveries.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                  onClick={() => handleVerifyDriver()}
                  className="bg-green-600 hover:bg-green-700"
              >
                Confirm Verification
              </Button>
              <Button
                  variant="outline"
                  onClick={() => setIsVerifyDialogOpen(false)}
                  className="border-gray-300"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Profile Dialog */}
        {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">User Profile</DialogTitle>
                  <DialogDescription>Detailed information about the user</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-4">
                    {selectedUser.avatar_url ? (
                        <img
                            src={selectedUser.avatar_url}
                            alt={selectedUser.name}
                            className="h-16 w-16 rounded-full"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        {selectedUser.is_verified ? (
                            <Badge variant="default">Verified</Badge>
                        ) : (
                            <Badge variant="destructive">Unverified</Badge>
                        )}
                      </p>
                    </div>
                    {selectedUser.status && (
                        <div>
                          <p className="text-sm text-gray-500">Account Status</p>
                          <p className="font-medium">
                            <Badge variant={selectedUser.status === 'active' ? 'secondary' : 'outline'}>
                              {selectedUser.status}
                            </Badge>
                          </p>
                        </div>
                    )}
                    {selectedUser.deliveries_count !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">Total Deliveries</p>
                          <p className="font-medium">{selectedUser.deliveries_count}</p>
                        </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setSelectedUser(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}
      </div>
  );
};

export default AdminDashboard;