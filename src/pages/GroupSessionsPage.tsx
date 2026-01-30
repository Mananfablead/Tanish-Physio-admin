import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Play,
  Square,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Video,
  MicOff,
  PhoneOff,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import { useToast } from "@/hooks/use-toast";

interface GroupSession {
  _id: string;
  title: string;
  description: string;
  therapistId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: Array<{
    userId: string;
    status: string;
    joinedAt: string;
  }>;
  status: string;
  isActiveCall: boolean;
  callStartedAt: string | null;
  currentParticipants: Array<{
    userId: string;
    isMuted: boolean;
    isVideoOff: boolean;
    joinedAt: string;
  }>;
}

export default function GroupSessionsPage() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchGroupSessions();
  }, []);

  const fetchGroupSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/group-sessions");
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching group sessions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch group sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startGroupCall = async (sessionId: string) => {
    try {
      const response = await apiClient.post(
        `/group-sessions/${sessionId}/start-call`
      );
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Group call started successfully",
        });
        fetchGroupSessions(); // Refresh the list
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to start group call",
        variant: "destructive",
      });
    }
  };

  const endGroupCall = async (sessionId: string) => {
    try {
      const response = await apiClient.post(
        `/group-sessions/${sessionId}/end-call`
      );
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Group call ended successfully",
        });
        fetchGroupSessions(); // Refresh the list
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to end group call",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, isActiveCall: boolean) => {
    if (isActiveCall) {
      return <Badge className="bg-green-500">Live</Badge>;
    }

    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Unknown</Badge>;
    }
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.therapistId.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.therapistId.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Sessions</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor group therapy sessions
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Group Session
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search group sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <Card
            key={session._id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {session.title}
              </h3>
              {getStatusBadge(session.status, session.isActiveCall)}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {session.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  {session.therapistId.firstName} {session.therapistId.lastName}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(session.startTime).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(session.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {session.currentParticipants?.length || 0} /{" "}
                  {session.maxParticipants} participants
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!session.isActiveCall ? (
                <Button
                  onClick={() => startGroupCall(session._id)}
                  className="flex-1 flex items-center gap-2"
                  disabled={
                    session.status !== "scheduled" &&
                    session.status !== "active"
                  }
                >
                  <Play className="h-4 w-4" />
                  Start Call
                </Button>
              ) : (
                <Button
                  onClick={() => endGroupCall(session._id)}
                  variant="destructive"
                  className="flex-1 flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  End Call
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedSession(session)}
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>

            {/* Participant Status Indicators */}
            {session.isActiveCall && session.currentParticipants && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Participants
                  </span>
                  <Badge variant="secondary">
                    {session.currentParticipants.length} active
                  </Badge>
                </div>

                <div className="space-y-2">
                  {session.currentParticipants
                    .slice(0, 3)
                    .map((participant) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          Participant
                        </span>
                        <div className="flex gap-1">
                          {participant.isMuted && (
                            <MicOff className="h-3 w-3 text-red-500" />
                          )}
                          {participant.isVideoOff && (
                            <Video className="h-3 w-3 text-red-500" />
                          )}
                          {!participant.isMuted && !participant.isVideoOff && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  {session.currentParticipants.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{session.currentParticipants.length - 3} more
                      participants
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No group sessions found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first group session to get started"}
          </p>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSession.title}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSession(null)}
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{selectedSession.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Therapist
                    </h3>
                    <p className="text-gray-600">
                      {selectedSession.therapistId.firstName}{" "}
                      {selectedSession.therapistId.lastName}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                    <p className="text-gray-600">
                      {getStatusBadge(
                        selectedSession.status,
                        selectedSession.isActiveCall
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Participants
                  </h3>
                  <div className="space-y-2">
                    {selectedSession.participants?.map((participant: any) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-gray-700">Participant</span>
                        <Badge
                          variant={
                            participant.status === "accepted"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {participant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
