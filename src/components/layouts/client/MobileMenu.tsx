import { X, Menu, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "./Navigation.tsx";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onLogout: () => void;
}

export const MobileMenu = ({ isOpen, setIsOpen, onLogout }: MobileMenuProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-xl font-bold text-primary">SwiftTrack</Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <Navigation isMobile={true} onItemClick={() => setIsOpen(false)} />
          <Separator />
          <Button variant="ghost" className="justify-start" onClick={onLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
