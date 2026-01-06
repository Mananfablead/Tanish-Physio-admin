import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, UserX, Mail, Phone, Shield, CreditCard, Activity, MessageSquare, ClipboardList, Star, MoreHorizontal, Clock, UserCog, PlusCircle } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { mockUsers } from "@/lib/mock-data";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFullIntakeOpen, setIsFullIntakeOpen] = useState(false);
  const [isAssignSessionOpen, setIsAssignSessionOpen] = useState(false);
  
  // Define form schema
  const assignSessionSchema = z.object({
    date: z.date({ required_error: "Please select a date" }),
    time: z.string().min(1, "Please select a time"),
    staff: z.string().min(1, "Please select a staff member"),
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof assignSessionSchema>>({
    resolver: zodResolver(assignSessionSchema),
    defaultValues: {
      date: new Date(),
      time: "",
      staff: "",
    },
  });
  
  // Handle form submission
  const onAssignSessionSubmit = (values: z.infer<typeof assignSessionSchema>) => {
    console.log('Assigning session:', {
      date: values.date,
      time: values.time,
      staff: values.staff,
      userId: user?.id
    });
    
    // Here you would typically make an API call to assign the session
    // For now, just show a success message and close the dialog
    setIsAssignSessionOpen(false);
    
    // Reset form after submission
    form.reset();
  };
  
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
                <CalendarIcon className="w-3.5 h-3.5" />
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
          <div className="bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 border-primary/20 text-primary">
                <Shield className="w-5 h-5 text-primary" />
                Account Overview
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-semibold text-foreground break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
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
              
              {/* <div className="pt-4">
                <Button className="w-full font-bold shadow-lg shadow-primary/20" variant="default">
                  Assign New Subscription
                </Button>
              </div> */}
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 border-primary/20 text-primary">
                  <Activity className="w-5 h-5 text-primary" />
                  Upcoming Sessions
                </h3>
                <Button variant="outline" size="sm" className="font-semibold" onClick={() => setIsAssignSessionOpen(true)}>
                  + Assign Session
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/30 border border-primary/20 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">Next Session</p>
                      <p className="text-sm text-muted-foreground">Dr. Sarah Johnson</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">March 22, 2024</p>
                      <p className="text-sm text-muted-foreground">10:00 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { dr: "Dr. Michael Chen", date: "March 29, 2024", time: "2:30 PM" },
                    { dr: "Dr. Emily Roberts", date: "April 5, 2024", time: "11:00 AM" }
                  ].map((session, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-card border border-border/50 flex items-center justify-between hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold text-foreground">{session.dr}</p>
                        <p className="text-sm text-muted-foreground">Session #{i + 2}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{session.date}</p>
                        <p className="text-sm text-muted-foreground">{session.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Health, Activity & Feedback */}
        <div className="lg:col-span-8 space-y-8">
          {/* Health Profile */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Health Profile & Intake
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsFullIntakeOpen(true)}>
                    View Full Intake
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-border/50 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Primary Concern</p>
                <p className="font-bold text-foreground">{user.healthProfile?.primaryConcern || 'Not specified'}</p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-border/50 shadow-sm text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Pain Intensity</p>
                <p className="text-3xl font-black text-primary">{user.healthProfile?.painIntensity || 0}<span className="text-sm font-medium text-muted-foreground">/10</span></p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-border/50 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Prior Treatments</p>
                <p className="font-bold text-foreground">{user.healthProfile?.priorTreatments || 'Not specified'}</p>
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
                <div key={i} className="group p-4 rounded-2xl bg-gradient-to-r from-card to-accent/10 border border-border/50 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center font-bold text-primary shrink-0">
                      {session.dr.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{session.dr}</p>
                      <p className="text-xs text-muted-foreground font-medium">{session.date} • {session.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
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
            <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-amber-50/30 border border-border/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-amber-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
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
      
      {/* Full Intake Form Dialog */}
      <Dialog open={isFullIntakeOpen} onOpenChange={setIsFullIntakeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Full Health Intake Form
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
                <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Primary Concern
                </h4>
                <p className="text-foreground text-lg font-medium">{user.healthProfile?.primaryConcern || 'Not specified'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm text-center">
                <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2 justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                  Pain Intensity
                </h4>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-black text-primary">{user.healthProfile?.painIntensity || 0}</span>
                  <span className="text-lg font-medium text-muted-foreground ml-1">/10</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
                <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Prior Treatments
                </h4>
                <p className="text-foreground">{user.healthProfile?.priorTreatments || 'Not specified'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
                <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Medical History
                </h4>
                <p className="text-foreground">{user.healthProfile?.medicalHistory || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
                <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Allergies
                </h4>
                <p className="text-foreground">{user.healthProfile?.allergies || 'None known'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
                <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Current Medications
                </h4>
                <p className="text-foreground">{user.healthProfile?.medications || 'None'}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
              <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Emergency Contact
              </h4>
              <p className="text-foreground">{user.healthProfile?.emergencyContact || 'Not specified'}</p>
            </div>
            
            <div className="bg-gradient-to-br from-card to-primary/5 p-5 rounded-xl border border-border/50 shadow-sm">
              <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Additional Notes
              </h4>
              <p className="text-foreground">{user.healthProfile?.additionalNotes || 'No additional notes'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Assign Session Dialog */}
      <Dialog open={isAssignSessionOpen} onOpenChange={setIsAssignSessionOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-card to-primary/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Assign New Session
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit((values) => onAssignSessionSubmit(values))(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-base font-semibold flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            Select Date
                          </FormLabel>
                          <FormControl>
                            <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-card to-primary/5">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                className="w-full"
                                classNames={{
                                  months: "flex flex-col w-full",
                                  month: "w-full",
                                  table: "w-full border-collapse",
                                  head_row: "w-full",
                                  row: "w-full",
                                }}
                              />

                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          Select Time
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border border-border/50 bg-gradient-to-br from-card to-primary/5">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="13:00">01:00 PM</SelectItem>
                            <SelectItem value="14:00">02:00 PM</SelectItem>
                            <SelectItem value="15:00">03:00 PM</SelectItem>
                            <SelectItem value="16:00">04:00 PM</SelectItem>
                            <SelectItem value="17:00">05:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="staff"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <UserCog className="w-4 h-4 text-primary" />
                          Select Staff Member
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border border-border/50 bg-gradient-to-br from-card to-primary/5">
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                            <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                            <SelectItem value="dr-roberts">Dr. Emily Roberts</SelectItem>
                            <SelectItem value="dr-williams">Dr. James Williams</SelectItem>
                            <SelectItem value="dr-davis">Dr. Lisa Davis</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 text-base font-semibold" 
                    onClick={() => setIsAssignSessionOpen(false)} 
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    type="submit"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Assign Session
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
