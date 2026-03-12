import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Video,
  Info,
  Users,
  AlertCircle,
  Mail,
  Smartphone,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  recipientType: string;
  userId?: string;
  adminId?: string;
  sessionId?: string;
  bookingId?: string;
  priority: string;
  read: boolean;
  channels: {
    email?: boolean;
    whatsapp?: boolean;
    inApp?: boolean;
  };
  createdAt: string;
}

export default function AdminNotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [filter, setFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system",
    recipientType: "all",
    priority: "medium",
    channels: {
      email: false,
      whatsapp: false,
      inApp: true,
    },
  });

  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (window.location.hostname === "localhost") {
      return "http://localhost:5000/api";
    }
    return "https://apitanishvideo.fableadtech.in/api";
  };

  const API_BASE_URL = getApiBaseUrl();
  const token = localStorage.getItem("token");

  // Debug log on component mount
  useEffect(() => {
    console.log("AdminNotificationPanel mounted");
    console.log("API Base URL:", API_BASE_URL);
    console.log("Token present:", !!token);
    console.log(
      "Token value (first 20 chars):",
      token ? token.substring(0, 20) : "N/A"
    );
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      if (!token) {
        console.error("No authentication token found");
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      // Build query params
      const queryParams: string[] = [
        `page=${pagination.page.toString()}`,
        `limit=${pagination.limit.toString()}`,
      ];

      if (filter !== "all") {
        queryParams.push(
          `unreadOnly=${filter === "unread" ? "true" : "false"}`
        );
      }

      console.log(
        "📡 Fetching notifications from:",
        `${API_BASE_URL}/notifications?${queryParams.join("&")}`
      );

      // Admin sees ALL notifications (both admin and client notifications)
      const res = await axios.get(
        `${API_BASE_URL}/notifications?${queryParams.join("&")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ API Response Status:", res.status);
      console.log(
        "📦 Response data structure:",
        JSON.stringify(res.data, null, 2)
      );
      console.log(
        "📋 Notifications count:",
        res.data.data?.notifications?.length || 0
      );
      console.log("📊 Pagination:", res.data.data?.pagination);

      const data = res.data.data;

      if (!data?.notifications) {
        console.warn("⚠️ No notifications in response data");
        setNotifications([]);
      } else {
        console.log("✨ Setting notifications:", data.notifications.length);
        setNotifications(data.notifications);
      }

      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch notifications:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);

      let errorMessage = "Failed to fetch notifications";

      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "🔍 useEffect triggered - pagination.page:",
      pagination.page,
      "filter:",
      filter
    );
    fetchNotifications();
  }, [pagination.page, filter]);

  // Force fetch on initial mount
  useEffect(() => {
    console.log("🚀 Component mounted, fetching notifications...");
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send notification
  const handleSendNotification = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/notifications`,
        {
          ...formData,
          channels: formData.channels,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });

      setIsSendDialogOpen(false);
      setFormData({
        title: "",
        message: "",
        type: "system",
        recipientType: "all",
        priority: "medium",
        channels: {
          email: false,
          whatsapp: false,
          inApp: true,
        },
      });
      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Notification marked as read",
      });

      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark as read",
        variant: "destructive",
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });

      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/notifications/${selectedNotification._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-4 h-4" />;
      case "session":
        return <Video className="w-4 h-4" />;
      case "connection_failure":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Notifications</h1>
          <p className="text-muted-foreground">
            Manage and monitor all system notifications
          </p>
        </div>
        <Button onClick={() => setIsSendDialogOpen(true)}>
          <Bell className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unread</p>
              <p className="text-2xl font-bold">
                {notifications.filter((n) => !n.read).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">This Page</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleMarkAllAsRead}>
          <Check className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading notifications...
                </TableCell>
              </TableRow>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <span className="capitalize">{notification.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {notification.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {notification.message}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {notification.recipientType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {notification.channels.email && (
                        <Mail className="w-4 h-4" />
                      )}
                      {notification.channels.whatsapp && (
                        <Smartphone className="w-4 h-4" />
                      )}
                      {notification.channels.inApp && (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notification.read ? (
                      <Badge variant="secondary">Read</Badge>
                    ) : (
                      <Badge variant="default">Unread</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(notification.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedNotification(notification);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No notifications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Create and send a notification to users or admins
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter notification title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Enter notification message"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipients</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recipientType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Clients Only</SelectItem>
                    <SelectItem value="therapists">Therapists Only</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delivery Channels</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={formData.channels.email}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        channels: { ...formData.channels, email: checked },
                      })
                    }
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="whatsapp"
                    checked={formData.channels.whatsapp}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        channels: { ...formData.channels, whatsapp: checked },
                      })
                    }
                  />
                  <label htmlFor="whatsapp">WhatsApp</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inapp"
                    checked={formData.channels.inApp}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        channels: { ...formData.channels, inApp: checked },
                      })
                    }
                  />
                  <label htmlFor="inapp">In-App</label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSendDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotification}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
