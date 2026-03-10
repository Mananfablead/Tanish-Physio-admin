import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Video, 
  Clock, 
  User, 
  UserCog, 
  Calendar, 
  Phone,
  Play,
  Users,
  Filter,
  Search,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { fetchSessions, createSession, updateSession, deleteSession, rescheduleSession, deleteSessionById, updateSessionStatus, fetchAllUpcomingSessions } from "@/features/sessions/sessionSlice";
import { useDispatch, useSelector } from 'react-redux';

const LiveSessions = () => {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming'); // Default to upcoming
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time in real-time
    const { list: allSessions = [], loading, error } = useSelector((state: any) => state.sessions);
  const { upcomingSessions = [] } = useSelector((state: any) => state.sessions);

  // Update current time every second for real-time button updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to calculate time until session
  const calculateTimeUntilSession = (date: string, time: string) => {
    // Create a date object combining the session date and time
    const sessionDateTime = new Date(`${date} ${time}`);
    
    // Use currentTime state instead of new Date() for consistency
    const now = currentTime;
    
    // Calculate difference in milliseconds
    const diffMs = sessionDateTime.getTime() - now.getTime();
    
    // Convert to hours and minutes
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format the result
    if (diffHours > 0) {
      if (diffMinutes > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else {
        return `${diffHours}h`;
      }
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`;
    } else {
      return 'less than 1 minute';
    }
  };
  
  // Filter sessions based on active tab and additional filters
  const filteredSessions = (activeTab === 'upcoming' ? upcomingSessions : allSessions).filter((session: any) => {
    // First filter by tab status
    let includeInTab = false;
    switch (activeTab) {
    
      case "upcoming":
        includeInTab = true; // Show all upcoming sessions regardless of status
        break;
      case "live":
        includeInTab = session.status === "live";
        break;
      default:
        includeInTab = true;
    }

    if (!includeInTab) return false;

    // Apply additional filter based on user selection
    if (filterType === 'all') {
      return true;
    } else if (filterType === '1-on-1') {
      return includeInTab && session.type === '1-on-1';
    } else if (filterType === 'group') {
      return includeInTab && session.type === 'group';
    }
    
    return includeInTab; // Default to showing sessions based on tab status
  });

  // Count sessions by status for tabs
  const upcomingTabCount = (upcomingSessions || []).length;
  const liveTabCount = (allSessions || []).filter((session: any) => session.status === "live").length;
  
  useEffect(() => {
    // Fetch both upcoming and all sessions initially
    dispatch(fetchAllUpcomingSessions());
    dispatch(fetchSessions());
  }, [dispatch]);

  // Refetch based on tab selection
  useEffect(() => {
    if (activeTab === 'upcoming') {
      dispatch(fetchAllUpcomingSessions());
    } else {
      dispatch(fetchSessions());
    }
  }, [dispatch, activeTab]);





  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === "upcoming" ? "Upcoming Sessions" : "Live Sessions"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === "upcoming"
              ? "View and manage upcoming sessions"
              : "View and join live sessions or sessions starting within 24 hours"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "upcoming"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Upcoming
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-info/20 text-info rounded-full">
              {upcomingTabCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "live"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Live
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-success/20 text-success rounded-full">
              {liveTabCount}
            </span>
          </button>
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <Video className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {activeTab === "upcoming" ? upcomingTabCount : liveTabCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "upcoming" ? "Upcoming" : "Currently Live"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {
                  allSessions.filter((session: any) => {
                    const sessionDateTime = new Date(
                      `${session.date} ${session.time}`
                    );
                    const timeDiff = sessionDateTime.getTime() - currentTime.getTime();
                    const hoursDiff = timeDiff / (1000 * 60 * 60);
                    return (
                      hoursDiff <= 2 &&
                      hoursDiff >= 0 &&
                      session.status === "scheduled"
                    );
                  }).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Starting in 2 hrs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {
                  allSessions.filter(
                    (session: any) => session.status === "live"
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Available to Join</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Filter Type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Live Sessions</SelectItem>
              <SelectItem value="1-on-1">1-on-1</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or therapist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              No {activeTab === "upcoming" ? "upcoming" : "live"} sessions
              available
            </h3>
            <p className="text-muted-foreground">
              No {activeTab === "upcoming" ? "scheduled" : "live"} sessions
              found.{" "}
              {activeTab === "upcoming"
                ? "All upcoming sessions will appear here."
                : "Only showing currently live sessions."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions
            .filter((session: any) => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();

              // Search in user name, therapist name, date, time, or type
              return (
                session.userId?.name?.toLowerCase().includes(query) ||
                session.therapistId?.name?.toLowerCase().includes(query) ||
                session.date?.toLowerCase().includes(query) ||
                session.time?.toLowerCase().includes(query) ||
                session.type?.toLowerCase().includes(query)
              );
            })
            .map((session: any) => (
              <Card
                key={session._id}
                className="shadow-sm rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {session.userId?.name || "N/A"}
                        <Badge
                          variant="secondary"
                          className={
                            session.status !== "live"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {session.status !== "live" ? "SCHEDULED" : "LIVE NOW"}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.therapistId?.name || "N/A"}
                      </p>
                    </div>
                    <Badge variant="outline">{session.type}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  <div className="space-y-4">
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

                    {/* GOOGLE MEET LINK DISPLAY */}
                    {session.googleMeetLink && (
                      <div className="pt-2">
                        <div className="flex flex-col gap-1">
                          <a
                            href={session.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center
                              bg-blue-100 hover:bg-blue-200
                              text-blue-700 font-bold text-xs
                              px-2 py-1 rounded-full whitespace-nowrap gap-1"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22.2819 9.8211a5.9848 5.9848 0 0 0-.5157-2.1734 6.0633 6.0633 0 0 0-1.4432-1.9437 6.0335 6.0335 0 0 0-1.9441-1.4427 5.996 5.996 0 0 0-2.174-.5152c-.3747-.0428-.7511-.0643-1.1277-.0643-.4163 0-.7927.025-1.168.0745a5.993 5.993 0 0 0-2.174.5137 6.058 6.058 0 0 0-1.944 1.4441 6.035 6.035 0 0 0-1.443 1.9433 5.996 5.996 0 0 0-.515 2.174c-.0428.375-.0643.751-.0643 1.128 0 .416.025.793.074 1.168a5.993 5.993 0 0 0 .513 2.174 6.058 6.058 0 0 0 1.444 1.944 6.035 6.035 0 0 0 1.943 1.443 5.996 5.996 0 0 0 2.174.515c.375.043.751.064 1.128.064.416 0 .793-.025 1.168-.074a5.993 5.993 0 0 0 2.174-.513 6.058 6.058 0 0 0 1.944-1.444 6.035 6.035 0 0 0 1.443-1.943 5.996 5.996 0 0 0 .515-2.174c.043-.375.064-.751.064-1.128 0-.416-.025-.793-.074-1.168zm-9.478 4.3233L6.4358 10.006a.75.75 0 0 1 .254-1.225l13.006-7.5a.75.75 0 0 1 1.089.254.75.75 0 0 1-.254 1.09l-12.212 7.05 12.212 7.05a.75.75 0 0 1 .254 1.09.75.75 0 0 1-1.09.254l-13-7.5a.75.75 0 0 1-.254-.254z" />
                            </svg>
                            Join Google Meet
                          </a>
                          {session.googleMeetCode && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Code: {session.googleMeetCode}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {(() => {
                        // Calculate if session time has arrived using currentTime state
                        const sessionDateTime = new Date(
                          `${session.date} ${session.time}`
                        );
                        const now = currentTime; // Use state time instead of new Date()
                        const isSessionTimeArrived =
                          sessionDateTime.getTime() <= now.getTime();

                        if (session.status === "live") {
                          // For live sessions, check if the actual session time has arrived
                          if (isSessionTimeArrived) {
                            return (
                              <div className="flex gap-2 flex-1">
                                <Button
                                  className="flex-1"
                                  onClick={() => {
                                    navigate(`/video-call/${session._id}`);
                                  }}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Session
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      `${window.location.origin}/video-call/${session._id}`
                                    )
                                  }
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                {/* Google Meet Generation Button */}
                                {!session.googleMeetLink && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(
                                          `${
                                            import.meta.env.VITE_API_BASE_URL ||
                                            "http://localhost:5000"
                                          }/video-call/generate-google-meet`,
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                              Authorization: `Bearer ${localStorage.getItem(
                                                "token"
                                              )}`,
                                            },
                                            body: JSON.stringify({
                                              sessionId: session._id,
                                            }),
                                          }
                                        );

                                        const data = await response.json();

                                        if (data.success) {
                                          // Refresh sessions to show the new link
                                          dispatch(fetchSessions());

                                          // Show success toast
                                          const toastElement =
                                            document.createElement("div");
                                          toastElement.className =
                                            "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-right";
                                          toastElement.innerHTML =
                                            "✅ Google Meet link generated successfully!";
                                          document.body.appendChild(
                                            toastElement
                                          );

                                          setTimeout(() => {
                                            document.body.removeChild(
                                              toastElement
                                            );
                                          }, 3000);
                                        } else {
                                          throw new Error(
                                            data.message ||
                                              "Failed to generate Google Meet link"
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error generating Google Meet link:",
                                          error
                                        );
                                        // Show error toast
                                        const toastElement =
                                          document.createElement("div");
                                        toastElement.className =
                                          "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-right";
                                        toastElement.innerHTML =
                                          "❌ Failed to generate Google Meet link";
                                        document.body.appendChild(toastElement);

                                        setTimeout(() => {
                                          document.body.removeChild(
                                            toastElement
                                          );
                                        }, 3000);
                                      }
                                    }}
                                  >
                                    <Video className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            );
                          } else {
                            // Session is marked as live but time hasn't arrived yet
                            return (
                              <Button
                                className="flex-1"
                                variant="secondary"
                                disabled
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Session Early - Starts in{" "}
                                {calculateTimeUntilSession(
                                  session.date,
                                  session.time
                                )}
                              </Button>
                            );
                          }
                        } else {
                          // For non-live sessions, use timingStatus
                          if (session.timingStatus === "join_now") {
                            // Check if the actual session time has arrived
                            if (isSessionTimeArrived) {
                              return (
                                <Button
                                  className="flex-1"
                                  onClick={() =>
                                    navigate(`/video-call/${session._id}`)
                                  }
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Session
                                </Button>
                              );
                            } else {
                              // Session is in join_now window but time hasn't arrived yet
                              return (
                                <Button
                                  className="flex-1"
                                  variant="secondary"
                                  disabled
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Session Early - Starts in{" "}
                                  {calculateTimeUntilSession(
                                    session.date,
                                    session.time
                                  )}
                                </Button>
                              );
                            }
                          } else if (session.timingStatus === "join_soon") {
                            return (
                              <Button className="flex-1" variant="secondary">
                                <Clock className="w-4 h-4 mr-2" />
                                Join Soon
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                className="flex-1"
                                variant="secondary"
                                disabled
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Starts in{" "}
                                {calculateTimeUntilSession(
                                  session.date,
                                  session.time
                                )}
                              </Button>
                            );
                          }
                        }
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default LiveSessions;