import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  UserCog, 
  Video, 
  FileVideo, 
  Filter,
  Search
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
import { Progress } from '@/components/ui/progress';
import { mockSessions } from '@/lib/session-data';
import { useParams } from 'react-router-dom';

const SessionRecordings = () => {
  const { userId } = useParams<{ userId: string }>();
  // Decode the userId from URL format to display format
  const decodedUserId = userId ? userId.replace(/-/g, ' ').toLowerCase() : null;
  const [selectedUser, setSelectedUser] = useState<string>(decodedUserId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock recording data based on completed sessions
  const allRecordings = mockSessions.completed.map((session: any) => ({
    id: session.id,
    user: session.user,
    therapist: session.therapist,
    date: session.date,
    time: session.time,
    duration: session.duration,
    type: session.type,
    recordingUrl: `https://example.com/recording/${session.id}`,
    thumbnail: `https://picsum.photos/seed/${session.id}/400/225`,
    status: 'available',
    fileSize: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
    format: 'MP4',
    quality: 'HD'
  }));

  const [recordings, setRecordings] = useState(allRecordings);

  // Filter recordings based on selected user and search query
  useEffect(() => {
    let filtered = allRecordings;
    
    // If userId is provided in the URL, filter by that user
    if (userId) {
      const decodedUserId = userId.replace(/-/g, ' ').toLowerCase();
      filtered = filtered.filter(rec => rec.user.toLowerCase() === decodedUserId);
    } else if (selectedUser !== 'all') {
      filtered = filtered.filter(rec => rec.user === selectedUser);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(rec => 
        rec.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.therapist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      if (filterType === '1-on-1') {
        filtered = filtered.filter(rec => rec.type === '1-on-1');
      } else if (filterType === 'group') {
        filtered = filtered.filter(rec => rec.type.includes('Group'));
      }
    }
    
    setRecordings(filtered);
  }, [selectedUser, searchQuery, filterType, userId]);

  // Extract unique users for the filter
  const uniqueUsers = Array.from(new Set(allRecordings.map(rec => rec.user)));

  const handlePlayPause = (recording: any) => {
    if (selectedRecording?.id === recording.id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedRecording(recording);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  // Simulate progress for the player
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedRecording) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedRecording]);

  const formatDuration = (duration: string) => {
    // Convert duration string like "45 min" to a number of seconds for display
    const minutes = parseInt(duration.split(' ')[0]);
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {userId ? `${decodedUserId}'s Session Recordings` : 'Session Recordings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userId 
              ? `View and manage all recorded therapy sessions for ${decodedUserId}`
              : 'View and manage all recorded therapy sessions'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Filter by User</label>
          <Select 
            value={selectedUser} 
            onValueChange={setSelectedUser}
            disabled={!!userId} // Disable when viewing a specific user's recordings
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map((user, index) => (
                <SelectItem key={index} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Session Type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileVideo className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{recordings.length}</p>
              <p className="text-sm text-muted-foreground">Total Recordings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success/10">
              <Video className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{recordings.filter(r => r.status === 'available').length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-info/10">
              <User className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{uniqueUsers.length}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recordings Grid */}
      {recordings.length === 0 ? (
        <Card className="shadow-sm rounded-xl border border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileVideo className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No recordings found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording) => (
            <Card 
              key={recording.id} 
              className="shadow-sm rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img 
                  src={recording.thumbnail} 
                  alt={`Recording ${recording.id}`} 
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-12 w-12 rounded-full"
                    onClick={() => handlePlayPause(recording)}
                  >
                    {selectedRecording?.id === recording.id && isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(recording.duration)}
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{recording.user}</CardTitle>
                  <Badge variant="secondary">{recording.type}</Badge>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCog className="w-4 h-4" />
                    <span>{recording.therapist}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{recording.date}</span>
                    <Clock className="w-4 h-4 ml-3" />
                    <span>{recording.time}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quality:</span>
                    <span className="font-medium">{recording.quality}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{recording.fileSize}</span>
                  </div>

                  {selectedRecording?.id === recording.id && isPlaying && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Playing...</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(recording.recordingUrl, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // In a real app, this would download the recording
                        alert(`Downloading recording ${recording.id}`);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Player Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedRecording.user} - Session Recording</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedRecording(null);
                  setIsPlaying(false);
                }}
              >
                Close
              </Button>
            </div>
            <div className="p-6">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <img 
                  src={selectedRecording.thumbnail} 
                  alt="Recording thumbnail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-16 w-16 rounded-full bg-white/90 hover:bg-white"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-sm mb-1">
                    <span>Session Recording</span>
                    <span>{formatDuration(selectedRecording.duration)}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Session Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User:</span>
                      <span>{selectedRecording.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Therapist:</span>
                      <span>{selectedRecording.therapist}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{selectedRecording.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{selectedRecording.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(selectedRecording.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recording Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality:</span>
                      <span>{selectedRecording.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span>{selectedRecording.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span>{selectedRecording.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedRecording.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-success">Available</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // In a real app, this would play the recording
                    alert(`Playing recording ${selectedRecording.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Full Recording
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would download the recording
                    alert(`Downloading recording ${selectedRecording.id}`);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRecordings;