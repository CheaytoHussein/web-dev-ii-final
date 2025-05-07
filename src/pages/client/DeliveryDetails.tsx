
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mapStatusToColor, formatDate } from "@/lib/utils";
import { Package, MapPin, Phone, User, ArrowRight, Calendar, Clock, DollarSign, X, CheckCircle2 } from "lucide-react";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import DeliveryTimeline from "@/components/DeliveryTimeline";
import StripePaymentForm from "@/components/StripePaymentForm";

interface DeliveryStatus {
  id: number;
  status: string;
  location: string;
  timestamp: string;
  notes: string;
}

const DeliveryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState<DeliveryStatus[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [liveTracking, setLiveTracking] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    // Fetch delivery details from API
    const fetchDeliveryDetails = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch(`http://localhost:8000/api/client/deliveries/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch delivery details");
        }

        const data = await response.json();
        setDelivery(data.delivery || null);
        
        if (data.delivery?.status_history) {
          setStatusHistory(data.delivery.status_history);
        }
        
        // Check if delivery is in transit to enable live tracking
        if (data.delivery?.status === "in_transit" && data.delivery?.driver_id) {
          setLiveTracking(true);
          startLiveTracking(data.delivery.driver_id);
        }
      } catch (error) {
        console.error("Delivery details fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load delivery details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
    
    // Cleanup on unmount
    return () => {
      if (liveTracking) {
        stopLiveTracking();
      }
    };
  }, [id, navigate]);

  const startLiveTracking = (driverId: string) => {
    // In a real application, this would connect to a WebSocket or use polling
    // to get real-time driver location updates
    console.log("Starting live tracking for driver", driverId);
    
    // Simulate periodic location updates
    const intervalId = setInterval(() => {
      // This would be replaced with actual API calls to get driver's current location
      const simulatedLocation = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01
      };
      
      setDriverLocation(simulatedLocation as any);
    }, 5000);
    
    // Store interval ID in window object for cleanup
    (window as any).trackingInterval = intervalId;
  };

  const stopLiveTracking = () => {
    if ((window as any).trackingInterval) {
      clearInterval((window as any).trackingInterval);
    }
  };

  const handleCancelDelivery = async () => {
    setCancelling(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch(`http://localhost:8000/api/client/deliveries/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel delivery");
      }

      toast({
        title: "Delivery cancelled",
        description: "Your delivery has been cancelled successfully",
      });
      
      // Update delivery status in the UI
      setDelivery({
        ...delivery,
        status: "cancelled"
      });
      
      // Add cancellation to status history
      setStatusHistory([
        ...statusHistory,
        {
          id: statusHistory.length + 1,
          status: "cancelled",
          location: "N/A",
          timestamp: new Date().toISOString(),
          notes: "Cancelled by client"
        }
      ]);
      
      // Stop live tracking if active
      if (liveTracking) {
        stopLiveTracking();
        setLiveTracking(false);
      }
    } catch (error) {
      console.error("Delivery cancellation error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel delivery",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  const handlePayment = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    
    toast({
      title: "Payment successful",
      description: "Your payment has been processed successfully",
    });
    
    // Update delivery status in the UI
    setDelivery({
      ...delivery,
      payment_status: "paid"
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading delivery details...</div>
        </div>
      </ClientLayout>
    );
  }

  if (!delivery) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Delivery Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The delivery you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate("/client/deliveries")}>
              Back to Deliveries
            </Button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Delivery #{delivery.tracking_number}</h1>
              <Badge className={`${mapStatusToColor(delivery.status)}`}>
                {delivery.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">Created on {formatDate(delivery.created_at)}</p>
          </div>
          <div className="flex gap-2">
            {delivery.status !== "delivered" && delivery.status !== "cancelled" && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel Delivery
                </Button>
                
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Delivery</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this delivery? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                        No, Keep Delivery
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleCancelDelivery}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Delivery"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            
            {delivery.payment_status === "pending" && (
              <Button onClick={handlePayment}>Pay Now</Button>
            )}
            
            <Button variant="outline" onClick={() => navigate("/client/deliveries")}>
              Back to Deliveries
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 rounded-md overflow-hidden">
                  <GoogleMapComponent
                    pickupAddress={delivery.pickup_address}
                    deliveryAddress={delivery.delivery_address}
                    driverLocation={driverLocation}
                    isLive={liveTracking}
                    height="100%"
                  />
                </div>
                {liveTracking ? (
                  <div className="mt-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mr-2"></div>
                    <span className="text-sm font-medium">Live tracking active</span>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {delivery.status === "delivered" 
                      ? "Delivery complete. Live tracking is no longer available." 
                      : delivery.status === "cancelled"
                        ? "Delivery cancelled. Live tracking is unavailable."
                        : "Live tracking will be available when your delivery is in transit."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryTimeline history={statusHistory} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Pickup Location</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <p>{delivery.pickup_address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Pickup Contact</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <p>{delivery.pickup_contact}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-primary" />
                    <p>{delivery.pickup_phone}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Delivery Location</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-destructive shrink-0 mt-1" />
                    <p>{delivery.delivery_address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Recipient</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-destructive" />
                    <p>{delivery.recipient_name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-destructive" />
                    <p>{delivery.recipient_phone}</p>
                  </div>
                </div>
                
                {delivery.delivery_instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Delivery Instructions</h3>
                    <p className="text-sm">{delivery.delivery_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Size</h3>
                    <p className="capitalize">{delivery.package_size.replace("_", " ")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Weight</h3>
                    <p>{delivery.package_weight} kg</p>
                  </div>
                </div>
                
                {delivery.package_description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{delivery.package_description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Type</h3>
                    <p className="capitalize">{delivery.delivery_type.replace("_", " ")}</p>
                  </div>
                  {delivery.is_fragile && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Handling</h3>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Fragile
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Total Amount</h3>
                  <p className="text-xl font-bold">${delivery.price.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Payment Status</h3>
                  {delivery.payment_status === "paid" ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
                  )}
                </div>
                
                {delivery.payment_status === "pending" && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handlePayment}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
              </CardContent>
            </Card>

            {delivery.driver && (
              <Card>
                <CardHeader>
                  <CardTitle>Driver Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{delivery.driver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Rating: {delivery.driver.rating} ★
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact</h3>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <p>{delivery.driver.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment for Delivery #{delivery.tracking_number}</DialogTitle>
            <DialogDescription>
              Enter your payment details to complete the order.
            </DialogDescription>
          </DialogHeader>
          <StripePaymentForm 
            amount={delivery.price} 
            deliveryId={delivery.id}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};

export default DeliveryDetails;
