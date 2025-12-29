import { CheckCircle, XCircle, UserPlus, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "session_complete",
    icon: CheckCircle,
    iconColor: "text-success",
    bgColor: "bg-success/10",
    title: "Session completed",
    description: "Dr. Sarah Johnson finished session with John Doe",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "new_user",
    icon: UserPlus,
    iconColor: "text-info",
    bgColor: "bg-info/10",
    title: "New user registered",
    description: "Emily Parker signed up for the platform",
    time: "15 min ago",
  },
  {
    id: 3,
    type: "payment",
    icon: CreditCard,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "Payment received",
    description: "Monthly subscription payment of $49.99 from Mike Wilson",
    time: "32 min ago",
  },
  {
    id: 4,
    type: "cancellation",
    icon: XCircle,
    iconColor: "text-warning",
    bgColor: "bg-warning/10",
    title: "Session cancelled",
    description: "Lisa Anderson cancelled tomorrow's session",
    time: "1 hour ago",
  },
  {
    id: 5,
    type: "issue",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
    title: "Issue reported",
    description: "User reported video quality issues in session",
    time: "2 hours ago",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", activity.bgColor)}>
              <activity.icon className={cn("w-4 h-4", activity.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
