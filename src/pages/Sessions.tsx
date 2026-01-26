import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Video, Calendar, Clock, User, UserCog, X, RefreshCw, ChevronLeft, ChevronRight, Play, Eye, Copy, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { fetchSessions, createSession, updateSession, deleteSession, rescheduleSession, deleteSessionById, updateSessionStatus, fetchAllUpcomingSessions, acceptSession, rejectSession } from "@/features/sessions/sessionSlice";
import { fetchBookings } from "@/features/bookings/bookingSlice";

type SessionStatus = "scheduled" | "live" | "completed" | "cancelled" | "no-show";

export default function Sessions() {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const { list: bookings, loading: bookingsLoading, error: bookingsError } = useSelector((state: any) => state.bookings);

  const { list: allSessions = [], loading, error } = useSelector((state: any) => state.sessions);
  const { upcomingSessions = [] } = useSelector((state: any) => state.sessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  // Count sessions by status for tabs
  const scheduledCount = (allSessions || []).filter((session: any) => session.status === "scheduled").length;
  const allCount = (allSessions || []).length;
  const liveCount = (allSessions || []).filter((session: any) => session.status === "live").length;
  const completedCount = (allSessions || []).filter((session: any) => session.status === "completed").length;
  const cancelledCount = (allSessions || []).filter((session: any) => session.status === "cancelled").length;
  const pendingCount = (allSessions || []).filter((session: any) => session.status === "pending").length;

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
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSessions());
    dispatch(fetchBookings());
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
          {/* <Button onClick={() => setIsCreateSessionModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Session
          </Button> */}
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
              {filteredSessions.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No live sessions available</h3>
                  <p className="text-muted-foreground">No live sessions found. Only showing currently live sessions.</p>
                </div>
              ) : (
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
                                {user?.name || 'N/A'}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  LIVE NOW
                                </span>
                              </h3>
                              <p className="text-sm text-muted-foreground">{therapist?.name || 'N/A'}</p>
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
                                window.open(
                                  `/video-call/${session.sessionId}`,
                                  "_blank",
                                  "width=1200,height=800"
                                )
                              }
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Live Session
                            </Button>
                            <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/video-call/${session.sessionId}`);
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
              )}
            </div>
          ) : (
            /* Regular Table View for other tabs including 'all' */
            <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {/* <th>Booking Info</th> */}
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
                      console.log("booking", session)
                      return (
                        <tr key={session._id} className="hover:bg-muted/40 transition">
                          {/* SERVICE / BOOKING */}
                          {/* <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <p className="font-medium">{booking?.serviceName || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">
                                Booking ID: {booking?._id?.slice(0, 8) || "N/A"}
                              </p>
                            </div>
                          </td> */}

                          {/* USER */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{user?.name || "N/A"}</p>
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
                            {session.status === 'pending' ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                <UserCog className="w-3 h-3 mr-1" />
                                Pending Review
                              </span>
                            ) : (
                              <Select
                                value={session.status}
                                onValueChange={async (value) => {
                                  try {
                                    await dispatch(updateSessionStatus({
                                      id: session._id,
                                      status: value,
                                      notes: `Status updated to ${value}`
                                    }));
                                    dispatch(fetchSessions());
                                  } catch (error) {
                                    console.error("Failed to update session status:", error);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="live">Live</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                        try {
                                          await dispatch(acceptSession(session._id));
                                          dispatch(fetchSessions());
                                        } catch (error) {
                                          console.error("Failed to accept session:", error);
                                        }
                                      }}
                                    >
                                      <UserCog className="h-4 w-4 mr-2" />
                                      Accept Session
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={async () => {
                                        try {
                                          await dispatch(rejectSession(session._id));
                                          dispatch(fetchSessions());
                                        } catch (error) {
                                          console.error("Failed to reject session:", error);
                                        }
                                      }}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject Session
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* SCHEDULED/CANCELLED SESSIONS (non-pending) */}
                                {(activeTab === "scheduled" || activeTab === "all") && session.status !== "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSession(session);
                                        setIsRescheduleModalOpen(true);
                                      }}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Reschedule
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={async () => {
                                        try {
                                          await dispatch(updateSessionStatus({
                                            id: session._id,
                                            status: "cancelled",
                                            notes: "Session cancelled by admin"
                                          }));
                                          dispatch(fetchSessions());
                                        } catch (error) {
                                          console.error("Failed to cancel session:", error);
                                        }
                                      }}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel Session
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedSession(session);
                                        setIsCancelModalOpen(true);
                                      }}
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
                                      window.open(
                                        `/video-call/${session.sessionId}`,
                                        "_blank",
                                        "width=1200,height=800"
                                      )
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
                                      navigate(`/session-recordings/${session._id}`)
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for this session.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">Booking ID:</span>{" "}
                  <span className="font-medium">
                    {selectedSession.bookingId?._id}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium">
                    {selectedSession.date} at {selectedSession.time}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
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
                  <Select
                    value={rescheduleTime}
                    onValueChange={setRescheduleTime}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="09:30">09:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsRescheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
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
                } catch (error) {
                  console.error("Failed to reschedule session:", error);
                }
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