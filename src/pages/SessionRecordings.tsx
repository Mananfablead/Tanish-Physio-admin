import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
import { adminVideoCallApi } from "@/lib/videoCallApi";
import { useParams } from 'react-router-dom';

const SessionRecordings = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  // Decode the userId from URL format to display format
  const decodedUserId = userId ? userId.replace(/-/g, " ").toLowerCase() : ""; // Change from null to empty string
  const [selectedUser, setSelectedUser] = useState<string>(
    decodedUserId || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allRecordings, setAllRecordings] = useState<any[]>([]);

  // Fetch recordings from API
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const response = await adminVideoCallApi.getAllRecordings();
        const recordingsData = response.recordings || [];

        // Transform the data to match the component's expected format
 const transformedRecordings = recordingsData.map((recording: any) => ({
  id: recording._id,

  user:
    recording.participants?.find((p: any) => p.role === "patient")
      ?.userId?.name ||
    recording.participants?.find(
      (p: any) => p.userId?.role === "patient"
    )?.userId?.name ||
    "Unknown User",

  therapist:
    recording.participants?.find(
      (p: any) => p.role === "therapist" || p.role === "admin"
    )?.userId?.name ||
    recording.participants?.find(
      (p: any) =>
        p.userId?.role === "therapist" || p.userId?.role === "admin"
    )?.userId?.name ||
    "Unknown Therapist",

  date: recording.sessionId?.date
    ? new Date(recording.sessionId.date).toLocaleDateString()
    : recording.callStartedAt
    ? new Date(recording.callStartedAt).toLocaleDateString()
    : "Unknown Date",

  time:
    recording.sessionId?.time ||
    (recording.callStartedAt
      ? new Date(recording.callStartedAt).toLocaleTimeString()
      : "Unknown Time"),

  /* ✅ IMPORTANT: RAW seconds (NUMBER only) */
  recordingDuration:
    typeof recording.recordingDuration === "number"
      ? recording.recordingDuration
      : typeof recording.duration === "number"
      ? recording.duration
      : 0,

  type: recording.type === "one-on-one" ? "1-on-1" : "Group",

  recordingUrl: recording.recordingUrl || "#",

  thumbnail: `https://picsum.photos/seed/${recording._id}/400/225`,

  status: recording.recordingStatus || "available",

  fileSize: recording.recordingSize
    ? `${(recording.recordingSize / (1024 * 1024)).toFixed(1)} MB`
    : "Unknown",

  format: recording.recordingFormat?.toUpperCase() || "WEBM",

  quality: "HD",

  originalData: recording,
}));


        setAllRecordings(transformedRecordings);
        setRecordings(transformedRecordings);
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setError("Failed to load recordings");
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  // Filter recordings based on selected user and search query
  useEffect(() => {
    let filtered = allRecordings;

    // If userId is provided in the URL, filter by that user
    if (userId) {
      const decodedUserId = userId.replace(/-/g, " ").toLowerCase();
      filtered = filtered.filter(
        (rec) => rec.user.toLowerCase() === decodedUserId
      );
    } else if (selectedUser !== "all") {
      filtered = filtered.filter((rec) => rec.user === selectedUser);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (rec) =>
          rec.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.therapist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      if (filterType === "1-on-1") {
        filtered = filtered.filter((rec) => rec.type === "1-on-1");
      } else if (filterType === "group") {
        filtered = filtered.filter((rec) => rec.type.includes("Group"));
      }
    }

    setRecordings(filtered);
  }, [selectedUser, searchQuery, filterType, userId]);

  // Extract unique users for the filter
  const uniqueUsers = Array.from(new Set(allRecordings.map((rec) => rec.user)));

  const handlePlayPause = (recording: any) => {
    if (selectedRecording?.id === recording.id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedRecording(recording);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  // Close modal when pressing escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedRecording) {
        setSelectedRecording(null);
        setIsPlaying(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [selectedRecording]);

  // Simulate progress for the player
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedRecording) {
      interval = setInterval(() => {
        setProgress((prev) => {
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
  const formatDuration = (duration: any) => {
    const totalSeconds = Math.floor(Number(duration));

    if (Number.isNaN(totalSeconds) || totalSeconds < 0) {
      return "00:00";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Session Recordings
            </h1>
            <p className="text-muted-foreground mt-1">Loading recordings...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Session Recordings
            </h1>
            <p className="text-muted-foreground mt-1">
              Error loading recordings
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-destructive">
            <FileVideo className="h-12 w-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {userId
              ? `${decodedUserId}'s Session Recordings`
              : "Session Recordings"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userId
              ? `View and manage all recorded therapy sessions for ${decodedUserId}`
              : "View and manage all recorded therapy sessions"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Filter by User
          </label>
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
                <SelectItem key={index} value={user}>
                  {user}
                </SelectItem>
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
              <p className="text-2xl font-semibold">
                {recordings.filter((r) => r.status === "available").length}
              </p>
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
            <p className="text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
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
                  {formatDuration(recording.recordingDuration ?? recording.duration)}
                </div>



              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">
                    {recording.user}
                  </CardTitle>
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
                      onClick={() =>
                        window.open(recording.recordingUrl, "_blank")
                      }
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
        <div
          className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRecording(null);
              setIsPlaying(false);
            }
          }}
        >
          <div className="bg-card rounded-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedRecording.user} - Session Recording
              </h3>
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
            <div className="overflow-y-auto flex-1">
              <div className="p-6">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                  <video
                    src={selectedRecording.originalData.recordingUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                    ref={(el) => {
                      if (el) {
                        el.onplay = () => setIsPlaying(true);
                        el.onpause = () => setIsPlaying(false);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRecordings;