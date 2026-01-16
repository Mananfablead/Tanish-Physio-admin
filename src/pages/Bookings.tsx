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
  Plus,
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
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBookings,
  updateBooking,
  deleteBooking,
  createBooking,
} from "@/features/bookings/bookingSlice";
import { fetchServices } from "@/features/services/serviceSlice";
import { fetchUsers } from "@/features/users/userSlice";
import { toast } from "@/hooks/use-toast";
import PageLoader from "@/components/PageLoader";

export default function Bookings() {
  const dispatch: any = useDispatch();
  const {
    list: bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useSelector((state: any) => state.bookings);
  const {
    list: services,
    loading: servicesLoading,
    error: servicesError,
  } = useSelector((state: any) => state.services);
  const {
    list: users,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state: any) => state.users);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  console.log("isEditing", isEditing);
  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchServices());
    dispatch(fetchUsers());
  }, [dispatch]);

  // State for creating new booking
  const [newBookingForm, setNewBookingForm] = useState({
    serviceId: "",
    date: "",
    time: "",
    notes: "",
    clientName: "",
  });

  const [bookingForm, setBookingForm] = useState({
    status: "confirmed" as "confirmed" | "pending" | "cancelled",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
    clientName: "",
  });

  /* ===========================
     FILTER
  =========================== */
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.serviceName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      booking.clientName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      booking.therapistName
        ?.toLowerCase()
        .includes(searchQuery?.toLowerCase()) ||
      booking.status?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  /* ===========================
     CREATE BOOKING
  =========================== */
  const handleCreateBooking = async () => {
    try {
      await dispatch(createBooking(bookingForm));
      setIsModalOpen(false);
      // Reset form
      setBookingForm({
        status: "confirmed" as "confirmed" | "pending" | "cancelled",
        serviceId: "",
        date: "",
        time: "",
        notes: "",
        clientName: "",
      });
      // Refresh the bookings list
      dispatch(fetchBookings());
    } catch (error) {
      console.error("Failed to create booking:", error);
    }
  };

  /* ===========================
     UPDATE BOOKING DETAILS
  =========================== */
  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    try {
      await dispatch(
        updateBooking({
          id: selectedBooking._id,
          bookingData: { ...bookingForm },
        })
      );
      setIsModalOpen(false);
      // Refresh the bookings list
      dispatch(fetchBookings());
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  /* ===========================
     PREPARE EDIT BOOKING
  =========================== */
  const prepareEditBooking = (booking) => {
    setSelectedBooking(booking);
    console.log("Selected Booking:", booking);
    setBookingForm({
      serviceId: booking.serviceId?._id || "",
      date: booking.date || "",
      time: booking.time || "",
      notes: booking.notes || "",
      clientName: booking.clientName || "",
      status: booking.status || "pending",
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  /* ===========================
     DELETE BOOKING
  =========================== */
  const handleDeleteBooking = async (id: number) => {
    try {
      await dispatch(deleteBooking(id)).unwrap();

      // Optional: only if backend doesn't return updated list
      dispatch(fetchBookings());

      toast({ title: "Booking deleted successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Failed to delete booking", variant: "destructive" });
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

  if (bookingsLoading || !bookings) {
    return <PageLoader text="Loading bookings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Bookings Management</h1>
          <p className="page-subtitle">
            Admin can update booking status, create and manage bookings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setBookingForm({
                status: "confirmed" as "confirmed" | "pending" | "cancelled",
                serviceId: "",
                date: "",
                time: "",
                notes: "",
                clientName: "",
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Booking
          </Button>
        </div>
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
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
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
                          prepareEditBooking(booking);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteBooking(booking._id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Delete Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* EDIT/CREATE BOOKING MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Booking" : "Create New Booking"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the booking details."
                : "Enter the details for the new booking."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <select
                className="w-full p-2 border rounded-md"
                value={(() => {
                  // Find the service ID that matches the current serviceId
                  // In edit mode, serviceId might be an object with _id, or just a string ID
                  const serviceIdValue = bookingForm.serviceId;
                  if (
                    serviceIdValue &&
                    typeof serviceIdValue === "object" &&
                    serviceIdValue.hasOwnProperty("_id")
                  ) {
                    return (serviceIdValue as any)._id;
                  }
                  return String(serviceIdValue || "");
                })()}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    serviceId: e.target.value,
                  })
                }
                disabled={servicesLoading || isEditing}
              >
                <option value="">Select a service</option>

                {(services ?? []).map((service) => (
                  <option
                    key={service._id || service.id}
                    value={service._id || service.id}
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 w-full">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 w-full">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>

              <select
                className="w-full p-2 border rounded-md"
                value={bookingForm.clientName || ""}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    clientName: e.target.value,
                  })
                }
                disabled={usersLoading || isEditing}
              >
                <option value="">Select a client</option>

                {(users ?? []).map((user) => {
                  const displayName = user.name || user.email;
                  return (
                    <option key={user.id} value={displayName}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full p-2 border rounded-md"
                placeholder="Enter notes"
                value={bookingForm.notes}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, notes: e.target.value })
                }
              />
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={bookingForm.status}
                onValueChange={(value) =>
                  setBookingForm({
                    ...bookingForm,
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
            </div> */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleUpdateBooking : handleCreateBooking}
              disabled={
                !bookingForm.clientName ||
                !bookingForm.date ||
                !bookingForm.time
              }
            >
              {isEditing ? "Update Booking" : "Create Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
