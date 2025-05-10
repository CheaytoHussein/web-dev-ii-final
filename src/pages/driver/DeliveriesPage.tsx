import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // State to manage the filter

  useEffect(() => {
    // Mock fetch for demonstration
    const mockDeliveries = [
      {
        id: 'del_12345',
        tracking_number: 'TRK-12345',
        status: 'in_transit',
        pickup_address: '123 Main St, San Francisco, CA',
        delivery_address: '456 Market St, San Francisco, CA',
        client: {
          name: 'John Doe',
          phone: '(555) 123-4567'
        },
        created_at: new Date().toISOString(),
        price: 29.99,
      },
      {
        id: 'del_12344',
        tracking_number: 'TRK-12344',
        status: 'delivered',
        pickup_address: '789 Howard St, San Francisco, CA',
        delivery_address: '101 Mission St, San Francisco, CA',
        client: {
          name: 'Jane Smith',
          phone: '(555) 987-6543'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        price: 24.50,
      },
      {
        id: 'del_12346',
        tracking_number: 'TRK-12346',
        status: 'delivered',
        pickup_address: '202 Pine St, San Francisco, CA',
        delivery_address: '303 Oak St, San Francisco, CA',
        client: {
          name: 'Alice Brown',
          phone: '(555) 234-5678'
        },
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        price: 35.00,
      },
      {
        id: 'del_12347',
        tracking_number: 'TRK-12347',
        status: 'delivered',
        pickup_address: '500 Mission St, San Francisco, CA',
        delivery_address: '700 Montgomery St, San Francisco, CA',
        client: {
          name: 'Bob White',
          phone: '(555) 345-6789'
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        price: 18.75,
      },
      {
        id: 'del_12348',
        tracking_number: 'TRK-12348',
        status: 'in_transit',
        pickup_address: '101 Broadway St, San Francisco, CA',
        delivery_address: '202 California St, San Francisco, CA',
        client: {
          name: 'Charlie Green',
          phone: '(555) 456-7890'
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        price: 42.99,
      },
      {
        id: 'del_12349',
        tracking_number: 'TRK-12349',
        status: 'delivered',
        pickup_address: '200 Folsom St, San Francisco, CA',
        delivery_address: '300 Howard St, San Francisco, CA',
        client: {
          name: 'David Black',
          phone: '(555) 567-8901'
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        price: 50.25,
      },
      {
        id: 'del_12350',
        tracking_number: 'TRK-12350',
        status: 'in_transit',
        pickup_address: '123 California St, San Francisco, CA',
        delivery_address: '500 Polk St, San Francisco, CA',
        client: {
          name: 'Eve Johnson',
          phone: '(555) 678-9012'
        },
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        price: 19.95,
      },
      {
        id: 'del_12351',
        tracking_number: 'TRK-12351',
        status: 'delivered',
        pickup_address: '800 3rd St, San Francisco, CA',
        delivery_address: '600 5th St, San Francisco, CA',
        client: {
          name: 'Grace Miller',
          phone: '(555) 789-0123'
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: 15.30,
      },
      {
        id: 'del_12352',
        tracking_number: 'TRK-12352',
        status: 'delivered',
        pickup_address: '400 2nd St, San Francisco, CA',
        delivery_address: '600 Clay St, San Francisco, CA',
        client: {
          name: 'Henry King',
          phone: '(555) 890-1234'
        },
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        price: 23.40,
      }
    ];

    setDeliveries(mockDeliveries);
  }, []);

  // Filter deliveries based on selected filter
  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.status === filter;
  });

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 bg-background">
      <h1 className="text-2xl font-bold mb-6">All Deliveries</h1>

      {/* Filter Dropdown */}
      <div className="mb-6">
        <label className="mr-4">Filter by Status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          className="p-2 border rounded-md"
        >
          <option value="all">All</option>
          <option value="delivered">Delivered</option>
          <option value="in_transit">In Transit</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredDeliveries.map(delivery => (
          <Card key={delivery.id}>
            <CardHeader className="pb-2 flex flex-col md:flex-row justify-between">
              <div>
                <CardTitle className="text-md">Tracking #{delivery.tracking_number}</CardTitle>
                <CardDescription>
                  {delivery.status === 'delivered' ? (
                    <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                  )}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground mt-2 md:mt-0">
                <Calendar className="inline w-4 h-4 mr-1" />
                {format(new Date(delivery.created_at), 'PPP')}
                <br />
                <Clock className="inline w-4 h-4 mr-1" />
                {formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}
              </div>
            </CardHeader>
            <CardContent>
              <p><strong>Client:</strong> {delivery.client.name} ({delivery.client.phone})</p>
              <p><strong>Pickup:</strong> {delivery.pickup_address}</p>
              <p><strong>Drop-off:</strong> {delivery.delivery_address}</p>
              <p><strong>Price:</strong> ${delivery.price.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeliveriesPage;
