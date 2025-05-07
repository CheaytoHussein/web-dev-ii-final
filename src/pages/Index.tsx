
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Swift Track Pay Hub</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>For Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Looking for reliable delivery services? Send your packages safely and track them in real-time.</p>
            {isAuthenticated ? (
              <Link to="/client/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login?type=client">
                <Button className="w-full">Get Started</Button>
              </Link>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>For Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Join our platform as a driver. Set your own rates, manage deliveries, and earn money on your terms.</p>
            {isAuthenticated ? (
              <Link to="/driver/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login?type=driver">
                <Button className="w-full">Join as Driver</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Administrative portal for platform management.</p>
            <Link to="/admin/login">
              <Button className="w-full" variant="outline">Admin Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
