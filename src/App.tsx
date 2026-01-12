// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AdminLayout } from "@/components/layout/AdminLayout";
// import ProtectedRoute from "@/routes/ProtectedRoute";
// import PublicRoute from "@/routes/PublicRoute";

// // Pages
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Users from "./pages/Users";
// import UserProfile from "./pages/UserProfile";
// import Therapists from "./pages/Therapists";
// import Questionnaires from "./pages/Questionnaires";
// import Sessions from "./pages/Sessions";
// import Availability from "./pages/Availability";
// import SessionRecordings from "./pages/SessionRecordings";
// import LiveSessions from "./pages/LiveSessions";
// import Subscriptions from "./pages/Subscriptions";
// import Payments from "./pages/Payments";
// import ChatMonitor from "./pages/ChatMonitor";
// import Feedback from "./pages/Feedback";
// import Notifications from "./pages/Notifications";
// import Reports from "./pages/Reports";
// import Profile from "./pages/Profile";
// import StaffSessions from "./pages/StaffSessions";
// import NotFound from "./pages/NotFound";
// import TherapistProfile from "./pages/TherapistProfile";
// import VideoCallPage from "./pages/VideoCallPage";
// import Services from "./pages/Services";
// import Bookings from "./pages/Bookings";
// import Courses from "./pages/Courses";
// import ServiceDetails from "./pages/ServiceDetails";

// const queryClient = new QueryClient();

// // Wrapper component for pages that need the admin layout
// const AdminPage = ({ children }: { children: React.ReactNode }) => (
//   <AdminLayout>{children}</AdminLayout>
// );

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/" element={<AdminPage><Dashboard /></AdminPage>} />
//           <Route path="/users" element={<AdminPage><Users /></AdminPage>} />
//           <Route path="/users/:id" element={<AdminPage><UserProfile /></AdminPage>} />
//           <Route path="/therapists" element={<AdminPage><Therapists /></AdminPage>} />
//           <Route path="/therapists/:id" element={<AdminPage><TherapistProfile /></AdminPage>} />
//           <Route path="/questionnaires" element={<AdminPage><Questionnaires /></AdminPage>} />
//           <Route path="/sessions" element={<AdminPage><Sessions /></AdminPage>} />
//           <Route path="/availability" element={<AdminPage><Availability /></AdminPage>} />
//           <Route path="/session-recordings" element={<AdminPage><SessionRecordings /></AdminPage>} />
//           <Route path="/session-recordings/:userId" element={<AdminPage><SessionRecordings /></AdminPage>} />
//           <Route path="/live-sessions" element={<AdminPage><LiveSessions /></AdminPage>} />
//           <Route path="/subscriptions" element={<AdminPage><Subscriptions /></AdminPage>} />
//           <Route path="/payments" element={<AdminPage><Payments /></AdminPage>} />
//           <Route path="/chat" element={<AdminPage><ChatMonitor /></AdminPage>} />
//           <Route path="/feedback" element={<AdminPage><Feedback /></AdminPage>} />
//           <Route path="/notifications" element={<AdminPage><Notifications /></AdminPage>} />
//           <Route path="/reports" element={<AdminPage><Reports /></AdminPage>} />
//           <Route path="/profile" element={<AdminPage><Profile /></AdminPage>} />
//           <Route path="/staff/sessions/:id" element={<AdminPage><StaffSessions /></AdminPage>} />
//           <Route path="/services" element={<AdminPage><Services /></AdminPage>} />
//           <Route path="/services/:id" element={<AdminPage><ServiceDetails /></AdminPage>} />
//           <Route path="/bookings" element={<AdminPage><Bookings /></AdminPage>} />
//           <Route path="/courses" element={<AdminPage><Courses /></AdminPage>} />
//           <Route path="/video-call/:sessionId" element={<VideoCallPage />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;


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
import Subscriptions from "./pages/Subscriptions";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import StaffSessions from "./pages/StaffSessions";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import AddService from "./pages/AddService";
import UpdateService from "./pages/UpdateService";
import AddSubscription from "./pages/AddSubscription";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import Bookings from "./pages/Bookings";
import Courses from "./pages/Courses";
import VideoCallPage from "./pages/VideoCallPage";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => (

  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
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
            path="/courses"
            element={
              <ProtectedRoute>
                <AdminPage>
                  <Courses />
                </AdminPage>
              </ProtectedRoute>
            }
          />

          {/* Video Call (Protected but no layout) */}
          <Route
            path="/video-call/:sessionId"
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
