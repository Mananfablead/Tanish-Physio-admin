import { CheckCircle, XCircle, UserPlus, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  recentActivityData?: Array<{
    id?: number;
    type: string;
    title: string;
    description: string;
    time: string;
  }>;
}

export function RecentActivity({ recentActivityData = [] }: RecentActivityProps) {
  // Map activity type to icon and color
  const getActivityConfig = (type: string) => {
    switch(type) {
      case 'session_complete':
        return { icon: CheckCircle, iconColor: "text-success", bgColor: "bg-success/10" };
      case 'new_user':
        return { icon: UserPlus, iconColor: "text-info", bgColor: "bg-info/10" };
      case 'payment':
        return { icon: CreditCard, iconColor: "text-primary", bgColor: "bg-primary/10" };
      case 'cancellation':
        return { icon: XCircle, iconColor: "text-warning", bgColor: "bg-warning/10" };
      case 'issue':
        return { icon: AlertTriangle, iconColor: "text-destructive", bgColor: "bg-destructive/10" };
      default:
        return { icon: CheckCircle, iconColor: "text-muted-foreground", bgColor: "bg-muted" };
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      
      <div className="space-y-4">
        {recentActivityData.slice(0, 5).map((activity, index) => {
          const { icon: Icon, iconColor, bgColor } = getActivityConfig(activity.type);
          return (
            <div key={activity.id || index} className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", bgColor)}>
                <Icon className={cn("w-4 h-4", iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
