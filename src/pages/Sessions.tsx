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
import { fetchSessions, createSession, updateSession, deleteSession } from "@/features/sessions/sessionSlice";

type SessionStatus = "scheduled" | "live" | "completed" | "cancelled" | "no-show";

export default function Sessions() {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const { list: sessions = [], loading, error } = useSelector((state: any) => state.sessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  // State for creating a new session
  const [newSession, setNewSession] = useState({
    bookingId: "",
    date: "",
    time: "",
    type: "1-on-1",
    status: "scheduled",
    notes: ""
  });

  // State for rescheduling
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-info/15 text-info";
      case "live":
        return "bg-success/15 text-success";
      case "completed":
        return "status-active";
      case "cancelled":
        return "status-pending";
      case "no-show":
        return "status-rejected";
      default:
        return "status-inactive";
    }
  };

  const getCurrentSessions = () => {
    switch (activeTab) {
      case "upcoming":
        return (sessions || []).filter((session: any) => session.status === 'scheduled');
      case "live":
        return (sessions || []).filter((session: any) => session.status === 'live');
      case "completed":
        return (sessions || []).filter((session: any) => session.status === 'completed');
      case "cancelled":
        return (sessions || []).filter((session: any) => session.status === 'cancelled');
      default:
        return [];
    }
  };

  const filteredSessions = getCurrentSessions().filter(
    (session) =>
      (session.bookingId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle creating a new session
  const handleCreateSession = async () => {
    try {
      await dispatch(createSession(newSession));
      setIsCreateSessionModalOpen(false);
      setNewSession({
        bookingId: "",
        date: "",
        time: "",
        type: "1-on-1",
        status: "scheduled",
        notes: ""
      });
      // Refresh sessions list
      dispatch(fetchSessions());
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Session Management</h1>
          <p className="page-subtitle">Monitor and manage all platform sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateSessionModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Session
          </Button>
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{(sessions || []).filter((session: any) => session.status === 'scheduled').length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Play className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{(sessions || []).filter((session: any) => session.status === 'live').length}</p>
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
              <p className="text-2xl font-semibold">{(sessions || []).filter((session: any) => session.status === 'completed').length}</p>
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
              <p className="text-2xl font-semibold">{(sessions || []).filter((session: any) => session.status === 'cancelled').length}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-info/20 text-info rounded-full">
              {(sessions || []).filter((session: any) => session.status === 'scheduled').length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="live" className="relative">
            Live
            {(sessions || []).filter((session: any) => session.status === 'live').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-success/20 text-success rounded-full animate-pulse">
                {(sessions || []).filter((session: any) => session.status === 'live').length}
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
              placeholder="Search by booking ID or session type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sessions Table */}
        <TabsContent value={activeTab} className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Session Type</th>
                    <th>Date & Time</th>
                    <th>Format</th>
                    <th>Status</th>
                    {(activeTab === "live" || activeTab === "completed") && <th>Notes</th>}
                    {activeTab === "cancelled" && <th>Notes</th>}
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session: any) => (
                    <tr key={session.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{session.bookingId || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCog className="w-4 h-4 text-primary" />
                          </div>
                          <span>{session.type}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{session.date}</span>
                          <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                          <span>{session.time}</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge bg-muted text-muted-foreground">{session.type}</span>
                      </td>
                      <td>
                        <span className={cn("status-badge", getStatusBadge(session.status))}>
                          {session.status === "no-show" ? "No-show" : session.status}
                        </span>
                      </td>
                      {(activeTab === "live" || activeTab === "completed") && (
                        <td className="text-muted-foreground">{session.notes || 'N/A'}</td>
                      )}
                      {activeTab === "cancelled" && (
                        <td className="text-muted-foreground">{session.notes || 'N/A'}</td>
                      )}
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {activeTab === "upcoming" && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedSession(session);
                                  setIsRescheduleModalOpen(true);
                                }}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setIsCancelModalOpen(true);
                                  }}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel Session
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (session.joinLink) {
                                    navigator.clipboard.writeText(session.joinLink);
                                    // Here you would typically show a toast notification
                                  }
                                }}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Join Link
                                </DropdownMenuItem>
                              </>
                            )}
                            {activeTab === "live" && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  if (session.joinLink) {
                                    // Extract session ID from the join link
                                    const sessionId = session.joinLink.split('/').pop() || session.id.toString();
                                    // Open the video call page in a new tab
                                    window.open(`/video-call/${sessionId}`, '_blank', 'width=1200,height=800');
                                  }
                                }}>
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Session
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // Navigate to the live sessions page
                                  navigate('/live-sessions');
                                }}>
                                  <Video className="w-4 h-4 mr-2" />
                                  View All Live Sessions
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (session.joinLink) {
                                    navigator.clipboard.writeText(session.joinLink);
                                    // Here you would typically show a toast notification
                                  }
                                }}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Join Link
                                </DropdownMenuItem>
                              </>
                            )}
                            {activeTab === "completed" && (
                               <>
                                <DropdownMenuItem onClick={() => {
                                  // Navigate to the session recordings page
                                  navigate(`/session-recordings/${session.bookingId || session.id}`);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Recording
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{filteredSessions.length}</span> sessions
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="min-w-[32px]">1</Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Session Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">Booking ID:</span>{" "}
                  <span className="font-medium">{selectedSession.bookingId || 'N/A'}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">{selectedSession.type}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Scheduled:</span>{" "}
                  <span className="font-medium">{selectedSession.date} at {selectedSession.time}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Cancellation Reason</label>
                <Textarea
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Session
            </Button>
            <Button variant="destructive" onClick={async () => {
              try {
                await dispatch(updateSession({ id: selectedSession.id, sessionData: { status: 'cancelled', notes: cancelReason } }));
                setIsCancelModalOpen(false);
                setCancelReason('');
                dispatch(fetchSessions());
              } catch (error) {
                console.error('Failed to cancel session:', error);
              }
            }}>
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
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
                  <span className="font-medium">{selectedSession.bookingId || 'N/A'}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium">{selectedSession.date} at {selectedSession.time}</span>
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
                  <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
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
            <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              try {
                await dispatch(updateSession({ 
                  id: selectedSession.id, 
                  sessionData: { 
                    status: 'scheduled',
                    date: rescheduleDate,
                    time: rescheduleTime
                  } 
                }));
                setIsRescheduleModalOpen(false);
                setRescheduleDate('');
                setRescheduleTime('');
                dispatch(fetchSessions());
              } catch (error) {
                console.error('Failed to reschedule session:', error);
              }
            }}>
              Reschedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Modal */}
      <Dialog open={isCreateSessionModalOpen} onOpenChange={setIsCreateSessionModalOpen}>
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
                <label className="text-sm font-medium">Booking ID</label>
                <Input
                  placeholder="Enter booking ID"
                  value={newSession.bookingId}
                  onChange={(e) => setNewSession({...newSession, bookingId: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select value={newSession.type} onValueChange={(value) => setNewSession({...newSession, type: value})}>
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
                <Select value={newSession.status} onValueChange={(value) => setNewSession({...newSession, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newSession.time}
                  onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional notes about the session..."
                value={newSession.notes}
                onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>
              Create Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}