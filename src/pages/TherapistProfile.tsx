import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Mail, 
  UserCheck, 
  UserX, 
  Star, 
  Activity, 
  MessageSquare, 
  Shield, 
  Video 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockStaff } from "@/lib/staff-data";

export default function TherapistProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const therapistId = parseInt(id || "0");
  const therapist = mockStaff.find((t) => t.id === therapistId);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: therapist?.name || "",
    email: therapist?.email || "",
    specialty: therapist?.specialty || ""
  });

  if (!therapist) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-foreground">Therapist not found</h2>
        <Button variant="link" onClick={() => navigate("/therapists")}>
          Back to Therapists
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    // In a real app, this would make an API call to save changes
    setIsEditing(false);
    // Update therapist data in state if needed
  };

  const handleCancel = () => {
    // Reset form to original values
    setEditForm({
      name: therapist.name,
      email: therapist.email,
      specialty: therapist.specialty
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // In a real app, this would make an API call to delete the therapist
    navigate("/therapists");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/therapists")} 
            className="rounded-full shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{therapist.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", 
                therapist.status === "active" 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {therapist.status}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm text-muted-foreground font-medium">{therapist.rating}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-semibold">
            <Video className="w-4 h-4" />
            Manage Sessions
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-2 font-semibold"
            onClick={handleDelete}
          >
            <UserX className="w-4 h-4" />
            Delete Therapist
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
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                    {isEditing ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground break-all">{therapist.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                    {isEditing ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground">{therapist.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Specialty</p>
                    {isEditing ? (
                      <input
                        value={editForm.specialty}
                        onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground">{therapist.specialty}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Session Types</p>
                    <div className="flex gap-1 mt-2">
                      {therapist.sessionTypes.map((type, index) => (
                        <span key={index} className="status-badge bg-muted text-muted-foreground">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button 
                      className="w-full font-bold shadow-lg shadow-primary/20" 
                      variant="default"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      className="w-full font-bold" 
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full font-bold shadow-lg shadow-primary/20" 
                    variant="default"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Performance & Feedback */}
        <div className="lg:col-span-8 space-y-8">
          {/* Performance Stats */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Performance Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Total Sessions</p>
                <p className="text-3xl font-black text-primary">{therapist.sessions}</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Average Rating</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <span className="text-3xl font-black text-primary">{therapist.rating}</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Cancellation Rate</p>
                <p className="text-3xl font-black text-success">2.3%</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Success Rate</p>
                <p className="text-3xl font-black text-primary">87%</p>
              </div>
            </div>
          </section>

          {/* Recent Feedback */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recent Feedback
            </h3>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                    <p className="font-bold text-sm">John Doe</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
                  </div>
                </div>
                <p className="text-foreground leading-relaxed italic font-medium">
                  "Excellent professional! Very knowledgeable and patient."
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                    <p className="font-bold text-sm">Emily Parker</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,0].map(s => s ? <Star key={s} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> : <Star key={s} className="w-3.5 h-3.5 text-muted-foreground" />)}
                  </div>
                </div>
                <p className="text-foreground leading-relaxed italic font-medium">
                  "Great session, really helped with my recovery."
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}