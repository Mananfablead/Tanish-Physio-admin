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
  const [activeTab, setActiveTab] = useState('live');
    const { list: allSessions = [], loading, error } = useSelector((state: any) => state.sessions);
  
  // Filter to show live sessions based on selected filter
  const liveSessions = allSessions.filter((session: any) => {
    // Always filter to only live sessions since this is the Live Sessions page
    const isLive = session.status === 'live';
    
    // Apply additional filter based on user selection
    if (filterType === 'all') {
      return isLive;
    } else if (filterType === '1-on-1') {
      return isLive && session.type === '1-on-1';
    } else if (filterType === 'group') {
      return isLive && session.type === 'group';
    }
    
    return isLive; // Default to showing all live sessions
  });
  
  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);





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
              <p className="text-2xl font-semibold">{liveSessions.length}</p>
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
              <p className="text-2xl font-semibold">{liveSessions.length}</p>
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

      {/* Live Sessions List */}
      {liveSessions.length === 0 ? (
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No live sessions available</h3>
            <p className="text-muted-foreground">No live sessions found. Only showing currently live sessions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {liveSessions.filter((session: any) => {
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
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        LIVE NOW
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
                    <Button 
                      className="flex-1"
                      onClick={() => window.open(`/video-call/${session.sessionId}`, '_blank', 'width=1200,height=800')}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Live Session
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/video-call/${session.sessionId}`)}
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