import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Truck, Clock } from "lucide-react";

interface Delivery {
  id: number;
  tracking_number: string;
  status: string;
  created_at: string;
  delivery_address: string;
  recipient_name: string;
  driver?: {
    name: string;
  };
}

interface DashboardData {
  active_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  nearby_drivers: number;
  recent_deliveries: Delivery[];
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    active_deliveries: 0,
    completed_deliveries: 0,
    pending_deliveries: 0,
    nearby_drivers: 0,
    recent_deliveries: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/client/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData({
          active_deliveries: data.active_deliveries || 0,
          completed_deliveries: data.completed_deliveries || 0,
          pending_deliveries: data.pending_deliveries || 0,
          nearby_drivers: data.nearby_drivers || 0,
          recent_deliveries: data.recent_deliveries || [],
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleCreateDelivery = () => {
    navigate("/client/deliveries/new");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Client Dashboard</h1>
            <Button onClick={handleCreateDelivery}>Create New Delivery</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center">
                  <Truck className="h-6 w-6 text-primary mr-2" />
                  <span className="text-3xl font-bold">{loading ? "..." : dashboardData.active_deliveries}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center">
                  <Package className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-3xl font-bold">{loading ? "..." : dashboardData.completed_deliveries}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-amber-500 mr-2" />
                  <span className="text-3xl font-bold">{loading ? "..." : dashboardData.pending_deliveries}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="col-span-full md:col-span-1">
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="text-center py-8">Loading recent deliveries...</div>
                ) : dashboardData.recent_deliveries.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {dashboardData.recent_deliveries.slice(0, 5).map((delivery) => (
                            <div key={delivery.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium">{delivery.tracking_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {delivery.recipient_name} • {delivery.delivery_address}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(delivery.created_at)} • {delivery.driver?.name || "No driver assigned"}
                                </p>
                              </div>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/client/deliveries/${delivery.id}`)}
                              >
                                View
                              </Button>
                            </div>
                        ))}
                      </div>
                      <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate("/client/deliveries")}
                      >
                        View All Deliveries
                      </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground py-4">
                        No recent deliveries found
                      </p>
                      <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate("/client/deliveries")}
                      >
                        View All Deliveries
                      </Button>
                    </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-full md:col-span-1">
              <CardHeader>
                <CardTitle>Available Drivers Nearby</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="text-center py-8">Loading nearby drivers...</div>
                ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{dashboardData.nearby_drivers} drivers available near you</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/client/find-drivers")}>
                          Find Drivers
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dashboardData.nearby_drivers > 0 ? (
                            <p>You have {dashboardData.nearby_drivers} drivers ready to accept your deliveries.</p>
                        ) : (
                            <p>No drivers currently available in your area.</p>
                        )}
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ClientLayout>
  );
};

export default ClientDashboard;