import { Link } from "react-router-dom";
import { NotificationsMenu } from "./NotificationsMenu.tsx";
import { UserMenu } from "./UserMenu.tsx";
import { MobileMenu } from "./MobileMenu.tsx";
import { Navigation } from "./Navigation.tsx";

interface HeaderProps {
  user: any;
  notifications: any[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  handleLogout: () => void;
}

export const Header = ({ 
  user,
  notifications,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout
}: HeaderProps) => {
  return (
    <header className="border-b sticky top-0 z-30 bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-primary mr-6">SwiftTrack</Link>
          <Navigation />
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationsMenu notifications={notifications} />
          <UserMenu user={user} />
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            setIsOpen={setIsMobileMenuOpen} 
            onLogout={handleLogout} 
          />
        </div>
      </div>
    </header>
  );
};