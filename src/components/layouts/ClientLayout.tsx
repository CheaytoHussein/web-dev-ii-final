import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Header } from "./client/Header.tsx";
import { Footer } from "./client/Footer.tsx";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch user data from API
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login?type=client");
          return;
        }

        const response = await fetch("http://localhost:8000/api/auth/user", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("User fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        // Redirect to login if authentication fails
        navigate("/login?type=client");
      } finally {
        setLoading(false);
      }
    };

    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const response = await fetch("http://localhost:8000/api/client/notifications", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Notifications fetch error:", error);
      }
    };

    fetchUser();
    fetchNotifications();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // Call logout API
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      // Clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_type");
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if the API call fails, clear local storage and redirect
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_type");
      navigate("/");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        user={user}
        notifications={notifications}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};

export default ClientLayout;