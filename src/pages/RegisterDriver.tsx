import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import GoogleMapComponent from "@/components/GoogleMapComponent";

const RegisterDriver = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        address: "",
        vehicle_type: "",
        vehicle_model: "",
        vehicle_color: "",
        vehicle_plate_number: "",
        latitude: "",
        longitude: "",
        agree_terms: false,
    });
    const [loading, setLoading] = useState(false);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setDriverLocation({ lat: latitude, lng: longitude });
                    setFormData((prev) => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    }));
                },
                (error) => {
                    console.error("Geolocation error:", error);
                }
            );
        }
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleVehicleTypeChange = (value: string) => {
        setFormData({ ...formData, vehicle_type: value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            toast({
                title: "Password mismatch",
                description: "The passwords you entered do not match",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/auth/register/driver", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Registration successful",
                    description: "You may now login after email verification",
                });
                navigate("/verify-email", { state: { email: formData.email } });
            } else {
                throw new Error(data.message || "Registration failed");
            }
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "Please try again later",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center py-8 px-4">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Register as Driver</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="grid gap-4">
                        {/* User fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input id="password_confirmation" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required />
                        </div>

                        {/* Driver profile fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle_type">Vehicle Type</Label>
                            <Select onValueChange={handleVehicleTypeChange}>
                                <SelectTrigger id="vehicle_type">
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sedan">Sedan</SelectItem>
                                    <SelectItem value="suv">SUV</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                    <SelectItem value="truck">Truck</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle_model">Vehicle Model</Label>
                            <Input id="vehicle_model" name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle_color">Vehicle Color</Label>
                            <Input id="vehicle_color" name="vehicle_color" value={formData.vehicle_color} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle_plate_number">Plate Number</Label>
                            <Input id="vehicle_plate_number" name="vehicle_plate_number" value={formData.vehicle_plate_number} onChange={handleChange} required />
                        </div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input id="latitude" name="latitude" value={formData.latitude} readOnly />
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input id="longitude" name="longitude" value={formData.longitude} readOnly />
                        <div className="grid gap-2">
                            <Label>Current Location</Label>
                            <GoogleMapComponent
                                driverLocation={driverLocation}
                                isLive={true}
                                height="300px"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="agree_terms"
                                name="agree_terms"
                                checked={formData.agree_terms}
                                onCheckedChange={(checked) => setFormData({ ...formData, agree_terms: checked === true })}
                                required
                            />
                            <Label htmlFor="agree_terms" className="text-sm">
                                I agree to the Terms of Service and Privacy Policy
                            </Label>
                        </div>

                        <Button type="submit" disabled={loading || !formData.agree_terms}>
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login?type=driver" className="text-primary hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterDriver;