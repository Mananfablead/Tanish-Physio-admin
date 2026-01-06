  import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import Therapists from "./pages/Therapists";
import Questionnaires from "./pages/Questionnaires";
import Sessions from "./pages/Sessions";
import Availability from "./pages/Availability";
import SessionRecordings from "./pages/SessionRecordings";
import LiveSessions from "./pages/LiveSessions";
import Subscriptions from "./pages/Subscriptions";
import Payments from "./pages/Payments";
import ChatMonitor from "./pages/ChatMonitor";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import StaffSessions from "./pages/StaffSessions";
import NotFound from "./pages/NotFound";
import TherapistProfile from "./pages/TherapistProfile";
import VideoCallPage from "./pages/VideoCallPage";
import Services from "./pages/Services";
import Bookings from "./pages/Bookings";

const queryClient = new QueryClient();

// Wrapper component for pages that need the admin layout
const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <AdminLayout>{children}</AdminLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminPage><Dashboard /></AdminPage>} />
          <Route path="/users" element={<AdminPage><Users /></AdminPage>} />
          <Route path="/users/:id" element={<AdminPage><UserProfile /></AdminPage>} />
        <Route path="/therapists" element={<AdminPage><Therapists /></AdminPage>} />
          <Route path="/therapists/:id" element={<AdminPage><TherapistProfile /></AdminPage>} />
             <Route path="/questionnaires" element={<AdminPage><Questionnaires /></AdminPage>} />
     <Route path="/sessions" element={<AdminPage><Sessions /></AdminPage>} />
            <Route path="/availability" element={<AdminPage><Availability /></AdminPage>} />
            <Route path="/session-recordings" element={<AdminPage><SessionRecordings /></AdminPage>} />
            <Route path="/session-recordings/:userId" element={<AdminPage><SessionRecordings /></AdminPage>} />
            <Route path="/live-sessions" element={<AdminPage><LiveSessions /></AdminPage>} />
            <Route path="/subscriptions" element={<AdminPage><Subscriptions /></AdminPage>} />
          <Route path="/payments" element={<AdminPage><Payments /></AdminPage>} />
          <Route path="/chat" element={<AdminPage><ChatMonitor /></AdminPage>} />
          <Route path="/feedback" element={<AdminPage><Feedback /></AdminPage>} />
          <Route path="/notifications" element={<AdminPage><Notifications /></AdminPage>} />
          <Route path="/reports" element={<AdminPage><Reports /></AdminPage>} /> 
          <Route path="/profile" element={<AdminPage><Profile /></AdminPage>} />
          <Route path="/staff/sessions/:id" element={<AdminPage><StaffSessions /></AdminPage>} />
          <Route path="/services" element={<AdminPage><Services /></AdminPage>} />
          <Route path="/bookings" element={<AdminPage><Bookings /></AdminPage>} />
          <Route path="/video-call/:sessionId" element={<VideoCallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
