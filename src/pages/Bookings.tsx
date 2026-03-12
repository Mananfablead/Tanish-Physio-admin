import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  LoaderCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
import { availabilityAPI, bookingAPI } from "@/api/apiClient";

interface BookingsProps {
  onStatusConfirmed?: () => void;
}

export default function Bookings({ onStatusConfirmed }: BookingsProps) {
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
  const [newStatus, setNewStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const bookingsPerPage = 10;
  console.log("isEditing", isEditing);
  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchServices());
    dispatch(fetchUsers());
    fetchAvailability();
  }, [dispatch]);

  // Fetch availability data
  const fetchAvailability = async () => {
    try {
      setIsLoadingAvailability(true);
      const response = await availabilityAPI.getAll();
      setAvailability(response.data?.data?.availability || []);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      toast({
        title: "Failed to load availability",
        description:
          "Could not load available time slots. Using manual time entry.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Get available time slots for selected date
  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      const dateAvailability = availability.filter(
        (avail) => avail.date === selectedDate
      );
      const slots = dateAvailability.flatMap((avail) =>
        avail.timeSlots
          .filter((slot: any) => slot.status === "available")
          .map((slot: any) => ({
            ...slot,
            therapistId: avail.therapistId._id || avail.therapistId,
            therapistName: avail.therapistId.name,
          }))
      );
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availability]);

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setBookingForm({
        status: "pending" as "confirmed" | "pending" | "cancelled",
        serviceId: "",
        date: "",
        time: "",
        notes: "",
        clientName: "",
      });
      setSelectedDate("");
      setAvailableTimeSlots([]);
    }
  }, [isModalOpen]);

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
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + bookingsPerPage
  );

  /* ===========================
     CREATE BOOKING
  =========================== */
  const handleCreateBooking = async () => {
    setIsCreating(true);
    try {
      // Find the selected user by name to get their ID
      const selectedUser = users.find(
        (user) => (user.name || user.email) === bookingForm.clientName
      );

      // Prepare booking data with user ID for admin booking creation
      const bookingData = {
        ...bookingForm,
        userId: selectedUser?._id || selectedUser?.id, // Pass the user ID
        clientName:
          selectedUser?.name || selectedUser?.email || bookingForm.clientName, // Use actual user name/email
      };

      await dispatch(createBooking(bookingData));
      setIsModalOpen(false);
      // Reset form
      setBookingForm({
        status: "pending" as "confirmed" | "pending" | "cancelled",
        serviceId: "",
        date: "",
        time: "",
        notes: "",
        clientName: "",
      });
      // Refresh the bookings list
      dispatch(fetchBookings());
      toast({
        title: "Booking created successfully",
        description:
          "The new booking has been created and added to the system.",
      });
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Failed to create booking",
        description:
          "There was an error creating the booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  /* ===========================
     UPDATE BOOKING DETAILS
  =========================== */
  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    try {
      // Find the selected user by name to get their ID (for potential updates)
      const selectedUser = users.find(
        (user) => (user.name || user.email) === bookingForm.clientName
      );

      // Prepare booking data with user ID if updating user
      const bookingData = {
        ...bookingForm,
        userId: selectedUser?._id || selectedUser?.id, // Pass the user ID if available
        clientName:
          selectedUser?.name || selectedUser?.email || bookingForm.clientName, // Use actual user name/email
      };

      await dispatch(
        updateBooking({
          id: selectedBooking._id,
          bookingData: bookingData,
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

  const getStatusBadge = (status: string, bookingType?: string) => {
    switch (status) {
      case "confirmed":
        if (bookingType === "subscription-covered") {
          return "bg-emerald-500/15 text-emerald-600"; // Green for subscription confirmed
        }
        return bookingType === "free-consultation"
          ? "bg-blue-500/15 text-blue-600"
          : "bg-success/15 text-success";
      case "pending":
        if (bookingType === "subscription-covered") {
          return "bg-amber-500/15 text-amber-600"; // Amber for subscription pending
        }
        return "bg-warning/15 text-warning";
      case "scheduled":
        return "bg-purple-500/15 text-purple-600";
      case "completed":
        return "bg-green-500/15 text-green-600";
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
            onClick={() => {
              setIsEditing(false);
              setBookingForm({
                status: "pending", // Admin-created bookings should start as pending
                serviceId: "",
                date: "",
                time: "",
                notes: "",
                clientName: "",
              });
              setIsModalOpen(true);
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Create New Booking
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
      {/* Table or Empty State */}
      {paginatedBookings.length > 0 ? (
        <>
          <div className="bg-card rounded-lg border overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Service</th>
                  <th className="whitespace-nowrap">Type</th>
                  <th className="whitespace-nowrap">Client</th>
                  {/* <th>Therapist</th> */}
                  <th className="whitespace-nowrap">Date & Time</th>
                  {/* <th className="whitespace-nowrap">Expiration</th> */}
                  <th className="whitespace-nowrap">Status</th>
                  <th className="whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="min-w-[200px]">
                      <div className="flex items-center gap-3">
                        {booking.serviceId?.images &&
                        booking.serviceId.images.length > 0 ? (
                          <img
                            src={booking.serviceId.images[0]}
                            alt={booking.serviceName}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {booking.serviceName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate">{booking.serviceName}</span>
                      </div>
                    </td>
                    <td className="min-w-[100px]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.bookingType === "free-consultation"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.bookingType === "free-consultation"
                          ? "Free"
                          : "Regular"}
                      </span>
                    </td>
                    <td className="min-w-[120px]">
                      <div className="flex items-center gap-3">
                        <span className="capitalize truncate">
                          {booking.clientName}
                        </span>
                      </div>
                    </td>
                    {/* <td>{booking.therapistName}</td> */}
                    <td className="min-w-[180px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                          <span className="font-medium truncate">
                            {booking.scheduledDate
                              ? booking.scheduledDate
                              : booking.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {booking.scheduledTime
                              ? booking.scheduledTime
                              : new Date(
                                  booking.purchaseDate
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                          </span>
                        </div>
                        {/* <div className="text-xs text-muted-foreground">
                          {booking.scheduleType === "later"
                            ? "Scheduled later"
                            : "Scheduled now"}
                        </div> */}
                      </div>
                    </td>

                    {/* <td className="min-w-[120px]">
                      {booking.bookingType === 'subscription-covered' ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-100 whitespace-nowrap">
                          Subscription
                        </span>
                      ) : booking.bookingType === 'free-consultation' ? (
                        booking.isServiceExpired ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold text-red-600 bg-red-100 whitespace-nowrap">
                            Expired
                          </span>
                        ) : booking.serviceExpiryDate ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold text-purple-600 bg-purple-100 whitespace-nowrap">
                            {new Date(
                              booking.serviceExpiryDate
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold text-purple-600 bg-purple-100 whitespace-nowrap">
                            Free Consultation
                          </span>
                        )
                      ) : booking.isServiceExpired ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-red-600 bg-red-100 whitespace-nowrap">
                          Expired
                        </span>
                      ) : booking.serviceExpiryDate ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-green-600 bg-green-100 whitespace-nowrap">
                          {new Date(
                            booking.serviceExpiryDate
                          ).toLocaleDateString()}
                        </span>
                      ) : booking.serviceValidityDays && (booking.scheduledDate || booking.purchaseDate) ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-blue-600 bg-blue-100 whitespace-nowrap">
                          {new Date(
                            new Date(booking.scheduledDate || booking.purchaseDate).getTime() + (booking.serviceValidityDays * 24 * 60 * 60 * 1000)
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-gray-600 bg-gray-100 whitespace-nowrap">
                          No Expiry
                        </span>
                      )}
                    </td> */}
                    <td className="min-w-[140px]">
                      <Select
                        value={booking.status}
                        disabled={
                          booking.status === "cancelled" ||
                          updatingStatusId === (booking._id || booking.id)
                        }
                        onValueChange={async (value) => {
                          const bookingId = booking._id || booking.id;
                          setUpdatingStatusId(bookingId);

                          // Check if we're changing from pending to confirmed
                          const wasPending = booking.status === "pending";
                          const isNowConfirmed = value === "confirmed";

                          try {
                            // Update booking status
                            const response = await bookingAPI.updateStatus(
                              bookingId,
                              value
                            );

                            if (response.data.success) {
                              // Refresh the bookings list
                              dispatch(fetchBookings());
                              toast({
                                title: "Booking status updated successfully",
                              });

                              // Switch to sessions tab if changing from pending to confirmed
                              if (
                                wasPending &&
                                isNowConfirmed &&
                                onStatusConfirmed
                              ) {
                                onStatusConfirmed();
                              }
                            } else {
                              throw new Error(
                                response.data.message ||
                                  "Failed to update status"
                              );
                            }
                          } catch (error: any) {
                            console.error(
                              "Error updating booking status:",
                              error
                            );
                            toast({
                              title:
                                error.response?.data?.message ||
                                error.message ||
                                "Failed to update status",
                              variant: "destructive",
                            });
                          } finally {
                            setUpdatingStatusId(null);
                          }
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full capitalize rounded-lg bg-transparent border-none outline-none",
                            getStatusBadge(booking.status, booking.bookingType)
                          )}
                        >
                          {updatingStatusId === (booking._id || booking.id) ? (
                            <div className="flex items-center gap-2">
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {booking.bookingType === "free-consultation" ? (
                            booking.status === "confirmed" ? (
                              <>
                                <SelectItem value="confirmed">
                                  Accept
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">
                                  Accept
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </>
                            )
                          ) : booking.status === "confirmed" ? (
                            <>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Link to={`/bookings/${booking._id || booking.id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 flex-shrink-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {/* Reschedule Button */}
                        {/* {booking.status !== "cancelled" && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsEditing(true);
                              setNewBookingForm({
                                serviceId:
                                  booking.serviceId?._id ||
                                  booking.serviceId ||
                                  "",
                                date:
                                  booking.scheduledDate || booking.date || "",
                                time:
                                  booking.scheduledTime || booking.time || "",
                                notes: booking.notes || "",
                                clientName: booking.clientName || "",
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(
                  startIndex + bookingsPerPage,
                  filteredBookings.length
                )}
              </span>{" "}
              of <span className="font-medium">{filteredBookings.length}</span>{" "}
              bookings
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
                disabled={servicesLoading}
              >
                <option value="">Select a service</option>

                {(services ?? []).map((service) => (
                  <option
                    key={service._id || service.id}
                    value={service._id || service.id}
                  >
                    {service.name} - {service.duration} mins - ₹{service.price}
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
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setBookingForm({
                      ...bookingForm,
                      date: dateValue,
                    });
                    setSelectedDate(dateValue);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2 w-full">
                <label className="text-sm font-medium">Time Slot</label>
                {availableTimeSlots.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {availableTimeSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setBookingForm({
                              ...bookingForm,
                              time: `${slot.start}-${slot.end}`,
                            });
                          }}
                          className={cn(
                            "p-2 rounded-lg border text-sm font-medium transition-all",
                            bookingForm.time === `${slot.start}-${slot.end}`
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <div>
                            {slot.start} - {slot.end}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {slot.duration} min{" "}
                            {slot.bookingType === "free-consultation"
                              ? "(Free)"
                              : "(Regular)"}
                          </div>
                        </button>
                      ))}
                    </div>
                    {isLoadingAvailability && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Loading available slots...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="time"
                      value={bookingForm.time.split("-")[0] || ""}
                      onChange={(e) => {
                        const startTime = e.target.value;
                        const endTime = new Date(`2000-01-01T${startTime}`);
                        endTime.setMinutes(endTime.getMinutes() + 45); // Default 45 min duration
                        const endTimeString = endTime
                          .toTimeString()
                          .substring(0, 5);
                        setBookingForm({
                          ...bookingForm,
                          time: `${startTime}-${endTimeString}`,
                        });
                      }}
                      placeholder="Start time"
                    />
                    {bookingForm.time && (
                      <div className="text-sm text-muted-foreground">
                        Duration: 45 minutes (ends at{" "}
                        {bookingForm.time.split("-")[1]})
                      </div>
                    )}
                    {selectedDate &&
                      !isLoadingAvailability &&
                      availableTimeSlots.length === 0 && (
                        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          No available time slots found for this date. You can
                          still create a booking with manual time entry.
                        </div>
                      )}
                    {isLoadingAvailability && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Checking availability...
                      </div>
                    )}
                  </div>
                )}
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
                disabled={usersLoading}
              >
                <option value="">Select a client</option>

                {(users ?? []).map((user) => {
                  const displayName = user.name || user.email;
                  const userId = user._id || user.id;
                  return (
                    <option key={userId} value={displayName}>
                      {displayName} ({user.email})
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
                !bookingForm.time ||
                isCreating
              }
            >
              {isCreating ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : isEditing ? (
                "Update Booking"
              ) : (
                "Create Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
