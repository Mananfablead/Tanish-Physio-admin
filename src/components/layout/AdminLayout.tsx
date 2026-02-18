import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, LogOut, Search, User, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  logout,
} from "@/features/auth/authSlice";
import { io } from "socket.io-client";
import { toast } from "sonner";
interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, token } = useSelector((state: any) => state.auth);
  console.log("object", user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  // Setup real-time notifications
  useEffect(() => {
    if (!token || !user) return;

    // Connect to notification socket
    const socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to admin notification socket");
      // Join admin notification room
      socket.emit("join-admin-notifications", {});
    });

    socket.on("admin-notifications-joined", (data) => {
      console.log("Joined admin notifications channel:", data);
    });

    // Listen for admin notifications
    socket.on("admin-notification", (data) => {
      console.log("Admin received notification:", data);

      // Add to notifications array
      const newNotification = {
        id: Date.now(),
        title: data.title || "New Notification",
        message: data.message || "You have a new notification",
        time: "Just now",
        unread: true,
        type: data.type || "system",
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification with appropriate styling based on type
      const toastOptions = {
        description: data.type ? `Type: ${data.type}` : undefined,
        duration: 5000,
      };

      // Different toast styles based on notification type
      switch (data.type) {
        case "connection_failure":
          toast.error(`${data.title}: ${data.message}`, toastOptions);
          break;
        case "booking":
        case "session":
          toast.success(`${data.title}: ${data.message}`, toastOptions);
          break;
        case "payment":
          toast.info(`${data.title}: ${data.message}`, toastOptions);
          break;
        case "system":
        default:
          toast(`${data.title}: ${data.message}`, toastOptions);
          break;
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from admin notification socket");
    });

    socket.on("connect_error", (error) => {
      console.error("Admin notification socket connection error:", error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AdminSidebar
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users, therapists, sessions..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div> */}
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-4 cursor-pointer hover:bg-muted"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No notifications yet
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center justify-center p-3 cursor-pointer">
                  <span
                    className="text-sm text-primary font-medium"
                    onClick={() => navigate("/notifications")}
                  >
                    View all notifications
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>

                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-5 h-5 mr-3 text-primary" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
                  <LogOut className="w-5 h-5 mr-3 text-primary flex-shrink-0" />{" "}
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your admin account. Any unsaved changes
              will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                dispatch(logout());
                navigate("/login");
                setIsLogoutDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
