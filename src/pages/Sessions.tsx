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
import GenerateGoogleMeetModal from "@/components/VideoCall/GenerateGoogleMeetModal";
import EditGoogleMeetModal from "@/components/VideoCall/EditGoogleMeetModal";
import { subscriptionAPI, groupSessionAPI } from "@/api/apiClient";
import { tokenUtils } from "@/api/authAPI";
type SessionStatus =
  | "pending"
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled";

export default function Sessions() {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time in real-time
  const {
    list: bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useSelector((state: any) => state.bookings);
  const {
    availability,
    loading: isLoading,
    error: availabilityError,
  } = useSelector((state: any) => state.availability);
  // console.log("object", availability)

  const {
    list: allSessions = [],
    upcomingSessions = [],
    loading,
    error,
  } = useSelector((state: any) => state.sessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Update current time every second for real-time button updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
useEffect(() => {
  if (!allSessions || allSessions.length === 0) return;

  allSessions.forEach((session) => {
    if (session.status === "live" && session.endTime) {
      const end = new Date(session.endTime);
      const now = new Date();

      if (now >= end) {
        handleUpdateSessionStatus(session._id, "completed");
      }
    }
  });
}, [currentTime, allSessions]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Set to 10 items per page as requested
  // Count sessions by status for tabs
  const scheduledCount = (allSessions || []).filter(
    (session: any) => session.status === "scheduled"
  ).length;
  const allCount = (allSessions || []).length;
  const liveCount = (allSessions || []).filter(
    (session: any) => session.status === "live"
  ).length;
  const completedCount = (allSessions || []).filter(
    (session: any) => session.status === "completed"
  ).length;
  const cancelledCount = (allSessions || []).filter(
    (session: any) => session.status === "cancelled"
  ).length;
  const pendingCount = (allSessions || []).filter(
    (session: any) => session.status === "pending"
  ).length;
  const upcomingCount = (upcomingSessions || []).length;
  // Note: "missed" and "no-show" statuses are automatically set by the backend
  // They should not be manually set by admins

  // Filter sessions based on active tab, status filter, and search query
  const filteredSessions = (() => {
    let sessionsToFilter = [];

    switch (activeTab) {
      case "upcoming":
        sessionsToFilter = upcomingSessions;
        break;
      default:
        sessionsToFilter = allSessions;
        break;
    }

    return sessionsToFilter.filter((session: any) => {
      // First filter by tab status (only for non-upcoming tabs)
      if (activeTab !== "upcoming") {
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
      }

      // Apply status filter from stat cards
      if (statusFilter && session.status !== statusFilter) {
        return false;
      }

      // Then filter by search query
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();

      // Check booking info
      const booking = session.bookingId;
      if (booking?.serviceName?.toLowerCase().includes(query)) return true;
      if (booking?._id?.toLowerCase().includes(query)) return true;

      // Check subscription info
      const subscription = session.subscriptionId;
      if (subscription?.planName?.toLowerCase().includes(query)) return true;
      if (subscription?._id?.toLowerCase().includes(query)) return true;
      if (subscription?.status?.toLowerCase().includes(query)) return true;

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
  })();

  useEffect(() => {
    if (activeTab === "upcoming") {
      dispatch(fetchAllUpcomingSessions());
    } else {
      dispatch(fetchSessions());
    }
    dispatch(fetchBookings());
    dispatch(getAllAvailability());
  }, [dispatch, activeTab]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  // Function to change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Function to go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Group sessions by groupSessionId to show single join button per group
  const getGroupedSessions = (sessions: any[]) => {
    const groups = new Map<string, any[]>();
    const nonGroupSessions: any[] = [];

    sessions.forEach((session) => {
      if (session.groupSessionId && session.sessionType === 'group') {
        const key = `${session.groupSessionId}_${session.date}_${session.time}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(session);
      } else {
        nonGroupSessions.push(session);
      }
    });

    return { groups, nonGroupSessions };
  };

  // State for creating a new session
  const [newSession, setNewSession] = useState({
    bookingId: "",
    subscriptionId: "",
    userId: "",
    therapistId: "",
    date: "",
    time: "",
    type: "1-on-1",
    status: "pending",
    notes: "",
  });

  // Function to check if a time slot is in the past
  const isTimeSlotPast = (date: any, time: any): boolean => {
    if (!date || !time) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    return slotDateTime < now;
  };

  // State for Google Meet generation
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const [selectedSessionForMeet, setSelectedSessionForMeet] = useState(null);
  const [isGoogleMeetModalOpen, setIsGoogleMeetModalOpen] = useState(false);

  // State for editing Google Meet link
  const [isEditingMeet, setIsEditingMeet] = useState(false);
  const [selectedSessionForEditMeet, setSelectedSessionForEditMeet] =
    useState(null);
  const [isEditGoogleMeetModalOpen, setIsEditGoogleMeetModalOpen] =
    useState(false);

  // State for group video calls
  const [groupSessions, setGroupSessions] = useState<any[]>([]);
  const [loadingGroupSessions, setLoadingGroupSessions] = useState(false);
  const [joiningGroupSessionId, setJoiningGroupSessionId] = useState<string | null>(null);

  // State for users and subscriptions
  const [usersWithActiveSubscriptions, setUsersWithActiveSubscriptions] =
    useState([]);
  const [selectedUserSubscriptions, setSelectedUserSubscriptions] = useState(
    []
  );
  const [selectedUser, setSelectedUser] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // Setup admin notification socket
  useEffect(() => {
    const setupAdminNotifications = async () => {
      try {
        // Import socket connection (assuming similar setup as client)
        const { io } = await import("socket.io-client");
        const token = tokenUtils.getAdminToken(); // Get admin token properly

        if (token) {
          const socket = io("http://localhost:5000", {
            // Adjust URL as needed
            auth: { token },
            transports: ["websocket", "polling"],
          });

          socket.on("connect", () => {
            console.log("Admin connected to notification socket");
            socket.emit("join-admin-notifications", {});
          });

          socket.on("admin-notifications-joined", (data) => {
            console.log("Joined admin notifications:", data);
          });

          socket.on("admin-notification", (data) => {
            console.log("Admin received notification:", data);

            // Show toast notification for connection failures
            if (data.type === "connection_failure") {
              toast({
                title: data.title || "Connection Issue Reported",
                description:
                  data.message || "A user is experiencing connection problems",
                variant: "destructive",
              });

              // Optionally auto-refresh sessions to show updated status
              dispatch(fetchSessions());
            }
          });

          socket.on("disconnect", () => {
            console.log("Admin disconnected from notification socket");
          });

          // Store socket reference for cleanup
          (window as any).adminNotificationSocket = socket;
        }
      } catch (error) {
        console.error("Error setting up admin notifications:", error);
      }
    };

    setupAdminNotifications();

    // Cleanup function
    return () => {
      if ((window as any).adminNotificationSocket) {
        (window as any).adminNotificationSocket.disconnect();
        delete (window as any).adminNotificationSocket;
      }
    };
  }, []);

  const fetchUsersWithActiveSubscriptions = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/users?subscription=active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success) {
        // Filter for users with active subscriptions by checking their subscription data
        const usersWithActiveSubs = data.data.users.filter(
          (user) =>
            user.subscriptionInfo &&
            user.subscriptionInfo.status === "active" &&
            !user.subscriptionInfo.isExpired
        );
        setUsersWithActiveSubscriptions(usersWithActiveSubs);
      } else {
        console.error(
          "Failed to fetch users with active subscriptions:",
          data.message
        );
        // As fallback, get all users and their subscription info separately
        const allUsersResponse = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            "Content-Type": "application/json",
          },
        });
        const allUsersData = await allUsersResponse.json();

        if (allUsersData.success) {
          // Filter for users with active subscriptions by checking their subscription data
          const usersWithActiveSubs = allUsersData.data.users.filter(
            (user) =>
              user.subscriptionInfo &&
              user.subscriptionInfo.status === "active" &&
              !user.subscriptionInfo.isExpired
          );
          setUsersWithActiveSubscriptions(usersWithActiveSubs);
        } else {
          setUsersWithActiveSubscriptions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching users with active subscriptions:", error);
      setUsersWithActiveSubscriptions([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserSubscriptions = async (userId) => {
    try {
      setLoadingSubscriptions(true);
      // Use the admin endpoint to get all subscriptions for a specific user
      const response = await subscriptionAPI.getAllSubscriptions();
      const data = response.data;

      if (data.success) {
        // Filter for active subscriptions for the specific user
        const userSubs = (data.data.subscriptions || []).filter(
          (sub) =>
            sub.userId &&
            sub.userId._id === userId &&
            sub.status === "active" &&
            !sub.isExpired
        );
        setSelectedUserSubscriptions(userSubs);
      } else {
        console.error("Failed to fetch user subscriptions:", data.message);
        setSelectedUserSubscriptions([]);
      }
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      setSelectedUserSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // State for rescheduling
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Missing state variables
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);

  // State for rebooking missed sessions
  const [isRebookModalOpen, setIsRebookModalOpen] = useState(false);
  const [rebookDate, setRebookDate] = useState("");
  const [rebookTime, setRebookTime] = useState("");

  // Fetch users with active subscriptions when modal opens
  useEffect(() => {
    if (isCreateSessionModalOpen) {
      fetchUsersWithActiveSubscriptions();

      // Set default therapist to admin when modal opens
      const adminTherapist = availability.find(
        (item) => item.therapistId && item.therapistId.role === "admin"
      );

      if (adminTherapist) {
        setNewSession((prev) => ({
          ...prev,
          therapistId: adminTherapist.therapistId._id,
        }));
      }
    }
  }, [isCreateSessionModalOpen, availability]);

  // Calendar state variables
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
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
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Function to check if a date is in the past
  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Memoize the calendar weeks to avoid regenerating on every render
  const calendarWeeks = React.useMemo(() => {
    // Generate days for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Create an array of days with their availability status
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      // Find availability for this date
      const availabilityForDate = availability.find(
        (item) => item.date === dateStr
      );

      // Determine status based on time slots
      let status = 0; // default to available
      if (availabilityForDate && availabilityForDate.timeSlots) {
        const slots = availabilityForDate.timeSlots;
        const bookedSlots = slots.filter((slot) => slot.status === "booked");
        const unavailableSlots = slots.filter(
          (slot) => slot.status === "unavailable"
        );
        const availableSlots = slots.filter(
          (slot) => slot.status === "available"
        );

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
        availability: availabilityForDate,
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
      const existingAvailability = availability.find(
        (item) => item.date === date
      );

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
    if (timeSlot.status === "available") {
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
      // Validate required fields for subscription sessions
      if (
        !newSession.userId ||
        !newSession.subscriptionId ||
        !newSession.therapistId ||
        !newSession.date ||
        !newSession.time
      ) {
        toast({
          title: "Error",
          description:
            "Please fill all required fields: user, subscription, therapist, date, and time",
          variant: "destructive",
        });
        return;
      }

      // Validate date is not in the past
      const selectedDate = new Date(newSession.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        toast({
          title: "Error",
          description: "Cannot select a date in the past",
          variant: "destructive",
        });
        return;
      }

      // Prepare the session data for API submission
      const sessionData = {
        subscriptionId: newSession.subscriptionId,
        userId: newSession.userId,
        therapistId: newSession.therapistId,
        date: newSession.date,
        time: newSession.time,
        type: newSession.type,
        status: newSession.status,
        notes: newSession.notes || "",
      };

      // Use the createSession action which should call the admin endpoint
      await dispatch(createSession(sessionData));
      setIsCreateSessionModalOpen(false);

      // Reset form with admin as default therapist
      const adminTherapist = availability.find(
        (item) => item.therapistId && item.therapistId.role === "admin"
      );

      setNewSession({
        bookingId: "",
        subscriptionId: "",
        userId: "",
        therapistId: adminTherapist ? adminTherapist.therapistId._id : "",
        date: "",
        time: "",
        type: "1-on-1",
        status: "pending",
        notes: "" as string,
      });
      // Refresh sessions list
      dispatch(fetchSessions());

      toast({
        title: "Success",
        description: "Session created successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to create session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session",
        variant: "destructive",
      });
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
    if (typeof error?.payload === "object" && error?.payload !== null) {
      // Check for the specific success/message structure from our API
      if (error.payload.success === false && error.payload.message) {
        return error.payload.message;
      }
      // Fallback to other possible locations in payload
      if (typeof error.payload === "string") {
        return error.payload;
      }
      return (
        error?.payload?.message ||
        error?.payload?.error ||
        error?.payload?.data?.message ||
        error?.payload?.data?.error ||
        "Something went wrong"
      );
    }

    // Fallback to other possible locations
    return (
      error?.error ||
      error?.message ||
      error?.data?.message ||
      error?.data?.error ||
      "Something went wrong"
    );
  };

  const handleUpdateSessionStatus = async (
    sessionId: string,
    status: string
  ) => {
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

  // Handle group video call join
  const handleJoinGroupCall = async (groupSessionId: string) => {
    try {
      // Navigate to the group video call page with the groupSessionId
      navigate(`/group-video-call/${groupSessionId}`);
    } catch (error: any) {
      console.error("Failed to join group call:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join group call",
        variant: "destructive",
      });
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

  // Handle rebooking missed session
  const handleRebookMissedSession = async () => {
    try {
      if (!selectedSession || !rebookDate || !rebookTime) {
        toast({
          title: "Error",
          description: "Please select date and time for rebooking",
          variant: "destructive",
        });
        return;
      }

      // Create new session using the admin session creation API
      await dispatch(
        createSession({
          bookingId:
            selectedSession.bookingId?._id || selectedSession.bookingId,
          userId: selectedSession.userId?._id || selectedSession.userId,
          therapistId:
            selectedSession.therapistId?._id || selectedSession.therapistId,
          date: rebookDate,
          time: rebookTime,
          type: selectedSession.type || "1-on-1",
          status: "scheduled",
          duration: selectedSession.duration || 30,
        })
      ).unwrap();

      toast({
        title: "Success",
        description:
          "Session rebooked successfully! The client will be notified.",
        variant: "default",
      });

      setIsRebookModalOpen(false);
      setRebookDate("");
      setRebookTime("");
      dispatch(fetchSessions());
    } catch (error: any) {
      console.error("Rebook error:", error);

      let errorMessage = "Failed to rebook session";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    scheduled: "bg-blue-100 text-blue-800 border border-blue-300",
    live: "bg-green-100 text-green-800 border border-green-300",
    completed: "bg-green-100 text-green-800 border border-green-300",
    cancelled: "bg-red-100 text-red-800 border border-red-300",
  };

  const isEditableStatus = (status: string) =>
    status === "scheduled" || status === "live";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">
            {activeTab === "live"
              ? "Live Sessions"
              : activeTab === "pending"
              ? "Pending Sessions"
              : activeTab === "upcoming"
              ? "Upcoming Sessions"
              : activeTab === "all"
              ? "All Sessions"
              : "Session Management"}
          </h1>
          <p className="page-subtitle">
            {activeTab === "live"
              ? "View and join live sessions"
              : activeTab === "pending"
              ? "Review and approve pending session requests"
              : activeTab === "upcoming"
              ? "View sessions scheduled within 24 hours"
              : activeTab === "all"
              ? "Monitor and manage all platform sessions"
              : "Monitor and manage all platform sessions"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateSessionModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Session
          </Button>
          {activeTab !== "live" && activeTab !== "upcoming" && (
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
        <div 
          className="stat-card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter(statusFilter === "pending" ? null : "pending")}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statusFilter === "pending" ? "bg-warning text-white" : "bg-warning/10")}>
              <UserCog className={cn("w-5 h-5", statusFilter === "pending" ? "text-white" : "text-warning")} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div 
          className="stat-card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter(statusFilter === "scheduled" ? null : "scheduled")}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statusFilter === "scheduled" ? "bg-info text-white" : "bg-info/10")}>
              <Calendar className={cn("w-5 h-5", statusFilter === "scheduled" ? "text-white" : "text-info")} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{scheduledCount}</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </div>
        <div 
          className="stat-card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter(statusFilter === "live" ? null : "live")}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statusFilter === "live" ? "bg-success text-white" : "bg-success/10")}>
              <Play className={cn("w-5 h-5", statusFilter === "live" ? "text-white" : "text-success")} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{liveCount}</p>
              <p className="text-sm text-muted-foreground">Live Now</p>
            </div>
          </div>
        </div>
        <div 
          className="stat-card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter(statusFilter === "completed" ? null : "completed")}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statusFilter === "completed" ? "bg-primary text-white" : "bg-primary/10")}>
              <Video className={cn("w-5 h-5", statusFilter === "completed" ? "text-white" : "text-primary")} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div 
          className="stat-card cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter(statusFilter === "cancelled" ? null : "cancelled")}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statusFilter === "cancelled" ? "bg-warning text-white" : "bg-warning/10")}>
              <X className={cn("w-5 h-5", statusFilter === "cancelled" ? "text-white" : "text-warning")} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{cancelledCount}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mb-2">
          <TabsList className="inline-flex min-w-max">
            <TabsTrigger value="all" className="whitespace-nowrap">
              All
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {allCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="whitespace-nowrap">
              Upcoming
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-info/20 text-info rounded-full">
                {upcomingCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="whitespace-nowrap">
              Pending
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                {pendingCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="whitespace-nowrap">
              Scheduled
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-info/20 text-info rounded-full">
                {scheduledCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="live" className="whitespace-nowrap relative">
              Live
              {liveCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-success/20 text-success rounded-full animate-pulse">
                  {liveCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="whitespace-nowrap">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="whitespace-nowrap">
              Cancelled
            </TabsTrigger>
            {/* Missed status is automatically set by backend */}
          </TabsList>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "live"
                  ? "Search by user, therapist, date, time, or type..."
                  : activeTab === "pending"
                  ? "Search by booking, user, therapist, date, or status..."
                  : activeTab === "upcoming"
                  ? "Search by user, therapist, date, time, or type..."
                  : "Search by booking, user, therapist, date, or status..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {statusFilter && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter(null)}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </Button>
          )}
        </div>

        {/* Sessions Content */}
        <TabsContent value={activeTab} className="mt-4">
          {activeTab === "live" || activeTab === "upcoming" ? (
            /* Live Sessions Grid View */
            <div className="space-y-6">
              {filteredSessions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredSessions.map((session: any) => {
                    const user = session.userId;
                    const therapist = session.therapistId;
                    // Calculate timing status for upcoming sessions using currentTime state
                    const now = currentTime; // Use state time instead of new Date()
                    const sessionTime = new Date(
                      `${session.date}T${session.time}`
                    );
                    const timeDiff = sessionTime.getTime() - now.getTime();
                    const minutesUntilSession = Math.floor(
                      timeDiff / (1000 * 60)
                    );

                    let statusLabel = "";
                    let isJoinEnabled = false;

                    // Check if the actual session time has arrived
                    const isSessionTimeArrived = minutesUntilSession <= 0;

                    if (activeTab === "live") {
                      // For live sessions, check if the actual session time has arrived
                      if (isSessionTimeArrived) {
                        statusLabel = "LIVE NOW";
                        isJoinEnabled = true;
                      } else {
                        statusLabel = "SCHEDULED";
                        isJoinEnabled = false; // Disable join if it's marked live but too early
                      }
                    } else {
                      if (
                        minutesUntilSession <= 10 &&
                        minutesUntilSession > 0
                      ) {
                        statusLabel = "JOIN NOW";
                        isJoinEnabled = true; // Enable join if within 10 min window
                      } else if (
                        minutesUntilSession <= 60 &&
                        minutesUntilSession > 10
                      ) {
                        statusLabel = "JOIN SOON";
                        isJoinEnabled = false; // Don't enable join yet if only within 1 hour
                      } else {
                        statusLabel = "UPCOMING";
                        isJoinEnabled = false;
                      }

                      // Additionally, if the session time hasn't arrived yet, disable join regardless of timing status
                      if (!isSessionTimeArrived) {
                        isJoinEnabled = false;
                      }
                    }

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
                                  {statusLabel}
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
                            {/* Show Group Join Button for group sessions */}
                            {session.groupSessionId ? (
                              <Button
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                onClick={() => handleJoinGroupCall(session.groupSessionId)}
                                disabled={joiningGroupSessionId === session.groupSessionId || !isJoinEnabled}
                              >
                                {joiningGroupSessionId === session.groupSessionId ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Joining...
                                  </>
                                ) : (
                                  <>
                                    <Video className="w-4 h-4 mr-2" />
                                    {isJoinEnabled ? "Join Group Call" : "Session Early"}
                                  </>
                                )}
                              </Button>
                            ) : (
                              // Regular join button for non-group sessions
                              <Button
                                className="flex-1"
                                onClick={() =>
                                  navigate(`/video-call/${session._id}`)
                                }
                                disabled={!isJoinEnabled}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                {isJoinEnabled
                                  ? "Join Session"
                                  : minutesUntilSession > 0
                                  ? "Session Early"
                                  : "Session Not Started"}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/video-call/${session.groupSessionId ? `/group-video-call/${session.groupSessionId}` : `/video-call/${session._id}`}`
                                );
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {!session.googleMeetLink && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedSessionForMeet(session);
                                  setIsGoogleMeetModalOpen(true);
                                }}
                              >
                                <Video className="w-4 h-4" />
                              </Button>
                            )}
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
                  <h3 className="text-lg font-medium mb-2">
                    {activeTab === "live"
                      ? "No Live Sessions"
                      : "No Upcoming Sessions"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? `No ${
                          activeTab === "live" ? "live" : "upcoming"
                        } sessions match your search criteria.`
                      : `There are no ${
                          activeTab === "live" ? "live" : "upcoming"
                        } sessions.`}
                  </p>
                </div>
              )}
            </div>
          ) : /* Regular Table View for other tabs including 'all' */
          filteredSessions.length > 0 ? (
            <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking/Subscription Info</th>
                      <th>User</th>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      {activeTab === "live" && <th>Google Meet</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const { groups, nonGroupSessions } = getGroupedSessions(filteredSessions);
                      const rows: JSX.Element[] = [];

                      // Render non-group sessions normally
                      nonGroupSessions.forEach((session: any) => {
                        const booking = session.bookingId;
                        const user = session.userId;
                        rows.push(
                          <tr
                            key={session._id}
                            className="hover:bg-muted/40 transition"
                          >
                            {/* BOOKING/SUBSCRIPTION INFO */}
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                {session.bookingId ? (
                                  <div>
                                    <p className="font-medium">
                                      {booking?.serviceName || "N/A"}
                                    </p>
                                    <Badge variant="secondary" className="mt-1">
                                      Booking Session
                                    </Badge>
                                  </div>
                                ) : session.subscriptionId ? (
                                  <div>
                                    <p className="font-medium">
                                      {session.subscriptionId?.planName || "N/A"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="default"
                                        className="bg-blue-100 text-blue-800"
                                      >
                                        Subscription Session
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {session.subscriptionId?.status || "N/A"}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      No Booking/Subscription
                                    </p>
                                    <Badge variant="destructive" className="mt-1">
                                      Invalid Session
                                    </Badge>
                                  </div>
                                )}
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
                            <td className="">
                              <span className=" text-xs font-semibold">
                                {session.type}
                              </span>
                            </td>

                            {/* STATUS */}
                            <td className="px-4 py-3">
                              {isEditableStatus(session.status) ? (
                                <Select
                                  value={session.status}
                                  disabled={updatingStatusId === session._id}
                                  onValueChange={async (value) => {
                                    setUpdatingStatusId(session._id);
                                    try {
                                      await handleUpdateSessionStatus(
                                        session._id,
                                        value
                                      );
                                    } finally {
                                      setUpdatingStatusId(null);
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    className={`w-[130px] rounded-full text-xs font-semibold ${
                                      statusStyles[session.status]
                                    }`}
                                  >
                                    {updatingStatusId === session._id ? (
                                      <div className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Updating...</span>
                                      </div>
                                    ) : (
                                      <SelectValue />
                                    )}
                                  </SelectTrigger>

                                  <SelectContent>
                                    {session.status !== "live" && (
                                      <SelectItem value="scheduled">
                                        Scheduled
                                      </SelectItem>
                                    )}
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="completed">
                                      Completed
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    statusStyles[session.status]
                                  }`}
                                >
                                  {session.status === "pending" ? (
                                    <>
                                      <UserCog className="w-3 h-3 mr-1" />
                                      Pending Review
                                    </>
                                  ) : (
                                    <>
                                      {session.status &&
                                      typeof session.status === "string"
                                        ? session.status.charAt(0).toUpperCase() +
                                          session.status.slice(1)
                                        : "Unknown"}
                                    </>
                                  )}
                                </span>
                              )}
                            </td>

                            {/* ACTIONS - Simplified for non-group sessions */}
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {session.status === "pending" && (
                                    <>
                                      <DropdownMenuItem className="text-success" onClick={async () => { await handleAcceptSession(session._id); }}>
                                        <UserCog className="h-4 w-4 mr-2" /> Accept Session
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={async () => { await handleRejectSession(session._id); }}>
                                        <X className="h-4 w-4 mr-2" /> Reject Session
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {(activeTab === "scheduled" || activeTab === "all") && session.status !== "pending" && (
                                    <>
                                      {!session.googleMeetLink ? (
                                        <DropdownMenuItem className="text-blue-600" onClick={() => { setSelectedSessionForMeet(session); setIsGoogleMeetModalOpen(true); }}>
                                          <Video className="h-4 w-4 mr-2" /> Generate Google Meet/Zoom Link
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem className="text-blue-600" onClick={() => { setSelectedSessionForEditMeet(session); setIsEditGoogleMeetModalOpen(true); }}>
                                          <Video className="h-4 w-4 mr-2" /> Edit Google Meet/Zoom Link
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem className="text-destructive" onClick={() => handleCancelSession(session._id)}>
                                        <X className="h-4 w-4 mr-2" /> Cancel Session
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSession(session._id)}>
                                        <X className="h-4 w-4 mr-2" /> Delete Session
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {activeTab === "live" && (
                                    <DropdownMenuItem onClick={() => navigate(`/video-call/${session._id}`)}>
                                      <Video className="h-4 w-4 mr-2" /> Join Session
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      });

                      // Render group sessions with single join button per group
                      groups.forEach((groupSessions, groupKey) => {
                        const groupSessionId = groupSessions[0].groupSessionId;
                        
                        groupSessions.forEach((session: any, index: number) => {
                          const booking = session.bookingId;
                          const user = session.userId;
                          rows.push(
                            <tr
                              key={session._id}
                              className="hover:bg-muted/40 transition"
                            >
                              {/* BOOKING/SUBSCRIPTION INFO */}
                              <td className="px-4 py-3">
                                <div className="space-y-2">
                                  {session.bookingId ? (
                                    <div>
                                      <p className="font-medium">
                                        {booking?.serviceName || "N/A"}
                                      </p>
                                      <Badge
                                        variant="secondary"
                                        className="mt-1"
                                      >
                                        Booking Session
                                      </Badge>
                                      {index === 0 && (
                                        <Badge
                                          variant="default"
                                          className="ml-2 bg-purple-600"
                                        >
                                          Group
                                        </Badge>
                                      )}
                                    </div>
                                  ) : session.subscriptionId ? (
                                    <div>
                                      <p className="font-medium">
                                        {session.subscriptionId?.planName ||
                                          "N/A"}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="default"
                                          className="bg-blue-100 text-blue-800"
                                        >
                                          Subscription
                                        </Badge>
                                        {index === 0 && (
                                          <Badge
                                            variant="default"
                                            className="bg-purple-600"
                                          >
                                            Group
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="font-medium text-muted-foreground">
                                        No Booking/Subscription
                                      </p>
                                      <Badge
                                        variant="destructive"
                                        className="mt-1"
                                      >
                                        Invalid
                                      </Badge>
                                    </div>
                                  )}
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
                                    {index === 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1"
                                      >
                                        {groupSessions.length} in Group
                                      </Badge>
                                    )}
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
                              <td className="">
                                <span className="text-xs font-semibold">
                                  {session.type}
                                </span>
                              </td>

                              {/* STATUS */}
                              <td className="px-4 py-3">
                                {isEditableStatus(session.status) ? (
                                  <Select
                                    value={session.status}
                                    disabled={updatingStatusId === session._id}
                                    onValueChange={async (value) => {
                                      setUpdatingStatusId(session._id);
                                      try {
                                        await handleUpdateSessionStatus(
                                          session._id,
                                          value,
                                        );
                                      } finally {
                                        setUpdatingStatusId(null);
                                      }
                                    }}
                                  >
                                    <SelectTrigger
                                      className={`w-[130px] rounded-full text-xs font-semibold ${statusStyles[session.status]}`}
                                    >
                                      {updatingStatusId === session._id ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          <span>Updating...</span>
                                        </div>
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      {session.status !== "live" && (
                                        <SelectItem value="scheduled">
                                          Scheduled
                                        </SelectItem>
                                      )}
                                      <SelectItem value="live">Live</SelectItem>
                                      <SelectItem value="completed">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        Cancelled
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[session.status]}`}
                                  >
                                    {session.status === "pending" ? (
                                      <>
                                        <UserCog className="w-3 h-3 mr-1" />
                                        Pending Review
                                      </>
                                    ) : (
                                      <>
                                        {typeof session.status === "string"
                                          ? session.status
                                              .charAt(0)
                                              .toUpperCase() +
                                            session.status.slice(1)
                                          : "Unknown"}
                                      </>
                                    )}
                                  </span>
                                )}
                              </td>

                              {/* ACTIONS - Disabled for completed/cancelled sessions */}
                              <td className="px-4 py-3 text-right">
                                {session.status === "completed" ||
                                session.status === "cancelled" ? (
                                  /* Show disabled Actions button for completed/cancelled sessions */
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-50 cursor-not-allowed"
                                    disabled
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  /* Show active Actions dropdown for other statuses */
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
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      {/* Pending actions */}
                                      {session.status === "pending" && (
                                        <>
                                          <DropdownMenuItem
                                            className="text-success"
                                            onClick={async () => {
                                              await handleAcceptSession(
                                                session._id,
                                              );
                                            }}
                                          >
                                            <UserCog className="h-4 w-4 mr-2" />{" "}
                                            Accept
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={async () => {
                                              await handleRejectSession(
                                                session._id,
                                              );
                                            }}
                                          >
                                            <X className="h-4 w-4 mr-2" />{" "}
                                            Reject
                                          </DropdownMenuItem>
                                        </>
                                      )}

                                      {/* Google Meet/Zoom Link - For non-completed sessions */}
                                      {session.status !== "pending" && (
                                        <>
                                          {!session.googleMeetLink ? (
                                            <DropdownMenuItem
                                              className="text-blue-600 font-medium"
                                              onClick={() => {
                                                setSelectedSessionForMeet(
                                                  session,
                                                );
                                                setIsGoogleMeetModalOpen(true);
                                              }}
                                            >
                                              <Video className="h-4 w-4 mr-2" />{" "}
                                              Generate Google Meet/Zoom Link
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem
                                              className="text-blue-600 font-medium"
                                              onClick={() => {
                                                setSelectedSessionForEditMeet(
                                                  session,
                                                );
                                                setIsEditGoogleMeetModalOpen(
                                                  true,
                                                );
                                              }}
                                            >
                                              <Video className="h-4 w-4 mr-2" />{" "}
                                              View Meet Link
                                            </DropdownMenuItem>
                                          )}
                                        </>
                                      )}

                                      {/* Cancel/Delete - Only for scheduled/all tabs */}
                                      {(activeTab === "scheduled" ||
                                        activeTab === "all") && (
                                        <>
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() =>
                                              handleCancelSession(session._id)
                                            }
                                          >
                                            <X className="h-4 w-4 mr-2" />{" "}
                                            Cancel
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() =>
                                              handleDeleteSession(session._id)
                                            }
                                          >
                                            <X className="h-4 w-4 mr-2" />{" "}
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}

                                {/* Single Join Group Button - In LIVE and UPCOMING tabs */}
                                {index === 0 &&
                                  (activeTab === "live" ||
                                    activeTab === "upcoming") &&
                                  session.groupSessionId &&
                                  session.status !== "completed" &&
                                  session.status !== "cancelled" && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                                      onClick={() =>
                                        handleJoinGroupCall(groupSessionId)
                                      }
                                      disabled={
                                        joiningGroupSessionId === groupSessionId
                                      }
                                    >
                                      {joiningGroupSessionId ===
                                      groupSessionId ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Joining...
                                        </>
                                      ) : (
                                        <>
                                          <Video className="w-4 h-4 mr-2" />
                                          Join Group{" "}
                                          <Badge
                                            variant="secondary"
                                            className="ml-2 bg-purple-800 text-white border-none"
                                          >
                                            {groupSessions.length}
                                          </Badge>
                                        </>
                                      )}
                                    </Button>
                                  )}
                              </td>
                            </tr>,
                          );
                        });
                      });

                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">{filteredSessions.length}</span>{" "}
                  {activeTab === "upcoming" ? "upcoming sessions" : "sessions"}
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
                  : activeTab === "upcoming"
                  ? "No upcoming sessions found in the system."
                  : `No ${activeTab} sessions found in the system.`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Session Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot
              be undone.
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
                <span className="font-medium">
                  {selectedSession.userId?.name || "N/A"}
                </span>
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

                        const hasAvailable = dayAvailability?.timeSlots;

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
                        ${
                          rescheduleDate === day.date
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
                          ${
                            slot.status === "available"
                              ? "hover:bg-green-50 border-green-200"
                              : "opacity-50 border-gray-200"
                          }
                          ${
                            rescheduleTime === slot.start
                              ? "ring-2 ring-primary bg-primary/10"
                              : ""
                          }
                        `}
                            >
                              {formatTime(slot.start)} - {formatTime(slot.end)}
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

      {/* Rebook Missed Session Modal */}
      <Dialog open={isRebookModalOpen} onOpenChange={setIsRebookModalOpen}>
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
            <DialogTitle className="text-lg sm:text-xl text-primary-600">
              🔄 Rebook Missed Session
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select a new date and time to rebook this missed session.
            </DialogDescription>
          </DialogHeader>

          {/* ================= BODY (SCROLLABLE) ================= */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {selectedSession && (
              <>
                {/* CURRENT SESSION INFO */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Original Date:
                      </span>{" "}
                      <span className="font-medium">
                        {selectedSession.date
                          ? new Date(selectedSession.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Original Time:
                      </span>{" "}
                      <span className="font-medium">
                        {selectedSession.startTime
                          ? new Date(
                              selectedSession.startTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : selectedSession.time || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Patient:</span>{" "}
                      <span className="font-medium">
                        {selectedSession.userId?.name || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Therapist:</span>{" "}
                      <span className="font-medium">
                        {selectedSession.therapistId?.name || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* DATE + TIME SELECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CALENDAR */}
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <h4 className="font-bold text-sm mb-3">Select New Date</h4>
                    <div className="space-y-2">
                      {/* Calendar header */}
                      <div className="flex justify-between items-center mb-3">
                        <button
                          type="button"
                          className="p-1 hover:bg-accent rounded"
                          onClick={() => {
                            const newMonth = currentMonth - 1;
                            const newYear =
                              newMonth < 0 ? currentYear - 1 : currentYear;
                            setCurrentMonth(newMonth < 0 ? 11 : newMonth);
                            setCurrentYear(newYear);
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-sm">
                          {new Date(currentYear, currentMonth).toLocaleString(
                            "default",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <button
                          type="button"
                          className="p-1 hover:bg-accent rounded"
                          onClick={() => {
                            const newMonth = currentMonth + 1;
                            const newYear =
                              newMonth > 11 ? currentYear + 1 : currentYear;
                            setCurrentMonth(newMonth > 11 ? 0 : newMonth);
                            setCurrentYear(newYear);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center mb-2">
                        <div>Su</div>
                        <div>Mo</div>
                        <div>Tu</div>
                        <div>We</div>
                        <div>Th</div>
                        <div>Fr</div>
                        <div>Sa</div>
                      </div>

                      {/* Calendar days */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarWeeks.map((week, index) =>
                          week.map((dayData, dayIndex) => {
                            if (!dayData) {
                              return <div key={`empty-${index}-${dayIndex}`} />;
                            }

                            const dateStr = dayData.date;
                            const isSelected = rebookDate === dateStr;
                            const isPast = isPastDate(dateStr);
                            const hasAvailability = availability.some(
                              (item) =>
                                item.date === dateStr &&
                                item.timeSlots &&
                                item.timeSlots.length > 0
                            );

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                disabled={isPast || !hasAvailability}
                                className={cn(
                                  "aspect-square p-1 text-xs rounded-md transition-colors",
                                  isSelected &&
                                    "bg-primary text-white font-bold",
                                  !isSelected &&
                                    !isPast &&
                                    hasAvailability &&
                                    "hover:bg-accent",
                                  isPast && "opacity-30 cursor-not-allowed",
                                  !isPast &&
                                    !hasAvailability &&
                                    "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() => {
                                  setRebookDate(dateStr);
                                }}
                              >
                                {dayData.day}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TIME SLOTS */}
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <h4 className="font-bold text-sm mb-3">
                      Available Time Slots
                    </h4>
                    <div className="space-y-3">
                      {rebookDate ? (
                        (() => {
                          const dayAvailability = availability.find(
                            (item) => item.date === rebookDate
                          );

                          if (
                            !dayAvailability ||
                            dayAvailability.timeSlots.length === 0
                          ) {
                            return (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No slots available
                              </p>
                            );
                          }

                          return dayAvailability.timeSlots.map(
                            (slot: any, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                className={cn(
                                  "w-full py-2 px-3 rounded-md text-xs font-medium transition-colors",
                                  rebookTime === slot.start
                                    ? "bg-primary text-white"
                                    : "bg-background hover:bg-accent border"
                                )}
                                onClick={() => setRebookTime(slot.start)}
                              >
                                {formatTime(slot.start)} -{" "}
                                {formatTime(slot.end)}
                              </button>
                            )
                          );
                        })()
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select a date to see slots
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* INFO BOX */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>ℹ️ Note:</strong> The client will be automatically
                    notified about the new session schedule.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ================= FOOTER (FIXED) ================= */}
          <DialogFooter className="px-4 sm:px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsRebookModalOpen(false);
                setRebookDate("");
                setRebookTime("");
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={!rebookDate || !rebookTime}
              onClick={handleRebookMissedSession}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm Rebooking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Modal */}
      <Dialog
        open={isCreateSessionModalOpen}
        onOpenChange={setIsCreateSessionModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Schedule a new session for a user with a therapist.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* USER SELECTION */}
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select
                value={newSession.userId}
                onValueChange={(value) => {
                  setNewSession({ ...newSession, userId: value });
                  fetchUserSubscriptions(value); // Fetch subscriptions for the selected user
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user with active subscription" />
                </SelectTrigger>
                <SelectContent>
                  {usersWithActiveSubscriptions &&
                  usersWithActiveSubscriptions.length > 0 ? (
                    usersWithActiveSubscriptions.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_users__" disabled>
                      {loadingUsers
                        ? "Loading users..."
                        : "No users with active subscriptions"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* SUBSCRIPTION SELECTION */}
            {newSession.userId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Plan</label>
                <Select
                  value={newSession.subscriptionId}
                  onValueChange={(value) => {
                    setNewSession({ ...newSession, subscriptionId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an active subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUserSubscriptions &&
                    selectedUserSubscriptions.length > 0 ? (
                      selectedUserSubscriptions.map((sub) => (
                        <SelectItem key={sub._id} value={sub._id}>
                          {sub.planName} - {sub.availableSessions?.remaining}{" "}
                          sessions remaining
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_subscriptions__" disabled>
                        {loadingSubscriptions
                          ? "Loading subscriptions..."
                          : "No active subscriptions"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* DATE AND TIME WITH AVAILABILITY */}
            <div className="space-y-6">
              {/* DATE SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <label className="text-sm font-medium">Select Date</label>
                </div>
                <div className="relative">
                  <Input
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({ ...newSession, date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    className="w-full pr-10"
                  />
                  {/* Date availability indicator */}
                  {newSession.date && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {availability.some(
                        (item) =>
                          item.date === newSession.date &&
                          item.therapistId._id === newSession.therapistId &&
                          item.timeSlots.some(
                            (slot) =>
                              slot.status === true ||
                              slot.status === "available"
                          )
                      ) ? (
                        <div
                          className="w-3 h-3 rounded-full bg-green-500"
                          title="Available slots"
                        ></div>
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full bg-red-500"
                          title="No available slots"
                        ></div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {newSession.date &&
                  availability.some(
                    (item) =>
                      item.date === newSession.date &&
                      item.therapistId._id === newSession.therapistId &&
                      item.timeSlots.some(
                        (slot) =>
                          slot.status === true || slot.status === "available"
                      )
                  )
                    ? "✓ Available time slots found for this date"
                    : newSession.date
                    ? "⚠ No available time slots for this date"
                    : "Select a date to check availability"}
                </p>
              </div>

              {/* TIME SLOT SELECTION */}
              {newSession.date && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">
                      Available Time Slots
                    </label>
                    <Badge variant="secondary" className="ml-2">
                      {
                        availability
                          .filter(
                            (item) =>
                              item.date === newSession.date &&
                              item.therapistId._id === newSession.therapistId
                          )
                          .flatMap((item) =>
                            item.timeSlots.filter(
                              (slot) =>
                                slot.status === true ||
                                slot.status === "available"
                            )
                          ).length
                      }{" "}
                      slots
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg bg-muted/10">
                    {availability
                      .filter(
                        (item) =>
                          item.date === newSession.date &&
                          item.therapistId._id === newSession.therapistId
                      )
                      .flatMap((item) =>
                        item.timeSlots
                          .filter(
                            (slot) =>
                              slot.status === true ||
                              slot.status === "available"
                          )
                          .map((slot) => (
                            <button
                              key={`${item.date}-${slot.start}`}
                              type="button"
                              onClick={() => {
                                // Only allow selecting if the slot is available and not in the past
                                const isPastSlot = isTimeSlotPast(
                                  item.date,
                                  slot.start
                                );
                                const isAvailable = slot.status === "available";

                                if (!isPastSlot && isAvailable) {
                                  setNewSession({
                                    ...newSession,
                                    time: slot.start,
                                  });
                                }
                              }}
                              disabled={
                                slot.status !== "available" ||
                                isTimeSlotPast(item.date, slot.start)
                              }
                              className={`
                                p-3 text-center rounded-lg border transition-all
                                ${
                                  newSession.time === slot.start
                                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                                    : "border-border hover:border-primary hover:bg-primary/5"
                                }
                                ${
                                  slot.status !== "available" ||
                                  isTimeSlotPast(item.date, slot.start)
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:border-primary hover:bg-primary/5"
                                }
                              `}
                            >
                              <div className="font-medium text-sm">
                                {formatTime(slot.start)}
                              </div>
                              <div className="text-xs text-black mt-1">
                                {slot.duration} min
                              </div>
                            </button>
                          ))
                      )}

                    {availability
                      .filter(
                        (item) =>
                          item.date === newSession.date &&
                          item.therapistId._id === newSession.therapistId
                      )
                      .flatMap((item) =>
                        item.timeSlots.filter(
                          (slot) =>
                            slot.status === true || slot.status === "available"
                        )
                      ).length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          No available time slots for this date
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SESSION TYPE */}
            <div className="grid grid-cols-2 gap-4">
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

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateSessionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={
                !newSession.userId ||
                !newSession.subscriptionId ||
                !newSession.therapistId ||
                !newSession.date ||
                !newSession.time
              }
            >
              Create Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Meet Generation Modal */}
      <GenerateGoogleMeetModal
        isOpen={isGoogleMeetModalOpen}
        onClose={() => setIsGoogleMeetModalOpen(false)}
        sessionId={selectedSessionForMeet?._id}
        sessionInfo={
          selectedSessionForMeet
            ? {
                userName: selectedSessionForMeet.userId?.name || "N/A",
                therapistName:
                  selectedSessionForMeet.therapistId?.name || "N/A",
                date: selectedSessionForMeet.date,
                time: selectedSessionForMeet.time,
                serviceName:
                  selectedSessionForMeet.bookingId?.serviceName ||
                  selectedSessionForMeet.subscriptionId?.planName ||
                  "Session",
              }
            : undefined
        }
        onSuccess={() => {
          // Refresh sessions to show the new Google Meet link
          dispatch(fetchSessions());
        }}
      />

      {/* Google Meet Edit Modal */}
      <EditGoogleMeetModal
        isOpen={isEditGoogleMeetModalOpen}
        onClose={() => setIsEditGoogleMeetModalOpen(false)}
        sessionId={selectedSessionForEditMeet?._id}
        currentLink={selectedSessionForEditMeet?.googleMeetLink || ""}
        currentCode={selectedSessionForEditMeet?.googleMeetCode || ""}
        onSuccess={() => {
          // Refresh sessions to show the updated Google Meet link
          dispatch(fetchSessions());
        }}
      />
    </div>
  );
}