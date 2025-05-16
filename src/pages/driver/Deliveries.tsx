import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Delivery {
  id: number;
  tracking_number: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  created_at: string;
  client: {
    name: string;
    phone: string;
  };
}

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fetch deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=driver");
          return;
        }

        const response = await fetch("http://localhost:8000/api/driver/deliveries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch deliveries");

        const data = await response.json();
        console.log("Deliveries fetched:", data);
        setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load deliveries.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [navigate]);

  const handleViewDelivery = (id: number) => {
    navigate(`/driver/deliveries/${id}`);
  };

  const handleAcceptDelivery = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`http://localhost:8000/api/driver/deliveries/${id}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to accept delivery");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: result.message || "Delivery accepted successfully.",
      });

      // Update local state to reflect accepted delivery
      setDeliveries(prev =>
        prev.map(d =>
          d.id === id ? { ...d, status: "accepted" } : d
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 font-medium">Loading deliveries...</p>
      </div>
    </div>
  );

  if (deliveries.length === 0) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Deliveries</h1>
        <Button 
          onClick={() => navigate('/driver/dashboard')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
        >
          Return to Dashboard
        </Button>
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200 shadow-sm">
        <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No deliveries available</h3>
        <p className="text-gray-600 max-w-md mx-auto">When new delivery requests come in, they'll appear here ready for you to accept.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Deliveries</h1>
          <p className="text-amber-600 font-medium">{deliveries.length} active {deliveries.length === 1 ? 'delivery' : 'deliveries'}</p>
        </div>
        <Button 
          onClick={() => navigate('/driver/dashboard')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
        >
          Return to Dashboard
        </Button>
      </div>

      <div className="space-y-5">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{delivery.client.name}</h3>
                    <p className="text-sm text-gray-500">#{delivery.tracking_number}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    delivery.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800' 
                      : delivery.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {delivery.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pickup Address</p>
                  <p className="text-gray-800 font-medium">{delivery.pickup_address}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                  <p className="text-gray-800 font-medium">{delivery.delivery_address}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleViewDelivery(delivery.id)}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Button>
                {delivery.status === "pending" && (
                  <Button
                    onClick={() => handleAcceptDelivery(delivery.id)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Delivery
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deliveries;