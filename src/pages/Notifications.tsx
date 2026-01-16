import { Bell, Calendar, CreditCard, Megaphone, Trash2, X, CheckCircle, Users, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNotifications, removeNotification, clearAllNotifications, markNotificationAsRead } from "@/features/notifications/notificationSlice";

const notificationTypes = [
  { value: "reminder", label: "Session Reminder", icon: Calendar },
  { value: "subscription", label: "Subscription Alert", icon: CreditCard },
  { value: "announcement", label: "Platform Announcement", icon: Megaphone },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "reminder":
      return Calendar;
    case "subscription":
      return CreditCard;
    case "announcement":
      return Megaphone;
    default:
      return Bell;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "reminder":
      return "bg-info/15 text-info";
    case "subscription":
      return "bg-warning/15 text-warning";
    case "announcement":
      return "bg-primary/15 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Notifications() {
  const dispatch: any = useDispatch();
  const { list: notifications, loading, error } = useSelector((state: any) => state.notifications);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const deleteNotification = (id: number) => {
    dispatch(removeNotification(id));
    setNotificationToDelete(null);
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
        <p className="page-subtitle">View and manage all system notifications</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          {notifications.length > 0 && (
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
          {notifications.length === 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={restoreNotifications}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
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
                    <th>Recipients</th>
                    <th>Sent</th>
                    <th>Status</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <tr key={notification.id}>
                        <td className="font-medium">{notification.title}</td>
                        <td className="text-muted-foreground max-w-xs truncate">{notification.message}</td>
                        <td>
                          <span className={cn("status-badge capitalize", getTypeBadge(notification.type))}>
                            {notification.type}
                          </span>
                        </td>
                        <td className="text-muted-foreground">{notification.recipient}</td>
                        <td className="text-muted-foreground">{notification.sent}</td>
                        <td>
                          <span className="status-badge status-active capitalize">{notification.status}</span>
                        </td>
                        <td>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                            onClick={() => confirmDeleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
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
                    <th>Recipients</th>
                    <th>Sent</th>
                    <th>Status</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.filter(n => n.status !== 'read').length > 0 ? (
                    notifications.filter(n => n.status !== 'read').map((notification) => (
                      <tr key={notification.id}>
                        <td className="font-medium">{notification.title}</td>
                        <td className="text-muted-foreground max-w-xs truncate">{notification.message}</td>
                        <td>
                          <span className={cn("status-badge capitalize", getTypeBadge(notification.type))}>
                            {notification.type}
                          </span>
                        </td>
                        <td className="text-muted-foreground">{notification.recipient}</td>
                        <td className="text-muted-foreground">{notification.sent}</td>
                        <td>
                          <span className="status-badge status-active capitalize">{notification.status}</span>
                        </td>
                        <td>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                            onClick={() => confirmDeleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
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
            {notificationTypes.map((type) => {
              const typeNotifications = notifications.filter(n => n.type === type.value);
              return (
                <div key={type.value}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <type.icon className="w-5 h-5 text-primary" />
                    {type.label}
                    <span className="text-sm text-muted-foreground">({typeNotifications.length})</span>
                  </h3>
                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Recipients</th>
                            <th>Sent</th>
                            <th>Status</th>
                            <th className="w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {typeNotifications.length > 0 ? (
                            typeNotifications.map((notification) => (
                              <tr key={notification.id}>
                                <td className="font-medium">{notification.title}</td>
                                <td className="text-muted-foreground max-w-xs truncate">{notification.message}</td>
                                <td className="text-muted-foreground">{notification.recipient}</td>
                                <td className="text-muted-foreground">{notification.sent}</td>
                                <td>
                                  <span className="status-badge status-active capitalize">{notification.status}</span>
                                </td>
                                <td>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive/80 h-8 w-8 p-0"
                                    onClick={() => confirmDeleteNotification(notification.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                No {type.label.toLowerCase()} notifications
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
      </Tabs>

      {/* Delete All Confirmation Dialog */}
      {showDeleteAllConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-semibold text-lg mb-2">Delete All Notifications?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete all notifications? This action cannot be undone.
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
                onClick={deleteAllNotifications}
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
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={cancelDeleteNotification}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteNotification(notificationToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
