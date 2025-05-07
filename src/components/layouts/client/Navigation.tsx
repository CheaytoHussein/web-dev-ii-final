import { Link, useLocation } from "react-router-dom";
import { Package, Users } from "lucide-react";

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const Navigation = ({ isMobile = false, onItemClick }: NavigationProps) => {
  const location = useLocation();
  
  const navLinks: NavLink[] = [
    { path: "/client/dashboard", label: "Dashboard", icon: <Package className="h-5 w-5" /> },
    { path: "/client/deliveries", label: "Deliveries", icon: <Package className="h-5 w-5" /> },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return isMobile ? (
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
          onClick={onItemClick}
        >
          {link.icon}
          <span className="ml-2">{link.label}</span>
        </Link>
      ))}
    </nav>
  ) : (
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
  );
};
