import { useState } from "react";
import { Bell, Send, Users, UserCog, Calendar, CreditCard, Megaphone, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const mockNotifications = [
  { id: 1, title: "Session Reminder", message: "Your session with Dr. Johnson is in 1 hour", recipient: "All Users", sent: "2024-03-18 09:00", type: "reminder", status: "sent" },
  { id: 2, title: "Subscription Expiring", message: "Your subscription expires in 3 days. Renew now!", recipient: "Expiring Users", sent: "2024-03-17 10:00", type: "subscription", status: "sent" },
  { id: 3, title: "Platform Update", message: "We've added new features to improve your experience.", recipient: "All Users", sent: "2024-03-15 14:00", type: "announcement", status: "sent" },
  { id: 4, title: "New Therapist Available", message: "Dr. Emma Davis has joined our platform.", recipient: "All Therapists", sent: "2024-03-14 11:00", type: "announcement", status: "sent" },
];

const notificationTypes = [
  { value: "reminder", label: "Session Reminder", icon: Calendar },
  { value: "subscription", label: "Subscription Alert", icon: CreditCard },
  { value: "announcement", label: "Platform Announcement", icon: Megaphone },
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("send");
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "announcement",
    recipient: "all_users",
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Notifications Management</h1>
        <p className="page-subtitle">Send notifications to users and therapists</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{mockNotifications.length}</p>
              <p className="text-sm text-muted-foreground">Sent Today</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">98%</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">6,850</p>
              <p className="text-sm text-muted-foreground">User Recipients</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">5</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Send Notification Tab */}
        <TabsContent value="send" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-card rounded-lg border border-border p-6 animate-fade-in">
              <h3 className="font-semibold mb-4">Compose Notification</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Notification Type</Label>
                  <Select
                    value={notificationForm.type}
                    onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Recipients</Label>
                  <Select
                    value={notificationForm.recipient}
                    onValueChange={(value) => setNotificationForm({ ...notificationForm, recipient: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="all_therapists">All Therapists</SelectItem>
                      <SelectItem value="active_subscribers">Active Subscribers</SelectItem>
                      <SelectItem value="expiring_subscribers">Expiring Subscribers</SelectItem>
                      <SelectItem value="upcoming_sessions">Users with Upcoming Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter notification title..."
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Enter your notification message..."
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 gap-2">
                    <Send className="w-4 h-4" />
                    Send Now
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-card rounded-lg border border-border p-6 animate-fade-in">
              <h3 className="font-semibold mb-4">Preview</h3>
              
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = getTypeIcon(notificationForm.type);
                      return <Icon className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {notificationForm.title || "Notification Title"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notificationForm.message || "Your notification message will appear here..."}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={cn("status-badge", getTypeBadge(notificationForm.type))}>
                        {notificationTypes.find(t => t.value === notificationForm.type)?.label}
                      </span>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Recipients:</span>{" "}
                  {notificationForm.recipient === "all_users" && "6,850 users"}
                  {notificationForm.recipient === "all_therapists" && "120 therapists"}
                  {notificationForm.recipient === "active_subscribers" && "4,230 subscribers"}
                  {notificationForm.recipient === "expiring_subscribers" && "156 users"}
                  {notificationForm.recipient === "upcoming_sessions" && "89 users"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
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
                  </tr>
                </thead>
                <tbody>
                  {mockNotifications.map((notification) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
