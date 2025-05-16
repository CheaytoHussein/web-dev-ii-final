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

interface Delivery {
  pickup_address: string;
  pickup_contact: string;
  pickup_phone: string;
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
  package_size: string;
  package_weight: string;
  package_description: string;
  delivery_instructions: string;
  is_fragile: boolean;
  delivery_type: string;
  delivery_date: string;
  delivery_time: string;
}

interface Driver {
  id: number;
  name: string;
  // Add other driver properties as needed
}

const NewDelivery = () => {
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState<Delivery>({
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

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [estimating, setEstimating] = useState<boolean>(false);

  useEffect(() => {
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

  const handleSelectChange = (name: keyof Delivery, value: string) => {
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

    // Simple price calculation (replace with your actual logic)
    const basePrice = 10;
    let calculatedPrice = basePrice;

    // Add multipliers based on package size
    const sizeMultipliers = {
      small: 1,
      medium: 1.5,
      large: 2,
      extra_large: 3
    };
    calculatedPrice *= sizeMultipliers[delivery.package_size];

    // Add multipliers based on delivery type
    const typeMultipliers = {
      standard: 1,
      express: 1.5,
      economy: 0.8
    };
    calculatedPrice *= typeMultipliers[delivery.delivery_type];

    // Add weight charge
    const weight = parseFloat(delivery.package_weight) || 0;
    if (weight > 5) {
      calculatedPrice += (weight - 5) * 0.5;
    }

    // Fragile item surcharge
    if (delivery.is_fragile) {
      calculatedPrice += 5;
    }

    setPrice(parseFloat(calculatedPrice.toFixed(2)));
    setEstimating(false);

    toast({
      title: "Price estimated",
      description: `Estimated delivery cost: $${calculatedPrice.toFixed(2)}`,
    });
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
      if (!token) {
        navigate("/login?type=client");
        return;
      }

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create delivery");
      }

      toast({
        title: "Delivery created",
        description: `Your delivery has been created successfully. Tracking number: ${data.tracking_number}`,
      });

      navigate(`/client/deliveries/${data.id}`);
    } catch (error) {
      console.error("Delivery creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery",
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
            {/* Pickup and Delivery Information Cards */}
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

            {/* Package Information Card */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Package Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="package_size">Package Size</Label>
                    <Select
                        value={delivery.package_size}
                        onValueChange={(value) => handleSelectChange("package_size", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xlarge">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="package_weight">Weight (kg)</Label>
                    <Input
                        id="package_weight"
                        name="package_weight"
                        type="number"
                        placeholder="0.5"
                        value={delivery.package_weight}
                        onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="package_description">Description</Label>
                    <Textarea
                        id="package_description"
                        name="package_description"
                        placeholder="What's in the package?"
                        value={delivery.package_description}
                        onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                        id="is_fragile"
                        name="is_fragile"
                        type="checkbox"
                        checked={delivery.is_fragile}
                        onChange={handleChange}
                    />
                    <Label htmlFor="is_fragile">Fragile Item</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options Card */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="delivery_type">Delivery Type</Label>
                    <Select
                        value={delivery.delivery_type}
                        onValueChange={(value) => handleSelectChange("delivery_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                        <SelectItem value="express">Express (1-2 days)</SelectItem>
                        <SelectItem value="economy">Economy (5-7 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delivery_date">Delivery Date</Label>
                    <Input
                        id="delivery_date"
                        name="delivery_date"
                        type="date"
                        value={delivery.delivery_date}
                        onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_time">Preferred Time</Label>
                    <Input
                        id="delivery_time"
                        name="delivery_time"
                        type="time"
                        value={delivery.delivery_time}
                        onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="delivery_instructions">Special Instructions</Label>
                    <Textarea
                        id="delivery_instructions"
                        name="delivery_instructions"
                        placeholder="Any special instructions for the driver?"
                        value={delivery.delivery_instructions}
                        onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Selection Card */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Select Driver</h2>
                <Select
                    value={selectedDriver}
                    onValueChange={handleDriverChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.length > 0 ? (
                        drivers.map((driver) => (
                            <SelectItem
                                key={driver.id}
                                value={driver.id.toString()}
                            >
                              {driver.name}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem disabled>No drivers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <div className="mb-8">
              <GoogleMapComponent
                  pickupAddress={delivery.pickup_address}
                  deliveryAddress={delivery.delivery_address}
              />
            </div>

            {/* Price Display */}
            {price > 0 && (
                <div className="mb-8 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">
                    Estimated Price: ${price.toFixed(2)}
                  </h3>
                </div>
            )}

            {/* Final Submission */}
            <div className="flex justify-between items-center">
              <Button
                  type="button"
                  onClick={calculatePrice}
                  disabled={estimating}
                  variant="outline"
              >
                {estimating ? "Estimating..." : "Estimate Price"}
              </Button>
              <Button
                  type="submit"
                  disabled={loading || estimating || price <= 0}
              >
                {loading ? "Creating..." : "Create Delivery"}
              </Button>
            </div>
          </form>
        </div>
      </ClientLayout>
  );
};

export default NewDelivery;