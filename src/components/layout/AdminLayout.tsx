import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, LogOut, Search, User, Menu, ChevronDown, Check, Trash2 } from "lucide-react";
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
import { fetchNotifications, prependNotification, markNotificationAsRead, removeNotification, deleteNotification, markNotificationReadLocal } from "@/features/notifications/notificationSlice";
interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, token } = useSelector((state: any) => state.auth);
  const storedNotifications = useSelector((state: any) => state.notifications?.list || []);
  const notificationsTargetPath = "/bookings-and-sessions";
  const isLocalOnlyNotification = (notification: any) => {
    const id = String(notification?._id || notification?.id || "");
    return id.startsWith("rt_");
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const unreadCount = storedNotifications.filter((n: any) => !n?.read).length;

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  // Load persisted admin notifications for header (survives refresh)
  useEffect(() => {
    if (!token) return;
    dispatch(fetchNotifications() as any);
  }, [dispatch, token]);

  // Setup real-time notifications
  useEffect(() => {
    if (!token || !user) return;

    // Determine WebSocket server URL based on environment
    let serverUrl;
    if (
      import.meta.env.VITE_API_BASE_URL &&
      import.meta.env.VITE_API_BASE_URL.includes("localhost")
    ) {
      // Development environment - use localhost WebSocket server
      serverUrl = "http://localhost:5000";
    } else if (import.meta.env.VITE_API_BASE_URL) {
      // Production environment - extract WebSocket URL from API URL
      serverUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "");
    } else {
      // Fallback to production WebSocket server URL
      serverUrl = "https://tanishphysiofitness.in/api";
    }

    // Connect to notification socket
    const socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Admin notification socket connected");
      // Join admin notification room
      socket.emit("join-admin-notifications", {});
    });

    socket.on("admin-notifications-joined", (data) => {
      console.log("Joined admin notifications room");
    });

    // Listen for admin notifications
    socket.on("admin-notification", (data) => {
      console.log("Received admin notification:", data);

      // Add to notifications array
      const newNotification: any = {
        _id: data.id || `rt_${Date.now()}`,
        title: data.title || "New Notification",
        message: data.message || "You have a new notification",
        type: data.type || "system",
        read: false,
        createdAt: data.timestamp || new Date().toISOString(),
        updatedAt: data.timestamp || new Date().toISOString(),
        recipientType: "admin",
        bookingId: data.bookingId,
        sessionId: data.sessionId,
        clientName: data.clientName,
        serviceName: data.serviceName,
      };

      dispatch(prependNotification(newNotification) as any);

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
          toast.success(`${data.title}: ${data.message}`, toastOptions);
          break;
        case "session":
          toast.info(`${data.title}: ${data.message}`, toastOptions);
          break;
        case "payment":
          toast.warning(`${data.title}: ${data.message}`, toastOptions);
          break;
        case "system":
        default:
          toast(`${data.title}: ${data.message}`, toastOptions);
          break;
      }
    });

    socket.on("disconnect", () => {
      console.log("Admin notification socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Admin notification socket connection error:", error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [token, user]);

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
              <DropdownMenuContent
                align="end"
                className="w-96 max-h-[600px] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
                  <h4 className="font-semibold">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {storedNotifications.length > 0 ? (
                    storedNotifications.slice(0, 3).map((notification: any) => (
                      <div
                        key={notification._id || notification.id}
                        className={`flex flex-col p-4 border-b last:border-0 ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between w-full mb-2">
                          <div 
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => navigate(notificationsTargetPath)}
                          >
                            {/* Icon based on type */}
                            {notification.type === "booking" && (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            {notification.type === "session" && (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            {notification.type === "payment" && (
                              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-yellow-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            )}
                            {notification.type === "system" && (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-gray-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            )}

                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {notification.message}
                              </p>
                            </div>
                          </div>

                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-2 flex-shrink-0" />
                          )}
                          
                          {/* Action buttons */}
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = notification._id || notification.id;
                                if (isLocalOnlyNotification(notification)) {
                                  dispatch(markNotificationReadLocal(id));
                                } else {
                                  dispatch(markNotificationAsRead(id));
                                }
                              }}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title={notification.read ? "Already read" : "Mark as read"}
                            >
                              <Check className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = notification._id || notification.id;
                                if (isLocalOnlyNotification(notification)) {
                                  dispatch(removeNotification(id));
                                } else {
                                  dispatch(deleteNotification(id));
                                }
                              }}
                              className="p-1 hover:bg-destructive/10 rounded transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>

                        {/* Additional details for booking/session notifications */}
                        {(notification.type === "booking" ||
                          notification.type === "session") && (
                          <div className="w-full mt-2 pt-2 border-t border-gray-100 text-xs text-muted-foreground">
                            {notification.clientName && (
                              <p>
                                Client:{" "}
                                <span className="font-medium">
                                  {notification.clientName}
                                </span>
                              </p>
                            )}
                            {notification.serviceName && (
                              <p>
                                Service:{" "}
                                <span className="font-medium">
                                  {notification.serviceName}
                                </span>
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.createdAt
                                ? new Date(notification.createdAt).toLocaleString()
                                : "Just now"}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                      No notifications yet
                    </div>
                  )}
                </div>
                {storedNotifications.length > 0 && (
                  <div className="border-t p-3">
                    <DropdownMenuItem
                      className="flex items-center justify-center p-2 cursor-pointer text-primary hover:text-primary"
                      onClick={() => navigate(notificationsTargetPath)}
                    >
                      <span className="text-sm font-medium">
                        View all notifications
                      </span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </DropdownMenuItem>
                  </div>
                )}
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
