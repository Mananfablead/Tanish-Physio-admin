import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  UserCog,
  Edit,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { bookingAPI } from "@/api/apiClient";
import { toast } from "sonner";

export default function Bookings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const [bookingForm, setBookingForm] = useState<{
    status: "confirmed" | "pending" | "cancelled";
  }>({
    status: "confirmed",
  });

  /* ===========================
     FILTER
  =========================== */
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ===========================
     UPDATE STATUS ONLY
  =========================== */
  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await bookingAPI.update(selectedBooking._id, {
        status: bookingForm.status,
      });

      // Update the booking in the local state
      const updatedBookings = bookings.map((b) =>
        b._id === selectedBooking._id ? response.data.data.booking : b
      );

      setBookings(updatedBookings);
      setIsEditBookingOpen(false);
      toast.success("Booking status updated successfully");
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    }
  };

  /* ===========================
     STATUS BADGE
  =========================== */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/15 text-success";
      case "pending":
        return "bg-warning/15 text-warning";
      case "cancelled":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Bookings Management</h1>
        <p className="page-subtitle">Admin can only update booking status</p>
      </div>
      {/* Stats */}{" "}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {" "}
        <div className="stat-card">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 rounded-lg bg-success/10">
              {" "}
              <CheckCircle className="w-5 h-5 text-success" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-semibold">
                {bookings.filter((b) => b.status === "confirmed").length}
              </p>{" "}
              <p className="text-sm text-muted-foreground">Confirmed</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="stat-card">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 rounded-lg bg-warning/10">
              {" "}
              <ClockIcon className="w-5 h-5 text-warning" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-semibold">
                {bookings.filter((b) => b.status === "pending").length}
              </p>{" "}
              <p className="text-sm text-muted-foreground">Pending</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="stat-card">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 rounded-lg bg-destructive/10">
              {" "}
              <XCircle className="w-5 h-5 text-destructive" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-semibold">
                {bookings.filter((b) => b.status === "cancelled").length}
              </p>{" "}
              <p className="text-sm text-muted-foreground">Cancelled</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="stat-card">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 rounded-lg bg-primary/10">
              {" "}
              <Calendar className="w-5 h-5 text-primary" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-semibold">{bookings.length}</p>{" "}
              <p className="text-sm text-muted-foreground">Total</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Client</th>
              <th>Therapist</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading bookings...
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.serviceName}</td>
                  <td>{booking.clientName}</td>
                  <td>{booking.therapistName}</td>
                  <td>
                    {booking.date} <Clock className="inline w-4 h-4 ml-2" />{" "}
                    {booking.time}
                  </td>
                  <td>
                    <span
                      className={cn(
                        "status-badge",
                        getStatusBadge(booking.status)
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking(booking);
                            setBookingForm({ status: booking.status });
                            setIsEditBookingOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Change Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* STATUS ONLY MODAL */}
      <Dialog open={isEditBookingOpen} onOpenChange={setIsEditBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Only booking status can be changed by admin.
            </DialogDescription>
          </DialogHeader>

          <Select
            value={bookingForm.status}
            onValueChange={(value) =>
              setBookingForm({
                status: value as "confirmed" | "pending" | "cancelled",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditBookingOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateBooking}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
