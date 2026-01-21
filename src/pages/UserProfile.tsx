import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  RefreshCw,
  UserX,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Activity,
  MessageSquare,
  ClipboardList,
  Star,
  MoreHorizontal,
  Clock,
  UserCog,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById, updateUser } from "@/features/users/userSlice";
import PageLoader from "@/components/PageLoader";
import { toast } from "sonner";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
const [updating, setUpdating] = useState(false);

  const [isFullIntakeOpen, setIsFullIntakeOpen] = useState(false);
  const [isAssignSessionOpen, setIsAssignSessionOpen] = useState(false);

  const usersState = useSelector((state: any) => state.users);
  const { selectedUser: user, loading } = usersState;
  /* ============================
     FETCH USER
  ============================ */
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [id, dispatch]);

  /* ============================
     STATUS UPDATE
  ============================ */
const toggleUserStatus = async () => {
  if (!user?._id) return;

  const newStatus = user.status === "active" ? "inactive" : "active";

  try {
    setUpdating(true);

    const result: any = await dispatch(
      updateUser({
        userId: user._id,
        userData: { status: newStatus },
      })
    );

    if (updateUser.fulfilled.match(result)) {
      toast.success(`User ${newStatus} successfully`);
    } else {
      toast.error(result.payload?.message || "Update failed");
    }
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setUpdating(false);
  }
};




  /* ============================
     ASSIGN SESSION FORM
  ============================ */
  const assignSessionSchema = z.object({
    date: z.date({ required_error: "Please select a date" }),
    time: z.string().min(1, "Please select a time"),
    staff: z.string().min(1, "Please select a staff member"),
  });

  const form = useForm({
    resolver: zodResolver(assignSessionSchema),
    defaultValues: {
      date: new Date(),
      time: "",
      staff: "",
    },
  });

  const onAssignSessionSubmit = (values) => {
    console.log("Assign session:", {
      ...values,
      userId: user?._id,
    });

    setIsAssignSessionOpen(false);
    form.reset();
  };

  /* ============================
     HELPERS
  ============================ */
  const getSubscriptionBadge = (subscription) => {
    switch (subscription?.toLowerCase()) {
      case "monthly":
      case "weekly":
      case "daily":
        return "bg-emerald-100 text-emerald-700";
      case "expired":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  /* ============================
     LOADING STATES
  ============================ */
  // Show loading spinner while fetching user data
  if (loading || (id && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Show user not found only when we have an ID but no user data after loading
  if (id && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <UserX className="h-12 w-12 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">User not found</h2>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/users")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  /* ============================
     UI
  ============================ */
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/users")}
            className="rounded-full h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold">{user.name}</h1>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                  user.status === "active"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}
              >
                {user.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-sm">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Phone className="w-4 h-4" />
                {user.phone}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <CalendarIcon className="w-4 h-4" />
                Joined {user.joinDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
       <Button
  onClick={toggleUserStatus}
  disabled={updating}
  variant={user.status === "active" ? "destructive" : "default"}
  className="min-w-[160px]"
>
  {updating ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Updating...
    </>
  ) : user.status === "active" ? (
    "Deactivate User"
  ) : (
    "Activate User"
  )}
</Button>

        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          {/* ACCOUNT OVERVIEW CARD */}
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Account Overview</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-bold",
                      getSubscriptionBadge(user.subscription)
                    )}
                  >
                    {user.subscription}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          {/* <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => setIsAssignSessionOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Assign Session
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsFullIntakeOpen(true)}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              View Full Intake
            </Button>
          </div> */}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* HEALTH PROFILE SECTION */}
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Health Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Primary Concern</h4>
                <p className="font-medium">{user.healthProfile?.primaryConcern || "Not specified"}</p>
              </div>
              
              <div className="p-5 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-center">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pain Level</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {user.healthProfile?.painIntensity || 0}<span className="text-lg text-muted-foreground">/10</span>
                </div>
              </div>
              
              <div className="p-5 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Prior Treatments</h4>
                <p className="font-medium">{user.healthProfile?.priorTreatments || "None recorded"}</p>
              </div>
            </div>
          </div>

          {/* ADDITIONAL SECTIONS CAN BE ADDED HERE */}
          <div className="bg-card rounded-xl border p-6 shadow-sm text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <p className="text-muted-foreground">More user details and history will appear here</p>
          </div>
        </div>
      </div>

      {/* ASSIGN SESSION DIALOG */}
      <Dialog open={isAssignSessionOpen} onOpenChange={setIsAssignSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Session</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAssignSessionSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
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
                  <FormItem>
                    <FormLabel>Staff</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-johnson">
                          Dr. Sarah Johnson
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Assign Session
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
