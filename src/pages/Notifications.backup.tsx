import {
  Bell,
  Calendar,
  CreditCard,
  Megaphone,
  Trash2,
  X,
  CheckCircle,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  BarChart3,
  Send,
  Eye,
  EyeOff,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import {
  fetchNotifications,
  removeNotification,
  clearAllNotifications,
  markNotificationAsRead,
  sendNotification,
  deleteNotification,
  deleteAllNotifications,
} from "@/features/notifications/notificationSlice";
import { userAPI } from "@/api/apiClient";

const notificationTypes = [
  { value: "session", label: "Session", icon: Calendar },
  { value: "payment", label: "Payment", icon: CreditCard },
  { value: "booking", label: "Booking", icon: Bell },
  { value: "system", label: "System", icon: Megaphone },
  { value: "connection_failure", label: "Connection Failure", icon: Bell },
];

const recipientTypes = [
  { value: "all", label: "All Users" },
  { value: "users", label: "Users Only" },
  { value: "therapists", label: "Therapists Only" },
  { value: "specific", label: "Specific User" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "session":
      return <Calendar className="w-4 h-4" />;
    case "payment":
      return <CreditCard className="w-4 h-4" />;
    case "booking":
      return <Bell className="w-4 h-4" />;
    case "system":
      return <Megaphone className="w-4 h-4" />;
    case "connection_failure":
      return <Bell className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "session":
      return "bg-blue/15 text-blue";
    case "payment":
      return "bg-green/15 text-green";
    case "booking":
      return "bg-purple/15 text-purple";
    case "system":
      return "bg-orange/15 text-orange";
    case "connection_failure":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRecipientBadge = (recipient: string) => {
  switch (recipient) {
    case "all":
      return "bg-primary/15 text-primary";
    case "users":
      return "bg-blue/15 text-blue";
    case "therapists":
      return "bg-purple/15 text-purple";
    case "specific":
      return "bg-yellow/15 text-yellow";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Notifications() {
  const dispatch: any = useDispatch();
  const {
    list: storedNotifications,
    loading,
    error,
  } = useSelector((state: any) => state.notifications);
  
  // Combine stored notifications with real-time notifications
  const [realTimeNotifications, setRealTimeNotifications] = useState([]);
  const [token] = useSelector((state: any) => [state.auth.token]);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
    useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    number | null
  >(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form states for sending notification
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system",
    recipientType: "all",
    userId: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Setup real-time notifications
  useEffect(() => {
    if (!token) return;

    // Connect to notification socket
    const socket = io('http://localhost:5001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to admin notification socket for Notifications page');
      socket.emit('join-admin-notifications', {});
    });

    socket.on('admin-notification', (data) => {
      console.log('Notifications page received:', data);
      
      const newNotification = {
        _id: `rt_${Date.now()}`,
        title: data.title || "New Notification",
        message: data.message || "You have a new notification",
        type: data.type || "system",
        userId: null,
        read: false,
        createdAt: data.timestamp || new Date().toISOString(),
        updatedAt: data.timestamp || new Date().toISOString()
      };

      setRealTimeNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Combine stored and real-time notifications
  const allNotifications = [...realTimeNotifications, ...storedNotifications];

  // Fetch users when specific user is selected
  useEffect(() => {
    if (newNotification.recipientType === "specific") {
      fetchUsers();
    }
  }, [newNotification.recipientType]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userAPI.getAll({ limit: 100 });
      const usersData =
        response.data.data?.users || response.data.data || response.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filtered notifications
  const filteredNotifications = allNotifications.filter((notification: any) => {
    // Safely handle undefined properties
    const title = notification.title || "";
    const message = notification.message || "";
    const type = notification.type || "";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || type === filterType;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notification.read) ||
      (filterStatus === "read" && notification.read);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistics
  const stats = {
    total: allNotifications.length,
    unread: allNotifications.filter((n: any) => !n.read).length,
    read: allNotifications.filter((n: any) => n.read).length,
    byType: notificationTypes.map((type) => ({
      type: type.value,
      count: allNotifications.filter((n: any) => n.type === type.value).length,
      label: type.label,
    })),
  };
  };

  const handleSendNotification = async () => {
    // Validate required fields
    if (!newNotification.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!newNotification.message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (
      newNotification.recipientType === "specific" &&
      !newNotification.userId
    ) {
      alert("Please select a user for specific recipient");
      return;
    }

    setIsSending(true);
    try {
      const notificationData: any = {
        title: newNotification.title.trim(),
        message: newNotification.message.trim(),
        type: newNotification.type,
      };

      // Add userId only if specific recipient is selected
      if (
        newNotification.recipientType === "specific" &&
        newNotification.userId.trim()
      ) {
        notificationData.userId = newNotification.userId.trim();
      }

      await dispatch(sendNotification(notificationData)).unwrap();

      // Reset form
      setNewNotification({
        title: "",
        message: "",
        type: "system",
        recipientType: "all",
        userId: "",
      });
      setShowSendModal(false);
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = (id: string) => {
    dispatch(deleteNotification(id));
    setNotificationToDelete(null);
  };

  const handleDeleteAllNotifications = () => {
    dispatch(deleteAllNotifications());
    setShowDeleteAllConfirmation(false);
  };

  const deleteAllNotifications = () => {
    dispatch(clearAllNotifications());
    setShowDeleteAllConfirmation(false);
  };

  const confirmDeleteNotification = (id: number) => {
    setNotificationToDelete(id);
  };

  const cancelDeleteNotification = () => {
    setNotificationToDelete(null);
  };

  const restoreNotifications = () => {
    dispatch(fetchNotifications());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          View and manage all system notifications
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.unread}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.read}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.total > 0
                ? Math.round((stats.read / stats.total) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Send Notification
          </Button>

          {filteredNotifications.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteAllConfirmation(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList>
          <TabsTrigger value="all">
            All Notifications ({filteredNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Type</th>
                    <th>Recipient</th>
                    <th>Sent At</th>
                    <th>Status</th>
                    <th className="w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification: any) => (
                      <tr key={notification._id || notification.id}>
                        <td className="font-medium">{notification.title}</td>
                        <td className="text-muted-foreground max-w-xs truncate">
                          {notification.message}
                        </td>
                        <td>
                          <Badge
                            className={cn(
                              "capitalize",
                              getTypeBadge(notification.type)
                            )}
                          >
                            {notification.type}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant="outline" className="capitalize">
                            {notification.userId
                              ? "Specific User"
                              : "All Users"}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge
                            variant={
                              notification.read ? "secondary" : "default"
                            }
                            className={cn(
                              "capitalize",
                              !notification.read && "bg-blue-100 text-blue-800"
                            )}
                          >
                            {notification.read ? "Read" : "Unread"}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                dispatch(
                                  markNotificationAsRead(
                                    notification._id || notification.id
                                  )
                                )
                              }
                              disabled={notification.read}
                            >
                              {notification.read ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                              onClick={() =>
                                confirmDeleteNotification(
                                  notification._id || notification.id
                                )
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No notifications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Type</th>
                    <th>Recipient</th>
                    <th>Sent At</th>
                    <th className="w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.filter((n: any) => !n.read).length >
                  0 ? (
                    filteredNotifications
                      .filter((n: any) => !n.read)
                      .map((notification: any) => (
                        <tr key={notification._id || notification.id}>
                          <td className="font-medium">{notification.title}</td>
                          <td className="text-muted-foreground max-w-xs truncate">
                            {notification.message}
                          </td>
                          <td>
                            <Badge
                              className={cn(
                                "capitalize",
                                getTypeBadge(notification.type)
                              )}
                            >
                              {notification.type}
                            </Badge>
                          </td>
                          <td>
                            <Badge variant="outline" className="capitalize">
                              {notification.userId
                                ? "Specific User"
                                : "All Users"}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  dispatch(
                                    markNotificationAsRead(
                                      notification._id || notification.id
                                    )
                                  )
                                }
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                                onClick={() =>
                                  confirmDeleteNotification(
                                    notification._id || notification.id
                                  )
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No unread notifications
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="by-type" className="mt-4">
          <div className="space-y-6">
            {stats.byType.map((typeStat) => {
              const typeNotifications = filteredNotifications.filter(
                (n: any) => n.type === typeStat.type
              );
              const typeInfo = notificationTypes.find(
                (t) => t.value === typeStat.type
              );
              if (!typeInfo) return null;

              return (
                <div key={typeStat.type}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <typeInfo.icon className="w-5 h-5 text-primary" />
                    {typeStat.label}
                    <span className="text-sm text-muted-foreground">
                      ({typeStat.count})
                    </span>
                  </h3>
                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Recipient</th>
                            <th>Sent At</th>
                            <th>Status</th>
                            <th className="w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {typeNotifications.length > 0 ? (
                            typeNotifications.map((notification: any) => (
                              <tr key={notification._id || notification.id}>
                                <td className="font-medium">
                                  {notification.title}
                                </td>
                                <td className="text-muted-foreground max-w-xs truncate">
                                  {notification.message}
                                </td>
                                <td>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {notification.userId
                                      ? "Specific User"
                                      : "All Users"}
                                  </Badge>
                                </td>
                                <td className="text-muted-foreground">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleDateString()}
                                </td>
                                <td>
                                  <Badge
                                    variant={
                                      notification.read
                                        ? "secondary"
                                        : "default"
                                    }
                                    className={cn(
                                      "capitalize",
                                      !notification.read &&
                                        "bg-blue-100 text-blue-800"
                                    )}
                                  >
                                    {notification.read ? "Read" : "Unread"}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        dispatch(
                                          markNotificationAsRead(
                                            notification._id || notification.id
                                          )
                                        )
                                      }
                                      disabled={notification.read}
                                    >
                                      {notification.read ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                                      onClick={() =>
                                        confirmDeleteNotification(
                                          notification._id || notification.id
                                        )
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No {typeStat.label.toLowerCase()} notifications
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Notifications by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byType.map((typeStat) => {
                    const percentage =
                      stats.total > 0
                        ? (typeStat.count / stats.total) * 100
                        : 0;
                    const typeInfo = notificationTypes.find(
                      (t) => t.value === typeStat.type
                    );
                    return (
                      <div key={typeStat.type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {typeStat.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {typeStat.count}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allNotifications.slice(0, 5).map((notification: any) => (
                    <div
                      key={notification._id || notification.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={notification.read ? "secondary" : "default"}
                        className="mt-1"
                      >
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Send New Notification</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSendModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Title *
                </label>
                <Input
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Message *
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter notification message"
                  className="w-full h-24 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Type *</label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, type: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Recipient *
                </label>
                <Select
                  value={newNotification.recipientType}
                  onValueChange={(value) =>
                    setNewNotification({
                      ...newNotification,
                      recipientType: value,
                      userId:
                        value === "specific" ? newNotification.userId : "",
                    })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newNotification.recipientType === "specific" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Select User *
                  </label>
                  <Select
                    value={newNotification.userId}
                    onValueChange={(value) =>
                      setNewNotification({
                        ...newNotification,
                        userId: value,
                      })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : (
                        users.map((user: any) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSendModal(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Dialog */}
      {showDeleteAllConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-semibold text-lg mb-2">
              Delete All Notifications?
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete all notifications? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAllConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllNotifications}
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Notification Confirmation Dialog */}
      {notificationToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-semibold text-lg mb-2">Delete Notification?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={cancelDeleteNotification}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  handleDeleteNotification(String(notificationToDelete))
                }
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-card rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">
              Loading notifications...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
