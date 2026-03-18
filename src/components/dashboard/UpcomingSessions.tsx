import { Video, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface UpcomingSessionsProps {
  upcomingSessionsData?: Array<{
    _id?: string;
    id?: number;
    user: string;
    therapist: string;
    time: string;
    type: string;
    status: string;
  }>;
}

export function UpcomingSessions({ upcomingSessionsData = [] }: UpcomingSessionsProps) {
  const navigate = useNavigate();
  const handleViewAll = () => {
    navigate("/live-sessions");
  }
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upcoming Sessions</h3>
        <button className="text-sm text-primary hover:underline" onClick={handleViewAll}>View all</button>
      </div>
      
   <div className="space-y-3">
  {upcomingSessionsData.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Video className="w-10 h-10 text-muted-foreground mb-2" />
      <p className="text-sm font-medium">No upcoming sessions</p>
      <p className="text-xs text-muted-foreground">
        You don’t have any sessions scheduled right now.
      </p>
    </div>
  ) : (
    upcomingSessionsData.slice(0, 5).map((session, index) => (
      <div
        key={session._id || session.id || index}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          session.status === "starting_soon" || session.status === "live"
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              session.status === "starting_soon" || session.status === "live"
                ? "bg-primary/10"
                : "bg-muted"
            )}
          >
            <Video
              className={cn(
                "w-4 h-4",
                session.status === "starting_soon" || session.status === "live"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium">{session.user}</p>
            <p className="text-xs text-muted-foreground">
              with {session.therapist}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span
              className={
                session.status === "starting_soon" ||
                session.status === "live"
                  ? "text-primary font-medium"
                  : ""
              }
            >
              {session.time}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{session.type}</p>
        </div>
      </div>
    ))
  )}
</div>
    </div>
  );
}
