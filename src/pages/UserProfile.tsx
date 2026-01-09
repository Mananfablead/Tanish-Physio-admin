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

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isFullIntakeOpen, setIsFullIntakeOpen] = useState(false);
  const [isAssignSessionOpen, setIsAssignSessionOpen] = useState(false);

  const { selectedUser: user, loading } = useSelector(
    (state) => state.users
  );
  console.log("selectedUser", user)
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
  const deactivateUser = () => {
    if (!user?._id) return;

    dispatch(
      updateUser({
        userId: user._id,
        userData: { status: "inactive" },
      })
    );
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
     LOADING / NOT FOUND
  ============================ */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] font-semibold">
        Loading user...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold">User not found</h2>
        <Button variant="link" onClick={() => navigate("/users")}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/users")}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-bold uppercase",
                  user.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
                )}
              >
                {user.status}
              </span>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Joined {user.joinDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset Access
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deactivateUser}
          >
            <UserX className="w-4 h-4 mr-1" />
            Deactivate
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Overview
            </h3>

            <div className="space-y-4">
              <p><Mail className="inline w-4 h-4 mr-2" />{user.email}</p>
              <p><Phone className="inline w-4 h-4 mr-2" />{user.phone}</p>
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

          <Button
            variant="outline"
            onClick={() => setIsAssignSessionOpen(true)}
          >
            + Assign Session
          </Button>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-3">
              Health Profile
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-xl">
                {user.healthProfile?.primaryConcern || "N/A"}
              </div>
              <div className="p-4 border rounded-xl text-center text-2xl font-bold">
                {user.healthProfile?.painIntensity || 0}/10
              </div>
              <div className="p-4 border rounded-xl">
                {user.healthProfile?.priorTreatments || "N/A"}
              </div>
            </div>
          </section>
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
