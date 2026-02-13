import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Reply,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { contactMessageAPI } from "@/api/apiClient";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
  repliedAt?: string;
  replyMessage?: string;
}

interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  recent: number;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    recent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch contact messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactMessageAPI.getAll();
      const data = response.data;

      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error: any) {
      console.error("Failed to fetch messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await contactMessageAPI.getStats();
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Send reply
  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;

    try {
      setSendingReply(true);
      const response = await contactMessageAPI.update(selectedMessage._id, {
        replyMessage: replyMessage.trim(),
      });

      const data = response.data;

      if (data.success) {
        toast.success("Reply sent successfully");
        setReplyMessage("");
        setSelectedMessage(null);
        fetchMessages();
        fetchStats();
      } else {
        toast.error(data.message || "Failed to send reply");
      }
    } catch (error: any) {
      console.error("Failed to send reply:", error);
      toast.error(error.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await contactMessageAPI.delete(id);
      const data = response.data;

      if (data.success) {
        toast.success("Message deleted successfully");
        fetchMessages();
        fetchStats();
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
      } else {
        toast.error(data.message || "Failed to delete message");
      }
    } catch (error: any) {
      console.error("Failed to delete message:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const response = await contactMessageAPI.update(id, { status: "read" });

      if (response.data.success) {
        fetchMessages();
        fetchStats();
      }
    } catch (error: any) {
      console.error("Failed to mark as read:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive">Unread</Badge>;
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "replied":
        return <Badge variant="default">Replied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">
            Manage messages from your website visitors
          </p>
        </div>
        <Button
          onClick={() => {
            fetchMessages();
            fetchStats();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold">{stats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Reply className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold">{stats.replied}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Last 7 Days</p>
                <p className="text-2xl font-bold">{stats.recent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={statusFilter === "unread" ? "default" : "outline"}
                onClick={() => setStatusFilter("unread")}
                size="sm"
              >
                Unread
              </Button>
              <Button
                variant={statusFilter === "read" ? "default" : "outline"}
                onClick={() => setStatusFilter("read")}
                size="sm"
              >
                Read
              </Button>
              <Button
                variant={statusFilter === "replied" ? "default" : "outline"}
                onClick={() => setStatusFilter("replied")}
                size="sm"
              >
                Replied
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Messages ({filteredMessages.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMessage?._id === message._id ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === "unread") {
                          markAsRead(message._id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {message.name}
                            </h3>
                            {getStatusBadge(message.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(message.createdAt),
                              "MMM d, yyyy h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Message Details</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMessage(selectedMessage._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sender Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name</span>
                    </div>
                    <p>{selectedMessage.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p>{selectedMessage.email}</p>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone</span>
                      </div>
                      <p>{selectedMessage.phone}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Received</span>
                    </div>
                    <p>
                      {format(
                        new Date(selectedMessage.createdAt),
                        "MMMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <h3 className="font-medium mb-2">Subject</h3>
                  <p className="text-lg">{selectedMessage.subject}</p>
                </div>

                {/* Message */}
                <div>
                  <h3 className="font-medium mb-2">Message</h3>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply Section */}
                {selectedMessage.status !== "replied" && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-3">Reply</h3>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write your reply here..."
                      className="w-full min-h-[120px] p-3 border rounded-lg resize-vertical"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={sendReply}
                        disabled={sendingReply || !replyMessage.trim()}
                      >
                        {sendingReply ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Reply className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Previous Reply */}
                {selectedMessage.replyMessage && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-3">Your Reply</h3>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {selectedMessage.replyMessage}
                      </p>
                      {selectedMessage.repliedAt && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Sent on{" "}
                          {format(
                            new Date(selectedMessage.repliedAt),
                            "MMMM d, yyyy h:mm a"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
