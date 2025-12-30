import { useState } from "react";
import { 
  Calendar, Clock, User, Star, ArrowLeft, Filter, 
  MessageSquare, TrendingUp, CheckCircle2, XCircle, 
  Clock4, Award, Download, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

const mockStaffInfo = {
  id: 1,
  name: "Dr. Sarah Johnson",
  role: "Senior Physiotherapist",
  specialty: "Sports Injury",
  rating: 4.9,
  totalSessions: 248,
  joinedDate: "Jan 2023"
};

const mockHistory = [
  { 
    id: 1, 
    patient: "John Smith", 
    date: "2024-03-15", 
    time: "10:00 AM", 
    type: "1-on-1", 
    status: "completed", 
    feedback: "Excellent session, very helpful with my knee recovery. The exercises prescribed are working wonders.", 
    rating: 5, 
    performance: 95,
    tags: ["Knee", "Recovery"]
  },
  { 
    id: 2, 
    patient: "Sarah Wilson", 
    date: "2024-03-15", 
    time: "11:30 AM", 
    type: "Group Session", 
    status: "completed", 
    feedback: "Great group dynamics and individual attention despite being a group class.", 
    rating: 4, 
    performance: 88,
    tags: ["Yoga", "Back Pain"]
  },
  { 
    id: 3, 
    patient: "Michael Brown", 
    date: "2024-03-16", 
    time: "02:00 PM", 
    type: "1-on-1", 
    status: "cancelled", 
    feedback: "-", 
    rating: 0, 
    performance: 0,
    tags: ["Shoulder"]
  },
  { 
    id: 4, 
    patient: "Emily Davis", 
    date: "2024-03-17", 
    time: "09:00 AM", 
    type: "1-on-1", 
    status: "scheduled", 
    feedback: "Pending session", 
    rating: 0, 
    performance: 0,
    tags: ["Assessment"]
  },
];

export default function StaffSessions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Completion Rate", value: "98%", icon: CheckCircle2, color: "text-success" },
    { label: "Avg. Performance", value: "92%", icon: TrendingUp, color: "text-primary" },
    { label: "Patient Satisfaction", value: "4.9/5", icon: Star, color: "text-warning" },
    { label: "Total Hours", value: "1,240", icon: Clock4, color: "text-info" },
  ];

  const filteredHistory = mockHistory.filter(item => {
    if (filter !== "all" && item.status !== filter) return false;
    if (search && !item.patient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      {/* Creative Header */}
      <div className="relative bg-primary/5 border-b border-border/50 pt-8 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-info/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="container px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6 hover:bg-background/80"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl shadow-primary/20">
                  {mockStaffInfo.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-success text-success-foreground p-1.5 rounded-lg border-4 border-background shadow-lg">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">{mockStaffInfo.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="font-medium text-primary">{mockStaffInfo.role}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{mockStaffInfo.specialty}</span>
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-full border border-border/50 text-sm font-medium">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    {mockStaffInfo.rating} Rating
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined {mockStaffInfo.joinedDate}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 -mt-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Timeline */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Session Timeline
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filteredHistory.length} results
                </span>
              </h2>
              
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Find patient..." 
                    className="pl-9 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                  {["all", "completed", "scheduled"].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                        filter === t ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Creative Timeline Layout */}
            <div className="space-y-4">
              {filteredHistory.length > 0 ? filteredHistory.map((session, i) => (
                <div 
                  key={session.id} 
                  className={cn(
                    "group relative pl-8 border-l-2 py-2 transition-all hover:border-primary",
                    session.status === "completed" ? "border-success/30" : 
                    session.status === "cancelled" ? "border-destructive/30" : "border-info/30"
                  )}
                >
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute left-0 top-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10",
                    session.status === "completed" ? "bg-success" : 
                    session.status === "cancelled" ? "bg-destructive" : "bg-info"
                  )} />
                  
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-32 flex-shrink-0">
                        <div className="text-sm font-bold text-foreground mb-1">{session.date}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {session.time}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Performance</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  session.performance >= 90 ? "bg-success" : "bg-primary"
                                )}
                                style={{ width: `${session.performance}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold">{session.performance}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold">{session.patient}</h3>
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border",
                                session.status === "completed" ? "bg-success/5 text-success border-success/20" :
                                session.status === "cancelled" ? "bg-destructive/5 text-destructive border-destructive/20" :
                                "bg-info/5 text-info border-info/20"
                              )}>
                                {session.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{session.type}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <div className="flex gap-1">
                                {session.tags.map(tag => (
                                  <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {session.rating > 0 && (
                            <div className="flex items-center gap-1 bg-warning/5 px-2 py-1 rounded-lg border border-warning/20">
                              <Star className="w-3 h-3 text-warning fill-warning" />
                              <span className="text-xs font-bold text-warning">{session.rating}.0</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-muted/30 rounded-xl p-4 relative group/feedback">
                          <MessageSquare className="w-4 h-4 text-muted-foreground absolute top-4 right-4 opacity-30" />
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Patient Feedback</div>
                          <p className="text-sm italic text-muted-foreground leading-relaxed">
                            "{session.feedback}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">No sessions found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions & Performance Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Performance Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-sm font-medium mb-1">Top Performer</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Consistent 95%+ performance in sports injury recovery sessions over the last 30 days.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Punctuality</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-full bg-success rounded-full w-full" />
                  </div>
                  
                  <div className="flex justify-between text-sm mt-4">
                    <span className="text-muted-foreground">Patient Retention</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-full bg-primary rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6 variant-outline bg-background hover:bg-muted border-border">
                Generate Monthly Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
