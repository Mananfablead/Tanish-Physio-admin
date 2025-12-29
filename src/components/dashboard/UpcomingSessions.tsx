import { Video, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const sessions = [
  {
    id: 1,
    user: "John Doe",
    therapist: "Dr. Sarah Johnson",
    time: "10:00 AM",
    type: "1-on-1",
    status: "starting_soon",
  },
  {
    id: 2,
    user: "Emily Parker",
    therapist: "Dr. Michael Chen",
    time: "10:30 AM",
    type: "1-on-1",
    status: "scheduled",
  },
  {
    id: 3,
    user: "Group Session",
    therapist: "Dr. Lisa Williams",
    time: "11:00 AM",
    type: "Group (8 participants)",
    status: "scheduled",
  },
  {
    id: 4,
    user: "Mike Wilson",
    therapist: "Dr. Sarah Johnson",
    time: "11:30 AM",
    type: "1-on-1",
    status: "scheduled",
  },
  {
    id: 5,
    user: "Anna Smith",
    therapist: "Dr. James Brown",
    time: "12:00 PM",
    type: "1-on-1",
    status: "scheduled",
  },
];

export function UpcomingSessions() {
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upcoming Sessions</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              session.status === "starting_soon"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-muted/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                session.status === "starting_soon" ? "bg-primary/10" : "bg-muted"
              )}>
                <Video className={cn(
                  "w-4 h-4",
                  session.status === "starting_soon" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="text-sm font-medium">{session.user}</p>
                <p className="text-xs text-muted-foreground">with {session.therapist}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={session.status === "starting_soon" ? "text-primary font-medium" : ""}>
                  {session.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{session.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
