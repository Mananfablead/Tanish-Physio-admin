import React, { useState, useEffect } from "react";
import { Search, MoreHorizontal, Video, Calendar, Clock, User, UserCog, X, RefreshCw, ChevronLeft, ChevronRight, Play, Eye, Copy, Plus, AlertTriangle, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { fetchSessions, createSession, updateSession, deleteSession, rescheduleSession, deleteSessionById, updateSessionStatus, fetchAllUpcomingSessions, acceptSession, rejectSession } from "@/features/sessions/sessionSlice";
import { fetchBookings } from "@/features/bookings/bookingSlice";
import {
  getAllAvailability,
} from '@/features/availability/availabilitySlice';
import { toast } from "@/hooks/use-toast";
type SessionStatus = "pending" | "scheduled" | "live" | "completed" | "cancelled";

export default function Sessions() {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const { list: bookings, loading: bookingsLoading, error: bookingsError } = useSelector((state: any) => state.bookings);
  const { availability, loading: isLoading, error: availabilityError } = useSelector((state: any) => state.availability);
  // console.log("object", availability)

  const { list: allSessions = [], loading, error } = useSelector((state: any) => state.sessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  // Count sessions by status for tabs
  const scheduledCount = (allSessions || []).filter((session: any) => session.status === "scheduled").length;
  const allCount = (allSessions || []).length;
  const liveCount = (allSessions || []).filter((session: any) => session.status === "live").length;
  const completedCount = (allSessions || []).filter((session: any) => session.status === "completed").length;
  const cancelledCount = (allSessions || []).filter((session: any) => session.status === "cancelled").length;
  const pendingCount = (allSessions || []).filter((session: any) => session.status === "pending").length;
  // Note: "missed" and "no-show" statuses are automatically set by the backend
  // They should not be manually set by admins

  // Filter sessions based on active tab and search query
  const filteredSessions = allSessions.filter((session: any) => {
    // First filter by tab status
    let includeInTab = false;
    switch (activeTab) {

      case "all":
        includeInTab = true; // Show all sessions regardless of status
        break;
      case "pending":
        includeInTab = session.status === "pending";
        break;
      case "scheduled":
        includeInTab = session.status === "scheduled";
        break;
      case "live":
        includeInTab = session.status === "live";
        break;
      case "completed":
        includeInTab = session.status === "completed";
        break;
      case "cancelled":
        includeInTab = session.status === "cancelled";
        break;
      // Note: "missed" case removed - automatically set by backend
      default:
        includeInTab = true;
    }

    if (!includeInTab) return false;

    // Then filter by search query
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    // Check booking info
    const booking = session.bookingId;
    if (booking?.serviceName?.toLowerCase().includes(query)) return true;
    if (booking?._id?.toLowerCase().includes(query)) return true;

    // Check user info
    const user = session.userId;
    if (user?.name?.toLowerCase().includes(query)) return true;
    if (user?.email?.toLowerCase().includes(query)) return true;

    // Check therapist info
    const therapist = session.therapistId;
    if (therapist?.name?.toLowerCase().includes(query)) return true;
    if (therapist?.email?.toLowerCase().includes(query)) return true;

    // Check date, time, and status
    if (session.date?.toLowerCase().includes(query)) return true;
    if (session.time?.toLowerCase().includes(query)) return true;
    if (session.status?.toLowerCase().includes(query)) return true;

    return false;
  });


  useEffect(() => {
    dispatch(fetchSessions());
    dispatch(fetchBookings());
    dispatch(getAllAvailability());
  }, [dispatch]);

  // State for creating a new session
  const [newSession, setNewSession] = useState({
    bookingId: "",
    date: "",
    time: "",
    type: "1-on-1",
    status: "pending",
    notes: ""
  });

  // State for rescheduling
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Missing state variables
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);

  // Calendar state variables
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const selectedDay = availability?.find(
    (item) => item.date === rescheduleDate
  );

  const timeSlots = selectedDay?.timeSlots || [];

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  // Get today's date for highlighting
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Function to check if a date is in the past
  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Memoize the calendar weeks to avoid regenerating on every render
  const calendarWeeks = React.useMemo(() => {
    // Generate days for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Create an array of days with their availability status
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Find availability for this date
      const availabilityForDate = availability.find(item => item.date === dateStr);

      // Determine status based on time slots
      let status = 0; // default to available
      if (availabilityForDate && availabilityForDate.timeSlots) {
        const slots = availabilityForDate.timeSlots;
        const bookedSlots = slots.filter(slot => slot.status === 'booked');
        const unavailableSlots = slots.filter(slot => slot.status === 'unavailable');
        const availableSlots = slots.filter(slot => slot.status === 'available');

        if (bookedSlots.length > 0) {
          status = 1; // booked (if any slots are booked)
        } else if (unavailableSlots.length > 0 && availableSlots.length === 0) {
          status = 2; // holiday/unavailable (all slots unavailable)
        } else if (availableSlots.length > 0) {
          status = 0; // available (has available slots)
        }
      }

      return {
        date: dateStr,
        day,
        status, // 0 = available (green), 1 = booked (blue), 2 = holiday (red)
        availability: availabilityForDate
      };
    });

    // Create weeks for the calendar
    const weeks = [];
    let week = Array(7).fill(null);

    // Fill in the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      week[i] = null;
    }

    // Fill in the days
    for (let day = 0; day < calendarDays.length; day++) {
      const dayOfWeek = (firstDayOfMonth + day) % 7;
      week[dayOfWeek] = calendarDays[day];

      if (dayOfWeek === 6 || day === calendarDays.length - 1) {
        weeks.push([...week]);
        week = Array(7).fill(null);
      }
    }

    return weeks;
  }, [currentMonth, currentYear, availability]);

  const handleDateClick = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      // Find existing availability for this date
      const existingAvailability = availability.find(item => item.date === date);

      if (existingAvailability) {
        // Load existing availability data from time slots
        const allSlots = existingAvailability.timeSlots || [];

        if (allSlots.length > 0) {
          // Use first slot start time and last slot end time as defaults
          setRescheduleDate(date);
          setRescheduleTime(allSlots[0].start);
        } else {
          setRescheduleDate(date);
        }
      } else {
        setRescheduleDate(date);
      }
    }

    // If we're in reschedule mode, we should set the date and potentially auto-open time selection
    if (isRescheduleModalOpen && date) {
      setRescheduleDate(date);
    }
  };

  const handleTimeSlotClick = (date: string, timeSlot: any) => {
    if (timeSlot.status === 'available') {
      setSelectedDate(date);
      setRescheduleDate(date);
      setRescheduleTime(timeSlot.start);

      // If the reschedule modal is open, update the time selection there too
      if (isRescheduleModalOpen) {
        setRescheduleDate(date);
        setRescheduleTime(timeSlot.start);
      }
    }
  };



  const handleCreateSession = async () => {
    try {
      // Prepare the session data for API submission
      const sessionData = {
        ...newSession,
        // Ensure bookingId is a string if it exists
        bookingId: newSession.bookingId || undefined,
      };

      await dispatch(createSession(sessionData));
      setIsCreateSessionModalOpen(false);
      setNewSession({
        bookingId: "",
        date: "",
        time: "",
        type: "1-on-1",
        status: "pending",
        notes: "" as string,
      });
      // Refresh sessions list
      dispatch(fetchSessions());
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    try {
      await dispatch(rejectSession(sessionId));
      dispatch(fetchSessions());
    } catch (error) {
      console.error("Failed to reject session:", error);
      toast({
        title: "Error",
        description: "Failed to reject session",
        variant: "destructive",
      });
    }
  };

  const handleAcceptSession = async (sessionId: string) => {
    try {
      await dispatch(acceptSession(sessionId));
      dispatch(fetchSessions());
    } catch (error) {
      console.error("Failed to accept session:", error);
      toast({
        title: "Error",
        description: "Failed to accept session",
        variant: "destructive",
      });
    }
  };

  // Helper function to extract error message
  const getErrorMessage = (error: any): string => {
    if (typeof error?.payload === 'object' && error?.payload !== null) {
      // Check for the specific success/message structure from our API
      if (error.payload.success === false && error.payload.message) {
        return error.payload.message;
      }
      // Fallback to other possible locations in payload
      if (typeof error.payload === 'string') {
        return error.payload;
      }
      return
      error?.payload?.message ||
        error?.payload?.error ||
        error?.payload?.data?.message ||
        error?.payload?.data?.error ||
        "Something went wrong";
    }

    // Fallback to other possible locations
    return
    error?.error ||
      error?.message ||
      error?.data?.message ||
      error?.data?.error ||
      "Something went wrong";
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: string) => {
    try {
      await dispatch(
        updateSessionStatus({
          id: sessionId,
          status: status,
          notes: `Status updated to ${status}`,
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Session status updated successfully",
        variant: "default",
      });
      dispatch(fetchSessions());
    } catch (error: any) {


      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });

      // Still fetch sessions to ensure UI is up to date
      dispatch(fetchSessions());
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await dispatch(
        updateSessionStatus({
          id: sessionId,
          status: "cancelled",
          notes: "Session cancelled by admin",
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Session cancelled successfully",
        variant: "default",
      });
      dispatch(fetchSessions());
    } catch (error: any) {

      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });

      // Still fetch sessions to ensure UI is up to date
      dispatch(fetchSessions());
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await dispatch(deleteSessionById(sessionId)).unwrap();

      toast({
        title: "Success",
        description: "Session deleted successfully",
        variant: "default",
      });
      dispatch(fetchSessions());
    } catch (error: any) {
      // Extract error message from different possible sources
      let errorMessage = "Failed to delete session";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.payload) {
        errorMessage = error.payload;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Still fetch sessions to ensure UI is up to date
      dispatch(fetchSessions());
    }
  };

  const statusStyles: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 border border-yellow-300",
    scheduled:
      "bg-blue-100 text-blue-800 border border-blue-300",
    live:
      "bg-green-100 text-green-800 border border-green-300",
    completed:
      "bg-green-100 text-green-800 border border-green-300",
    cancelled:
      "bg-red-100 text-red-800 border border-red-300",
  };

  const isEditableStatus = (status: string) =>
    status === "scheduled" || status === "live";



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">{activeTab === 'live' ? 'Live Sessions' : activeTab === 'pending' ? 'Pending Sessions' : activeTab === 'all' ? 'All Sessions' : 'Session Management'}</h1>
          <p className="page-subtitle">
            {activeTab === 'live'
              ? 'View and join live sessions'
              : activeTab === 'pending'
                ? 'Review and approve pending session requests'
                : activeTab === 'all'
                  ? 'Monitor and manage all platform sessions'
                  : 'Monitor and manage all platform sessions'}
          </p>
        </div>
        <div className="flex items-center gap-3">

          {activeTab !== 'live' && activeTab !== 'upcoming' && (
            <Select defaultValue="today">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <UserCog className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {pendingCount}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {scheduledCount}
              </p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Play className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {liveCount}
              </p>
              <p className="text-sm text-muted-foreground">Live Now</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {completedCount}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <X className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {cancelledCount}
              </p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>

          <TabsTrigger value="all">
            All
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {allCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
              {pendingCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-info/20 text-info rounded-full">
              {scheduledCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="live" className="relative">
            Live
            {liveCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-success/20 text-success rounded-full animate-pulse">
                {liveCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          {/* Missed status is automatically set by backend */}
        </TabsList>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'live'
                ? 'Search by user, therapist, date, time, or type...'
                : activeTab === 'pending'
                  ? 'Search by booking, user, therapist, date, or status...'
                  : 'Search by booking, user, therapist, date, or status...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sessions Content */}
        <TabsContent value={activeTab} className="mt-4">
          {activeTab === 'live' ? (
            /* Live Sessions Grid View */
            <div className="space-y-6">
              {filteredSessions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredSessions.map((session: any) => {
                    const user = session.userId;
                    const therapist = session.therapistId;
                    return (
                      <div
                        key={session._id}
                        className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                {user?.name || "N/A"}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  LIVE NOW
                                </span>
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {therapist?.name || "N/A"}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                              {session.type}
                            </span>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{session.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{session.time}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              className="flex-1"
                              onClick={() =>
                                navigate(`/video-call/${session._id}`)
                              }
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Live Session
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/video-call/${session._id}`
                                );
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border rounded-lg p-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Live Sessions</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No live sessions match your search criteria."
                      : "There are no live sessions currently running."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Regular Table View for other tabs including 'all' */
            filteredSessions.length > 0 ? (
              <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking Info</th>
                        <th>User</th>

                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>

                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map((session: any) => {
                        const booking = session.bookingId;
                        const user = session.userId;
                        // console.log("booking", session)
                        return (
                          <tr
                            key={session._id}
                            className="hover:bg-muted/40 transition"
                          >
                            {/* SERVICE / BOOKING */}
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <p className="font-medium">
                                  {booking?.serviceName || "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Booking ID: {booking?._id?.slice(0, 8) || "N/A"}
                                </p>
                              </div>
                            </td>

                            {/* USER */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {user?.name || "N/A"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {user?.email || ""}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* DATE & TIME */}
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{session.date}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{session.time}</span>
                                </div>
                              </div>
                            </td>

                            {/* TYPE */}
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted">
                                {session.type}
                              </span>
                            </td>

                            {/* STATUS */}
                            <td className="px-4 py-3">
                              {isEditableStatus(session.status) ? (
                                <Select
                                  value={session.status}
                                  onValueChange={async (value) => {
                                    await handleUpdateSessionStatus(session._id, value);
                                  }}
                                >
                                  <SelectTrigger
                                    className={`w-[130px] rounded-full text-xs font-semibold ${statusStyles[session.status]
                                      }`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>

                                  <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[session.status]
                                    }`}
                                >
                                  {session.status === "pending" ? (
                                    <>
                                      <UserCog className="w-3 h-3 mr-1" />
                                      Pending Review
                                    </>
                                  ) : (
                                    <>
                                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                    </>
                                  )}
                                </span>
                              )}
                            </td>


                            {/* ACTIONS */}
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48">
                                  {/* PENDING SESSIONS */}
                                  {session.status === "pending" && (
                                    <>
                                      <DropdownMenuItem
                                        className="text-success"
                                        onClick={async () => {
                                          await handleAcceptSession(session._id);
                                        }}
                                      >
                                        <UserCog className="h-4 w-4 mr-2" />
                                        Accept Session
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={async () => {
                                          await handleRejectSession(session._id);
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject Session
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {/* SCHEDULED/CANCELLED SESSIONS (non-pending) */}
                                  {(activeTab === "scheduled" ||
                                    activeTab === "all") &&
                                    session.status !== "pending" && (
                                      <>
                                        {/* <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedSession(session);
                                            setIsRescheduleModalOpen(true);
                                          }}
                                        >
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Reschedule
                                        </DropdownMenuItem> */}

                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => handleCancelSession(session._id)}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Cancel Session
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => handleDeleteSession(session._id)}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Delete Session
                                        </DropdownMenuItem>
                                      </>
                                    )}

                                  {/* LIVE */}
                                  {activeTab === "live" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/video-call/${session._id}`)
                                      }
                                    >
                                      <Video className="h-4 w-4 mr-2" />
                                      Join Session
                                    </DropdownMenuItem>
                                  )}

                                  {/* COMPLETED */}
                                  {activeTab === "completed" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `/session-recordings/${session._id}`
                                        )
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Recording
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">{filteredSessions.length}</span>{" "}
                    sessions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="min-w-[32px]">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Sessions Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No sessions match your search criteria."
                    : `No ${activeTab} sessions found in the system.`}
                </p>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Session Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="p-3 rounded-lg bg-muted/50 mt-4">
              <p className="text-sm">
                <span className="text-muted-foreground">Booking:</span>{" "}
                <span className="font-medium">
                  {selectedSession.bookingId?.serviceName || "N/A"}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">User:</span>{" "}
                <span className="font-medium">{selectedSession.userId?.name || "N/A"}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Date & Time:</span>{" "}
                <span className="font-medium">
                  {selectedSession.date} at {selectedSession.time}
                </span>
              </p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await dispatch(deleteSessionById(selectedSession._id));
                  setIsCancelModalOpen(false);
                  dispatch(fetchSessions());
                } catch (error) {
                  console.error("Failed to delete session:", error);
                }
              }}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
      >
        <DialogContent
          className="
      w-full max-w-4xl
      max-h-[95vh]
      flex flex-col
      overflow-hidden
    "
        >
          {/* ================= HEADER ================= */}
          <DialogHeader className="px-4 sm:px-6 pt-4">
            <DialogTitle className="text-lg sm:text-xl">
              Reschedule Session
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select a new date and time for this session.
            </DialogDescription>
          </DialogHeader>

          {/* ================= BODY (SCROLLABLE) ================= */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {selectedSession && (
              <>
                {/* CURRENT SESSION INFO */}
                <div className="p-3 rounded-lg bg-muted/50">

                  <p className="text-sm">
                    <span className="text-muted-foreground">Current:</span>{" "}
                    <span className="font-medium">
                      {selectedSession.date} at {selectedSession.time}
                    </span>
                  </p>
                </div>

                {/* DATE + TIME INPUT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* <div>
              <label className="text-sm font-medium">New Date</label>
              <Input
                type="date"
                className="mt-1"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">New Time</label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length > 0 ? (
                    timeSlots.map((slot) => (
                      <SelectItem
                        key={slot._id}
                        value={slot.start}
                        disabled={slot.status === "booked"}
                      >
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                        {slot.status === "booked" && " (Booked)"}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No slots available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div> */}
                </div>

                {/* CALENDAR + TIME SLOTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ================= CALENDAR ================= */}
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-sm">Select Date</h4>
                      <div className="flex gap-1">
                        <button
                          className="h-7 w-7 rounded-md border bg-background flex items-center justify-center"
                          onClick={() => {
                            if (currentMonth === 0) {
                              setCurrentMonth(11);
                              setCurrentYear(currentYear - 1);
                            } else {
                              setCurrentMonth(currentMonth - 1);
                            }
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="text-sm font-medium px-2">
                          {new Date(currentYear, currentMonth).toLocaleString(
                            "default",
                            { month: "short", year: "numeric" }
                          )}
                        </span>

                        <button
                          className="h-7 w-7 rounded-md border bg-background flex items-center justify-center"
                          onClick={() => {
                            if (currentMonth === 11) {
                              setCurrentMonth(0);
                              setCurrentYear(currentYear + 1);
                            } else {
                              setCurrentMonth(currentMonth + 1);
                            }
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                        <div key={d} className="text-center">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarWeeks.flat().map((day, i) => {
                        if (!day) return <div key={i} />;

                        const isPast =
                          new Date(day.date) <
                          new Date(new Date().setHours(0, 0, 0, 0));

                        const dayAvailability = availability.find(
                          (a) => a.date === day.date
                        );

                        const hasAvailable =
                          dayAvailability?.timeSlots

                        const statusColor = isPast
                          ? "bg-muted text-muted-foreground"
                          : hasAvailable
                            ? "bg-green-100 text-green-700"
                            : "";

                        return (
                          <button
                            key={i}
                            disabled={isPast}
                            onClick={() => {
                              setRescheduleDate(day.date);

                              if (hasAvailable) {
                                const firstSlot =
                                  dayAvailability.timeSlots.find(
                                    (s) => s.status === "available"
                                  );
                                if (firstSlot) {
                                  handleTimeSlotClick(day.date, firstSlot);
                                }
                              }
                            }}
                            className={`
                        h-8 w-8 rounded-full text-xs flex items-center justify-center
                        ${statusColor}
                        ${rescheduleDate === day.date
                                ? "ring-2 ring-primary bg-primary text-white"
                                : ""
                              }
                        ${isPast ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                          >
                            {day.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================= TIME SLOTS ================= */}
                  <div className="border rounded-lg bg-muted/20">
                    <h4 className="font-medium text-sm px-3 pt-3 mb-2">
                      Available Time Slots
                    </h4>

                    <div className="max-h-48 md:max-h-64 overflow-y-auto px-3 pb-3 space-y-2">
                      {rescheduleDate ? (
                        availability
                          .find((a) => a.date === rescheduleDate)
                          ?.timeSlots?.map((slot, i) => (
                            <button
                              key={i}
                              disabled={slot.status !== "available"}
                              onClick={() =>
                                slot.status === "available" &&
                                handleTimeSlotClick(rescheduleDate, slot)
                              }
                              className={`
                          w-full text-left p-2 border rounded-lg text-sm
                          ${slot.status === "available"
                                  ? "hover:bg-green-50 border-green-200"
                                  : "opacity-50 border-gray-200"
                                }
                          ${rescheduleTime === slot.start
                                  ? "ring-2 ring-primary bg-primary/10"
                                  : ""
                                }
                        `}
                            >
                              {formatTime(slot.start)} -{" "}
                              {formatTime(slot.end)}
                            </button>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select a date to see slots
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ================= FOOTER (FIXED) ================= */}
          <DialogFooter className="px-4 sm:px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsRescheduleModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              disabled={!rescheduleDate || !rescheduleTime}
              onClick={async () => {
                await dispatch(
                  rescheduleSession({
                    id: selectedSession._id,
                    sessionData: {
                      date: rescheduleDate,
                      time: rescheduleTime,
                      status: "scheduled",
                    },
                  })
                );
                setIsRescheduleModalOpen(false);
                setRescheduleDate("");
                setRescheduleTime("");
                dispatch(fetchSessions());
              }}
            >
              Reschedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Modal */}
      <Dialog
        open={isCreateSessionModalOpen}
        onOpenChange={setIsCreateSessionModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Schedule a new session for a user with a therapist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Booking</label>

                <select
                  className="w-full p-2 border rounded-md"
                  value={newSession.bookingId || ""}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      bookingId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Booking</option>

                  {bookings && Array.isArray(bookings)
                    ? bookings.map((booking) => (
                      <option
                        key={booking?._id || booking?.id}
                        value={booking?._id || booking?.id}
                      >
                        {booking?.serviceName ||
                          booking?.name ||
                          "Unnamed Booking"}
                      </option>
                    ))
                    : null}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select
                  value={newSession.type}
                  onValueChange={(value) =>
                    setNewSession({ ...newSession, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-on-1">1-on-1</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newSession.status}
                  onValueChange={(value) =>
                    setNewSession({ ...newSession, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newSession.date}
                  onChange={(e) =>
                    setNewSession({ ...newSession, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession({ ...newSession, time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional notes about the session..."
                value={newSession.notes}
                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                rows={3}
              />
            </div> */}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateSessionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}