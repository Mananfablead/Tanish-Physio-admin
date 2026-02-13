import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  Calendar,
  CreditCard,
  Wallet,
  MessageSquare,
  Star,
  Bell,
  BarChart3,
  ChevronLeft,
  LogOut,
  Activity,
  ClipboardCheck,
  Clock,
  Video,
  BookOpen,
  FileText,
  Quote,
  AlertCircle,
} from "lucide-react";
import logo from "../../assets/logo.webp";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
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
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Clients", path: "/users" },
  // { icon: UserCog, label: "Staff", path: "/therapists" },
  { icon: ClipboardList, label: "Services", path: "/services" },
  // { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: ClipboardList, label: "Questionnaires", path: "/questionnaires" },
  { icon: Clock, label: "Schedule", path: "/availability" },
  { icon: Calendar, label: "Bookings", path: "/bookings" },
  { icon: Calendar, label: "Sessions", path: "/sessions" },
  { icon: Video, label: "Live & Upcoming", path: "/live-sessions" },
  { icon: Video, label: "Session Recordings", path: "/session-recordings" },
  { icon: CreditCard, label: "Plans & Subscriptions", path: "/subscriptions" },
  // { icon: AlertCircle, label: "Expiration Management", path: "/expiration-management" },
  { icon: Wallet, label: "Payments", path: "/payments" },
  { icon: FileText, label: "CMS", path: "/cms" },
  { icon: Quote, label: "Testimonials", path: "/testimonials" },
  // { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: CreditCard, label: "Offers & Coupons", path: "/offers" },
  // { icon: MessageSquare, label: "Chat Monitor", path: "/chat" },
  // { icon: Star, label: "Feedback", path: "/feedback" },
];

export function AdminSidebar({ isMobileOpen, onMobileClose, collapsed: propCollapsed, onCollapseToggle }: { isMobileOpen: boolean; onMobileClose: () => void; collapsed?: boolean; onCollapseToggle?: () => void }) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const effectiveCollapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const effectiveOnCollapseToggle = onCollapseToggle || (() => setLocalCollapsed(!localCollapsed));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  return (
    <aside
      className={cn(
        "h-full shrink-0 transition-all duration-300 bg-sidebar text-sidebar-foreground flex flex-col",
        effectiveCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "flex" : "hidden lg:flex"
      )}
      style={{ zIndex: 40 }}
    >
      {/* Logo */}
      <div className="flex h-18 items-center justify-between px-4 border-b border-sidebar-border">
        {!effectiveCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex-col justify-center py-4 relative w-[--sidebar-width] z-10">

              <Link to="/" className="">
                <img src={logo} alt="Logo" className="h-20 w-auto " />
              </Link>

            </div>
          </div>
        )}
        <button
          onClick={effectiveOnCollapseToggle}
          className={cn(
            "p-1.5 rounded-md hover:bg-sidebar-accent transition-colors",
            effectiveCollapsed && "mx-auto"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 text-sidebar-foreground transition-transform",
              effectiveCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 hide-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!effectiveCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setIsLogoutDialogOpen(true)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            effectiveCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!effectiveCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your admin account. Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                dispatch(logout());
                navigate("/login");
                onMobileClose();
                setIsLogoutDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
