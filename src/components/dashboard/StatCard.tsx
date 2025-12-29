import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, change, icon: Icon, iconColor = "text-primary", onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "stat-card animate-fade-in",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {change && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              change.isPositive ? "text-success" : "text-destructive"
            )}>
              {change.isPositive ? "+" : ""}{change.value}% from last month
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg bg-muted/50", iconColor.replace("text-", "bg-").replace(/\/\d+/, "/10"))}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}
