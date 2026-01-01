import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, UserX, Mail, Phone, Calendar, Shield, CreditCard, Activity, MessageSquare, ClipboardList, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockUsers } from "@/lib/mock-data";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = mockUsers.find((u) => u.id === Number(id));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-foreground">User not found</h2>
        <Button variant="link" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Monthly":
      case "Weekly":
      case "Daily":
        return "status-active";
      case "Expired":
        return "status-pending";
      case "None":
        return "status-inactive";
      default:
        return "status-inactive";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/users")} className="rounded-full shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", user.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400")}>
                {user.status}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {user.joinDate}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-semibold">
            <RefreshCw className="w-4 h-4" />
            Reset Access
          </Button>
          <Button variant="destructive" size="sm" className="gap-2 font-semibold">
            <UserX className="w-4 h-4" />
            Deactivate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Contact & Subscription Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 border-border/50">
                <Shield className="w-5 h-5 text-primary" />
                Account Overview
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-semibold text-foreground break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Plan</p>
                    <div className="mt-1">
                      <span className={cn("status-badge", getSubscriptionBadge(user.subscription))}>
                        {user.subscription}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full font-bold shadow-lg shadow-primary/20" variant="default">
                  Assign New Subscription
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/10 p-6">
            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 fill-primary" />
              Quick Note
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This user has been consistently booking sessions with Dr. Sarah Johnson. Monitor for lower back pain progress.
            </p>
          </div>
        </div>

        {/* Right Column - Health, Activity & Feedback */}
        <div className="lg:col-span-8 space-y-8">
          {/* Health Profile */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Health Profile & Intake
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Primary Concern</p>
                <p className="font-bold text-foreground">Lower back pain</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Pain Intensity</p>
                <p className="text-3xl font-black text-primary">6<span className="text-sm font-medium text-muted-foreground">/10</span></p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Prior Treatments</p>
                <p className="font-bold text-foreground">Physiotherapy, Massage</p>
              </div>
            </div>
          </section>

          {/* Recent Sessions */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Treatment Sessions
            </h3>
            <div className="space-y-3">
              {[
                { dr: "Dr. Sarah Johnson", date: "March 15, 2024", time: "10:00 AM", status: "Completed" },
                { dr: "Dr. Michael Chen", date: "March 8, 2024", time: "2:30 PM", status: "Completed" }
              ].map((session, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-primary shrink-0">
                      {session.dr.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{session.dr}</p>
                      <p className="text-xs text-muted-foreground font-medium">{session.date} • {session.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    {session.status}
                  </span>
                </div>
              ))}
              <Button variant="link" className="w-full text-muted-foreground font-bold hover:text-primary">View Full History</Button>
            </div>
          </section>

          {/* User Feedback */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Direct Feedback
            </h3>
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <p className="font-bold text-sm">Review for Dr. Sarah Johnson</p>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
                </div>
              </div>
              <p className="text-foreground leading-relaxed italic font-medium">
                "Excellent session! Very helpful exercises and great communication. I can already feel a difference in my mobility after just three sessions."
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
