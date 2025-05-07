import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationsMenuProps {
  notifications: any[];
}

export const NotificationsMenu = ({ notifications }: NotificationsMenuProps) => {
  return (
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
  );
};
