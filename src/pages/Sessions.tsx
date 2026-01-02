import { useState } from "react";
import { Search, MoreHorizontal, Video, Calendar, Clock, User, UserCog, X, RefreshCw, ChevronLeft, ChevronRight, Play, Eye, Copy } from "lucide-react";
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
import { mockSessions } from "@/lib/session-data";

// Using mockSessions from session-data.ts

type SessionStatus = "scheduled" | "live" | "completed" | "cancelled" | "no-show";

export default function Sessions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);

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
        return mockSessions.upcoming;
      case "live":
        return mockSessions.live;
      case "completed":
        return mockSessions.completed;
      case "cancelled":
        return mockSessions.cancelled;
      default:
        return [];
    }
  };

  const filteredSessions = getCurrentSessions().filter(
    (session) =>
      session.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.therapist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Session Management</h1>
          <p className="page-subtitle">Monitor and manage all platform sessions</p>
        </div>
        <div className="flex items-center gap-3">
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
              <p className="text-2xl font-semibold">{mockSessions.upcoming.length}</p>
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
              <p className="text-2xl font-semibold">{mockSessions.live.length}</p>
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
              <p className="text-2xl font-semibold">{mockSessions.completed.length}</p>
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
              <p className="text-2xl font-semibold">{mockSessions.cancelled.length}</p>
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
              {mockSessions.upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="live" className="relative">
            Live
            {mockSessions.live.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-success/20 text-success rounded-full animate-pulse">
                {mockSessions.live.length}
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
              placeholder="Search by user or therapist..."
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
                    <th>User</th>
                    <th>Therapist</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    {(activeTab === "live" || activeTab === "completed") && <th>Duration</th>}
                    {activeTab === "cancelled" && <th>Reason</th>}
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
                          <span className="font-medium">{session.user}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCog className="w-4 h-4 text-primary" />
                          </div>
                          <span>{session.therapist}</span>
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
                        <td className="text-muted-foreground">{session.duration}</td>
                      )}
                      {activeTab === "cancelled" && (
                        <td className="text-muted-foreground">{session.reason}</td>
                      )}
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {activeTab === "completed" && (
                              <DropdownMenuItem onClick={() => {
                                // Navigate to the session recordings page for the specific user
                                navigate(`/session-recordings/${selectedSession.user.replace(/\s+/g, '-').toLowerCase()}`);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Recording
                              </DropdownMenuItem>
                            )}
                            {activeTab === "upcoming" && (
                              <>
                                {session.status === "pending" && (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedSession(session);
                                    setIsAcceptModalOpen(true);
                                  }}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Accept Session
                                  </DropdownMenuItem>
                                )}
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
                                    // Extract session ID from the mock join link
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
                  <span className="text-muted-foreground">User:</span>{" "}
                  <span className="font-medium">{selectedSession.user}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Therapist:</span>{" "}
                  <span className="font-medium">{selectedSession.therapist}</span>
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
            <Button variant="destructive" onClick={() => setIsCancelModalOpen(false)}>
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Session Modal */}
      <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Session Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this session request? The client will be notified and the session will be scheduled.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">User:</span>{" "}
                  <span className="font-medium">{selectedSession.user}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Therapist:</span>{" "}
                  <span className="font-medium">{selectedSession.therapist}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">{selectedSession.date}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Time:</span>{" "}
                  <span className="font-medium">{selectedSession.time}</span>
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAcceptModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Here you would typically make an API call to accept the session
              setIsAcceptModalOpen(false);
              // After accepting, navigate to the live sessions page to join
              navigate('/live-sessions');
            }}>
              Accept Session
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
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium">{selectedSession.date} at {selectedSession.time}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">New Date</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">New Time</label>
                  <Select>
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
            <Button onClick={() => setIsRescheduleModalOpen(false)}>
              Reschedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
