
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Truck, Clock } from "lucide-react";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState({
    active: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/client/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDeliveries({
          active: data.active_deliveries || 0,
          completed: data.completed_deliveries || 0,
          pending: data.pending_deliveries || 0
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
                <span className="text-3xl font-bold">{loading ? "..." : deliveries.active}</span>
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
                <span className="text-3xl font-bold">{loading ? "..." : deliveries.completed}</span>
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
                <span className="text-3xl font-bold">{loading ? "..." : deliveries.pending}</span>
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
              ) : (
                <div className="space-y-4">
                  {/* This would be replaced with actual delivery data from API */}
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
                  {/* This would be replaced with actual driver data from API */}
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>3 drivers available near you</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/client/find-drivers")}>
                      Find Drivers
                    </Button>
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
