import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routes
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import AdminPage from "@/components/layout/AdminPage";

// Pages
import ComingSoonPage from "./pages/ComingSoonPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import Therapists from "./pages/Therapists";
import TherapistProfile from "./pages/TherapistProfile";
import Questionnaires from "./pages/Questionnaires";
import Sessions from "./pages/Sessions";
import Availability from "./pages/Availability";
import SessionRecordings from "./pages/SessionRecordings";
import LiveSessions from "./pages/LiveSessions";
import LiveChatHistory from "./pages/LiveChatHistory";
import VideoCallChatHistory from "./pages/VideoCallChatHistory";
import AdminDashboard from "./pages/AdminDashboard";
import Subscriptions from "./pages/Subscriptions";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import StaffSessions from "./pages/StaffSessions";
import Services from "./pages/Services";
import GroupSessionsPage from "./pages/GroupSessionsPage";
import GroupVideoCallPage from "./pages/GroupVideoCallPage";
import ServiceDetails from "./pages/ServiceDetails";
import AddService from "./pages/AddService";
import UpdateService from "./pages/UpdateService";
import AddSubscription from "./pages/AddSubscription";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import EditSubscription from "./pages/EditSubscription";
import Bookings from "./pages/Bookings";
import Courses from "./pages/Courses";
import CMS from "./pages/CMS";
import ContentDetails from "./pages/ContentDetails";
import Testimonials from "./pages/Testimonials";
import ContactMessages from "./pages/ContactMessages";
import VideoCallPage from "./pages/VideoCallPage";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import ExpirationManagement from "./pages/ExpirationManagement";
import BookingDetails from "./pages/BookingDetails";
import PaymentDetails from "./pages/PaymentDetails";
import OffersManagement from "./pages/OffersManagement";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter basename="/admin">
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* ================= PROTECTED ================= */}
          {/* <Route path="/" element={<ComingSoonPage />} /> */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Dashboard />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Users />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <UserProfile />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/therapists"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Therapists />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/therapists/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <TherapistProfile />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/questionnaires"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Questionnaires />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Sessions />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/availability"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Availability />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/session-recordings"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <SessionRecordings />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/live-sessions"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <LiveSessions />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/live-chat-history"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <LiveChatHistory />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <AdminDashboard />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/video-call-chat-history"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <VideoCallChatHistory />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Subscriptions />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-subscription"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <AddSubscription />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <SubscriptionDetails />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions/edit/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <EditSubscription />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Payments />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-details/:paymentId"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <PaymentDetails />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Notifications />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Reports />
                </AdminPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <OffersManagement />
                </AdminPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/testimonials"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Testimonials />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Profile />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/sessions/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <StaffSessions />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Services />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <ServiceDetails />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services/slug/:slug"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <ServiceDetails />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <BookingDetails />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-service"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <AddService />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services/:id/edit"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <UpdateService />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services/slug/:slug/edit"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <UpdateService />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Bookings />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expiration-management"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <ExpirationManagement />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Courses />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expiration-management"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <ExpirationManagement />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cms"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <CMS />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cms/:id"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <ContentDetails />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact-messages"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <ContactMessages />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/testimonials"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Testimonials />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          {/* Group Sessions */}
          <Route
            path="/group-sessions"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <GroupSessionsPage />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          {/* Group Video Call (Protected but no layout) */}
          <Route
            path="/group-video-call/:id"
            element={
              <ProtectedRoute>
                <GroupVideoCallPage />
              </ProtectedRoute>
            }
          />

          {/* Video Call (Protected but no layout) */}
          <Route
            path="/video-call/:id"
            element={
              <ProtectedRoute>
                <VideoCallPage />
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
