
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
  Bell,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch admin data from API
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch("http://localhost:8000/api/admin/user", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const data = await response.json();
        setAdmin(data.admin);
      } catch (error) {
        console.error("Admin fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load admin data",
          variant: "destructive",
        });
        // Redirect to login if authentication fails
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const response = await fetch("http://localhost:8000/api/admin/notifications", {
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

    fetchAdmin();
    fetchNotifications();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      
      // Call logout API
      await fetch("http://localhost:8000/api/admin/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      // Clear local storage
      localStorage.removeItem("admin_token");
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Redirect to admin login page
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if the API call fails, clear local storage and redirect
      localStorage.removeItem("admin_token");
      navigate("/admin/login");
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { path: "/admin/drivers", label: "Drivers", icon: <User className="h-5 w-5" /> },
    { path: "/admin/deliveries", label: "Deliveries", icon: <Package className="h-5 w-5" /> },
    { path: "/admin/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-30 bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="text-2xl font-bold text-primary mr-6">
              SwiftTrack Admin
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification: any) => (
                    <DropdownMenuItem key={notification.id}>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">{notification.title}</span>
                        <span className="text-sm text-muted-foreground">{notification.message}</span>
                        <span className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Admin Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{admin?.name}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Link to="/admin/dashboard" className="text-xl font-bold text-primary">SwiftTrack Admin</Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                  <nav className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActiveRoute(link.path)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.icon}
                        <span className="ml-2">{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                  <Separator />
                  <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SwiftTrack Admin Panel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
