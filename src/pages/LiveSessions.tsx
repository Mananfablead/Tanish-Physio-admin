import { useState, useEffect } from 'react';
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
  const dispatch: any = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming'); // Default to upcoming
    const { list: allSessions = [], loading, error } = useSelector((state: any) => state.sessions);
  const { upcomingSessions = [] } = useSelector((state: any) => state.sessions);

  // Function to calculate time until session
  const calculateTimeUntilSession = (date: string, time: string) => {
    // Create a date object combining the session date and time
    const sessionDateTime = new Date(`${date} ${time}`);
    
    // Get current time
    const now = new Date();
    
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
          <h1 className="text-2xl font-bold tracking-tight">{activeTab === 'upcoming' ? 'Upcoming Sessions' : 'Live Sessions'}</h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === 'upcoming' 
              ? 'View and manage upcoming sessions'
              : 'View and join live sessions or sessions starting within 24 hours'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'upcoming' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            Upcoming
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-info/20 text-info rounded-full">
              {upcomingTabCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'live' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
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
              <p className="text-2xl font-semibold">{activeTab === 'upcoming' ? upcomingTabCount : liveTabCount}</p>
              <p className="text-sm text-muted-foreground">{activeTab === 'upcoming' ? 'Upcoming' : 'Currently Live'}</p>
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
                {allSessions.filter((session: any) => {
                  const sessionDateTime = new Date(`${session.date} ${session.time}`);
                  const now = new Date();
                  const timeDiff = sessionDateTime.getTime() - now.getTime();
                  const hoursDiff = timeDiff / (1000 * 60 * 60);
                  return hoursDiff <= 24 && hoursDiff >= 0 && session.status === 'scheduled';
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Starting in 24h</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{activeTab === 'upcoming' ? upcomingTabCount : liveTabCount}</p>
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
            <h3 className="text-lg font-semibold mb-1">No {activeTab === 'upcoming' ? 'upcoming' : 'live'} sessions available</h3>
            <p className="text-muted-foreground">No {activeTab === 'upcoming' ? 'scheduled' : 'live'} sessions found. {activeTab === 'upcoming' ? 'All upcoming sessions will appear here.' : 'Only showing currently live sessions.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions.filter((session: any) => {
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
          }).map((session: any) => (
            <Card 
              key={session._id} 
              className="shadow-sm rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {session.userId?.name || 'N/A'}
                      <Badge 
                        variant="secondary" 
                        className={session.status !== 'live' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : 'bg-green-100 text-green-800 border-green-200'}
                      >
                        {session.status !== 'live' ? 'SCHEDULED' : 'LIVE NOW'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{session.therapistId?.name || 'N/A'}</p>
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

                  <div className="flex gap-2 pt-2">
                    {session.status === 'live' ? (
                      <>
                        <Button 
                          className="flex-1"
                          onClick={() => window.open(`/video-call/${session._id}`, '_blank', 'width=1200,height=800')}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Session
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/video-call/${session._id}`)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="flex-1"
                        variant="secondary"
                        disabled
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Starts in {calculateTimeUntilSession(session.date, session.time)}
                      </Button>
                    )}
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