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
  recipient_name: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | string;
  created_at: string;
  price: number;
  package_size: 'small' | 'medium' | 'large' | 'extra_large' | string;
  package_weight: number;
  delivery_date: string | null;
  delivery_time: string | null;
  driver_id?: number | null;
  driver?: {
    id: number;
    name: string;
  };
}
const ClientDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/client/deliveries", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch deliveries');
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.deliveries)) {
          throw new Error('Invalid data format received from API');
        }

        setDeliveries(data.deliveries);
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'An error occurred while fetching deliveries');
        toast({
          title: "Error",
          description: err.message || 'An error occurred while fetching deliveries',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleViewDelivery = (id: number) => {
    navigate(`/client/deliveries/${id}`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; label: string }> = {
      pending: { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
      accepted: { className: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Accepted" },
      picked_up: { className: "bg-purple-100 text-purple-800 border-purple-200", label: "Picked Up" },
      in_transit: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "In Transit" },
      delivered: { className: "bg-green-100 text-green-800 border-green-200", label: "Delivered" },
      cancelled: { className: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
    };

    const statusInfo = statusMap[status.toLowerCase()] || { className: "", label: status };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const formatPackageSize = (size: string) => {
    const sizeMap: Record<string, string> = {
      small: "Small",
      medium: "Medium",
      large: "Large",
      extra_large: "Extra Large",
    };
    return sizeMap[size] || size;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null, timeString: string | null) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    let formatted = date.toLocaleDateString();

    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      formatted += ` ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return formatted;
  };

  const filteredDeliveries = deliveries.filter((delivery) =>
      Object.values(delivery).some(
          (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
          )}

          <div className="flex justify-between items-center mb-6">
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
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.length > 0 ? (
                        filteredDeliveries.map((delivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell className="font-medium">
                                {delivery.tracking_number}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {delivery.pickup_address}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {delivery.delivery_address}
                              </TableCell>
                              <TableCell>{delivery.recipient_name}</TableCell>
                              <TableCell>{formatPackageSize(delivery.package_size)}</TableCell>
                              <TableCell>{delivery.package_weight} kg</TableCell>
                              <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                              <TableCell>
                                {delivery.driver?.name || "Not assigned"}
                              </TableCell>
                              <TableCell>
                                {formatDateTime(delivery.delivery_date, delivery.delivery_time)}
                              </TableCell>
                              <TableCell className="text-right">
                                ${delivery.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {formatDate(delivery.created_at)}
                              </TableCell>
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
                          <TableCell colSpan={12} className="text-center py-4">
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