
import { useState, useEffect } from "react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";

interface Delivery {
  id: number;
  tracking_number: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  created_at: string;
  price: number;
}

const ClientDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch deliveries from API
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/client/deliveries", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch deliveries");
        }

        const data = await response.json();
        setDeliveries(data.deliveries || []);
      } catch (error) {
        console.error("Deliveries fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load deliveries",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [navigate]);

  const handleViewDelivery = (id: number) => {
    navigate(`/client/deliveries/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'in_transit':
      case 'in transit':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDeliveries = deliveries.filter((delivery) => 
    delivery.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.delivery_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Deliveries</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deliveries..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate("/client/deliveries/new")}>
              <Plus className="h-4 w-4 mr-2" /> New Delivery
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading deliveries...</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length > 0 ? (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.tracking_number}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{delivery.pickup_address}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{delivery.delivery_address}</TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="text-right">${delivery.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{new Date(delivery.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDelivery(delivery.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {searchQuery ? "No deliveries match your search" : "No deliveries found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientDeliveries;
