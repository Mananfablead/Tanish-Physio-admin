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
  Activity,
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
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  console.log("isEditing", isEditing);
  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchServices());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

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
          {/* <Button
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
          </Button> */}
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
      {/* Table or Empty State */}
      {paginatedBookings.length > 0 ? (
        <>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Client</th>
                  {/* <th>Therapist</th> */}
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Expiration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.serviceName}</td>
                    <td>{booking.clientName}</td>
                    {/* <td>{booking.therapistName}</td> */}
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
                      {booking.isServiceExpired ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-red-600 bg-red-100">
                          Expired
                        </span>
                      ) : booking.serviceExpiryDate ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-green-600 bg-green-100">
                          {new Date(booking.serviceExpiryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-blue-600 bg-blue-100">
                          Unlimited
                        </span>
                      )}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {/* EDIT BOOKING */}
                          {/* <DropdownMenuItem
                            onClick={() => prepareEditBooking(booking)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2 text-slate-600" />
                            Edit Booking
                          </DropdownMenuItem> */}

                          {/* STATUS UPDATE */}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>

                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + bookingsPerPage, filteredBookings.length)}</span> of <span className="font-medium">{filteredBookings.length}</span> bookings
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="border rounded-lg p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No bookings match your search criteria."
              : "There are no bookings in the system yet."}
          </p>
        </div>
      )}
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
                  return String(bookingForm.serviceId || "");
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

      {/* STATUS UPDATE DIALOG */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of the booking
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <span className={cn(
                "status-badge",
                getStatusBadge(selectedBooking?.status)
              )}>
                {selectedBooking?.status}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Status:</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false);
                setNewStatus('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedBooking && newStatus) {
                  try {
                    await dispatch(
                      updateBooking({
                        id: selectedBooking._id,
                        bookingData: { status: newStatus },
                      })
                    );
                    setIsStatusDialogOpen(false);
                    setNewStatus('');
                    // Refresh the bookings list
                    dispatch(fetchBookings());
                    toast({ title: "Booking status updated successfully", variant: "default" });
                  } catch (error) {
                    console.error("Failed to update booking status:", error);
                    toast({ title: "Failed to update booking status", variant: "destructive" });
                  }
                }
              }}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
