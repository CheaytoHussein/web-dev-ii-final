
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import GoogleMapComponent from "@/components/GoogleMapComponent";

const NewDelivery = () => {
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState({
    pickup_address: "",
    pickup_contact: "",
    pickup_phone: "",
    delivery_address: "",
    recipient_name: "",
    recipient_phone: "",
    package_size: "small",
    package_weight: "",
    package_description: "",
    delivery_instructions: "",
    is_fragile: false,
    delivery_type: "standard",
    delivery_date: "",
    delivery_time: ""
  });

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    // Fetch available drivers
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/drivers/available", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch available drivers");
        }

        const data = await response.json();
        setDrivers(data.drivers || []);
      } catch (error) {
        console.error("Drivers fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load available drivers",
          variant: "destructive",
        });
      }
    };

    fetchDrivers();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setDelivery({
      ...delivery,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setDelivery({
      ...delivery,
      [name]: value
    });
  };

  const handleDriverChange = (value: string) => {
    setSelectedDriver(value);
  };

  const calculatePrice = async () => {
    if (!delivery.pickup_address || !delivery.delivery_address) {
      toast({
        title: "Missing information",
        description: "Please enter pickup and delivery addresses to calculate price",
        variant: "destructive",
      });
      return;
    }

    setEstimating(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch("http://localhost:8000/api/deliveries/estimate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup_address: delivery.pickup_address,
          delivery_address: delivery.delivery_address,
          package_size: delivery.package_size,
          package_weight: delivery.package_weight,
          delivery_type: delivery.delivery_type
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to estimate price");
      }

      const data = await response.json();
      setPrice(data.price || 0);

      toast({
        title: "Price estimated",
        description: `Estimated delivery cost: $${data.price.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Price estimation error:", error);
      toast({
        title: "Error",
        description: "Failed to estimate price",
        variant: "destructive",
      });
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price) {
      toast({
        title: "Missing price estimation",
        description: "Please calculate the price before creating a delivery",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch("http://localhost:8000/api/client/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...delivery,
          price,
          driver_id: selectedDriver || null
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create delivery");
      }

      const data = await response.json();
      
      toast({
        title: "Delivery created",
        description: `Your delivery has been created successfully. Tracking number: ${data.tracking_number}`,
      });
      
      navigate(`/client/deliveries/${data.id}`);
    } catch (error) {
      console.error("Delivery creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create delivery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Delivery</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Pickup Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pickup_address">Pickup Address</Label>
                    <Input 
                      id="pickup_address" 
                      name="pickup_address"
                      placeholder="123 Main St, City, Country"
                      value={delivery.pickup_address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup_contact">Contact Name</Label>
                    <Input 
                      id="pickup_contact" 
                      name="pickup_contact"
                      placeholder="John Doe"
                      value={delivery.pickup_contact}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup_phone">Contact Phone</Label>
                    <Input 
                      id="pickup_phone" 
                      name="pickup_phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={delivery.pickup_phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="delivery_address">Delivery Address</Label>
                    <Input 
                      id="delivery_address" 
                      name="delivery_address"
                      placeholder="456 Elm St, City, Country"
                      value={delivery.delivery_address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient_name">Recipient Name</Label>
                    <Input 
                      id="recipient_name" 
                      name="recipient_name"
                      placeholder="Jane Doe"
                      value={delivery.recipient_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient_phone">Recipient Phone</Label>
                    <Input 
                      id="recipient_phone" 
                      name="recipient_phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={delivery.recipient_phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Package Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="package_size">Package Size</Label>
                  <Select 
                    value={delivery.package_size} 
                    onValueChange={(value) => handleSelectChange("package_size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra_large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="package_weight">Package Weight (kg)</Label>
                  <Input 
                    id="package_weight" 
                    name="package_weight"
                    type="number"
                    step="0.1"
                    placeholder="1.5"
                    value={delivery.package_weight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="package_description">Package Description</Label>
                  <Textarea 
                    id="package_description" 
                    name="package_description"
                    placeholder="Brief description of the package contents"
                    value={delivery.package_description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_type">Delivery Type</Label>
                  <Select 
                    value={delivery.delivery_type} 
                    onValueChange={(value) => handleSelectChange("delivery_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (1-2 days)</SelectItem>
                      <SelectItem value="express">Express (Same day)</SelectItem>
                      <SelectItem value="economy">Economy (2-3 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="delivery_date">Preferred Delivery Date</Label>
                  <Input 
                    id="delivery_date" 
                    name="delivery_date"
                    type="date"
                    value={delivery.delivery_date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_time">Preferred Delivery Time</Label>
                  <Input 
                    id="delivery_time" 
                    name="delivery_time"
                    type="time"
                    value={delivery.delivery_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                  <Textarea 
                    id="delivery_instructions" 
                    name="delivery_instructions"
                    placeholder="Special instructions for the delivery driver"
                    value={delivery.delivery_instructions}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Route Preview</h2>
              <div className="h-80 rounded-md overflow-hidden">
                {/* Placeholder for Google Maps component */}
                <GoogleMapComponent 
                  pickupAddress={delivery.pickup_address}
                  deliveryAddress={delivery.delivery_address}
                  height="100%"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Driver Selection</h2>
              {drivers.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driver">Select a Driver (Optional)</Label>
                    <Select value={selectedDriver} onValueChange={handleDriverChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver or let us assign one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Auto-assign driver</SelectItem>
                        {drivers.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.name} ({driver.rating} ★)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No drivers available. We'll assign one for you.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Price Estimation</h2>
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-muted-foreground">Estimated delivery cost:</p>
                  <p className="text-3xl font-bold">${price.toFixed(2)}</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={calculatePrice}
                  disabled={estimating || !delivery.pickup_address || !delivery.delivery_address}
                >
                  {estimating ? "Calculating..." : "Calculate Price"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/client/deliveries")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !price}>
              {loading ? "Creating..." : "Create Delivery"}
            </Button>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
};

export default NewDelivery;
