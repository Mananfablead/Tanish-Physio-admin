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
import { mockSessions } from '@/lib/session-data';

const LiveSessions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('live');
  const [sessions, setSessions] = useState<any[]>([]);

  // Mock live sessions data - combining live sessions and upcoming sessions within 24 hours
  const allLiveSessions = [
    // Current live sessions
    ...mockSessions.live.map((session: any) => ({
      ...session,
      sessionType: 'live'
    })),
    // Upcoming sessions within 24 hours
    ...mockSessions.upcoming
      .filter((session: any) => {
        // Calculate if the session is within 24 hours
        const sessionDateTime = new Date(`${session.date} ${session.time}`);
        const now = new Date();
        const timeDiff = sessionDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff <= 24 && hoursDiff >= 0;
      })
      .map((session: any) => ({
        ...session,
        sessionType: 'upcoming-soon'
      }))
  ];

  // Filter sessions based on search query and type
  useEffect(() => {
    let filtered = allLiveSessions;
    
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.therapist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      if (filterType === 'live') {
        filtered = filtered.filter(session => session.sessionType === 'live');
      } else if (filterType === 'upcoming') {
        filtered = filtered.filter(session => session.sessionType === 'upcoming-soon');
      } else if (filterType === '1-on-1') {
        filtered = filtered.filter(session => session.type === '1-on-1');
      } else if (filterType === 'group') {
        filtered = filtered.filter(session => session.type.includes('Group'));
      }
    }
    
    setSessions(filtered);
  }, [searchQuery, filterType]);

  const handleJoinSession = (session: any) => {
    // Open the video call page in a new tab
    const sessionId = session.joinLink.split('/').pop() || session.id.toString();
    window.open(`/video-call/${sessionId}`, '_blank', 'width=1200,height=800');
  };

  const handleCopyLink = (joinLink: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${joinLink}`);
    // In a real app, you would show a toast notification here
  };

  const formatTimeLeft = (date: string, time: string) => {
    const sessionDateTime = new Date(`${date} ${time}`);
    const now = new Date();
    const timeDiff = sessionDateTime.getTime() - now.getTime();
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursDiff > 0) {
      return `${hoursDiff}h ${minutesDiff}m remaining`;
    } else if (minutesDiff > 0) {
      return `${minutesDiff}m remaining`;
    } else {
      return 'Starting now';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Sessions</h1>
          <p className="text-muted-foreground mt-1">
            View and join live sessions or sessions starting within 24 hours
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <Video className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{mockSessions.live.length}</p>
              <p className="text-sm text-muted-foreground">Currently Live</p>
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
                {mockSessions.upcoming.filter((session: any) => {
                  const sessionDateTime = new Date(`${session.date} ${session.time}`);
                  const now = new Date();
                  const timeDiff = sessionDateTime.getTime() - now.getTime();
                  const hoursDiff = timeDiff / (1000 * 60 * 60);
                  return hoursDiff <= 24 && hoursDiff >= 0;
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
              <p className="text-2xl font-semibold">{sessions.length}</p>
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
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="live">Live Only</SelectItem>
              <SelectItem value="upcoming">Upcoming (24h)</SelectItem>
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
      {sessions.length === 0 ? (
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No sessions available to join</h3>
            <p className="text-muted-foreground">No live sessions or sessions starting within 24 hours found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Card 
              key={session.id} 
              className="shadow-sm rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {session.user}
                      <Badge 
                        variant="secondary" 
                        className={
                          session.sessionType === 'live' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }
                      >
                        {session.sessionType === 'live' ? 'LIVE NOW' : 'STARTING SOON'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{session.therapist}</p>
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

                  {session.sessionType === 'upcoming-soon' && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        {formatTimeLeft(session.date, session.time)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleJoinSession(session)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {session.sessionType === 'live' ? 'Join Live Session' : 'Join Session'}
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyLink(session.joinLink)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
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