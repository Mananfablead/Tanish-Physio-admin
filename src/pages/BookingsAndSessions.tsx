import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import Bookings from "./Bookings";
import Sessions from "./Sessions";

export default function BookingsAndSessions() {
  const [activeMainTab, setActiveMainTab] = useState<"bookings" | "sessions">(
    "bookings"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle switching to sessions tab
  const handleSwitchToSessions = () => {
    setActiveMainTab("sessions");
  };

  if (loading) {
    return <PageLoader text="Loading bookings and sessions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Bookings & Sessions Management</h1>
          <p className="page-subtitle">
            Manage all bookings and therapy sessions in one unified interface
          </p>
        </div>
      </div>

      {/* Main Tabs - Bookings vs Sessions */}
      <Tabs
        value={activeMainTab}
        onValueChange={(v) => setActiveMainTab(v as "bookings" | "sessions")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Sessions
          </TabsTrigger>
        </TabsList>

        {/* BOOKINGS TAB CONTENT */}
        <TabsContent value="bookings" className="space-y-6 mt-6">
          <Bookings onStatusConfirmed={handleSwitchToSessions} />
        </TabsContent>

        {/* SESSIONS TAB CONTENT */}
        <TabsContent value="sessions" className="space-y-6 mt-6">
          <Sessions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
