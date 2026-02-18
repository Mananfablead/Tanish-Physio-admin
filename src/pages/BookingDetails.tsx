import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ArrowLeft,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  fetchBookingById,
  updateBooking,
} from "@/features/bookings/bookingSlice";
import { toast } from "@/hooks/use-toast";
import PageLoader from "@/components/PageLoader";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const { singleBooking, loading, error } = useSelector(
    (state: any) => state.bookings
  );
console.log("errer",singleBooking)
  // Get the booking from Redux state - it's already extracted from the API response
  const booking = singleBooking?.booking
;

  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (
    newStatus: "confirmed" | "pending" | "cancelled"
  ) => {
    if (!booking) return;

    setStatusLoading(true);
    try {
      await dispatch(
        updateBooking({
          id: booking._id || booking.id,
          bookingData: { status: newStatus },
        })
      );
      toast({ title: "Status updated successfully" });
    } catch (err) {
      toast({
        title: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading && !singleBooking) {
    return <PageLoader text="Loading booking details..." />;
  }

  if (error && !singleBooking) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error Loading Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!singleBooking) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
      </Button>

      {/* Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {typeof booking.serviceName === "string"
                  ? booking.serviceName
                  : booking.serviceName &&
                    typeof booking.serviceName === "object"
                  ? booking.serviceName.name || "N/A"
                  : "N/A"}
              </h2>
              <p className="text-muted-foreground">
                Booking ID:{" "}
                {booking && typeof booking === "object"
                  ? booking._id || booking.id || "N/A"
                  : "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                className={getStatusBadge(
                  typeof booking.status === "string" ? booking.status : ""
                )}
              >
                {typeof booking.status === "string" ? booking.status : "N/A"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <Info icon={<Calendar />} label="Booking Date">
            {booking.date && typeof booking.date !== "object"
              ? new Date(booking.date).toDateString()
              : "N/A"}
          </Info>
          <Info icon={<Clock />} label="Booking Time">
            {typeof booking.time === "string" ? booking.time : "N/A"}
          </Info>
          <Info icon={<Package />} label="Duration">
            {booking.serviceId && typeof booking.serviceId === "object"
              ? booking.serviceId.duration || "N/A"
              : "N/A"}
          </Info>

          {/* Scheduled Session Info */}
          {booking.scheduledDate && (
            <>
              <Info icon={<Calendar />} label="Scheduled Date">
                {booking.scheduledDate &&
                typeof booking.scheduledDate !== "object"
                  ? new Date(booking.scheduledDate).toDateString()
                  : "N/A"}
              </Info>
              <Info icon={<Clock />} label="Scheduled Time">
                {typeof booking.scheduledTime === "string"
                  ? booking.scheduledTime
                  : "N/A"}
              </Info>
              <Info icon={<ClockIcon />} label="Schedule Type">
                {typeof booking.scheduleType === "string"
                  ? booking.scheduleType
                  : "N/A"}
              </Info>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <User /> Client Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Name"
                value={
                  booking.clientName && typeof booking.clientName === "object"
                    ? booking.clientName.name || booking.clientName._id || "N/A"
                    : booking.clientName || "N/A"
                }
              />
              <Row
                label="User Email"
                value={
                  booking.userId && typeof booking.userId === "object"
                    ? booking.userId.email || "N/A"
                    : booking.userId || "N/A"
                }
                mono
              />
            </CardContent>
          </Card>

          {/* Therapist */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <User /> Therapist Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Name"
                value={
                  booking.therapistId && typeof booking.therapistId === "object"
                    ? booking.therapistId.name ||
                      booking.therapistId._id ||
                      "N/A"
                    : booking.therapistId || "N/A"
                }
              />
              <Row
                label="Email"
                value={
                  booking.therapistId && typeof booking.therapistId === "object"
                    ? booking.therapistId.email || "N/A"
                    : booking.therapistId || "N/A"
                }
              />
            </CardContent>
          </Card> */}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <FileText /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof booking.notes === "string"
                ? booking.notes
                : booking.notes && typeof booking.notes === "object"
                ? JSON.stringify(booking.notes)
                : "No notes"}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Status */}

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Package /> Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row
                label="Service Name"
                value={
                  typeof booking.serviceName === "string"
                    ? booking.serviceName
                    : booking.serviceName &&
                      typeof booking.serviceName === "object"
                    ? booking.serviceName.name || "N/A"
                    : "N/A"
                }
              />
              <Row
                label="Duration"
                value={
                  booking.serviceId && typeof booking.serviceId === "object"
                    ? booking.serviceId.duration || "N/A"
                    : "N/A"
                }
              />
              <Row
                label="Price"
                value={`₹${
                  booking.serviceId && typeof booking.serviceId === "object"
                    ? booking.serviceId.price || 0
                    : 0
                }`}
              />
              <Row
                label="Validity"
                value={`${
                  booking.serviceId && typeof booking.serviceId === "object"
                    ? booking.serviceId.validity || 0
                    : 0
                } days`}
              />
              <Row
                label="Expiry Date"
                value={
                  booking.serviceExpiryDate &&
                  typeof booking.serviceExpiryDate !== "object"
                    ? new Date(booking.serviceExpiryDate).toDateString()
                    : "N/A"
                }
              />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <CreditCard /> Payment
                <Badge
                  className={getPaymentBadge(
                    typeof booking.paymentStatus === "string"
                      ? booking.paymentStatus
                      : ""
                  )}
                >
                  {typeof booking.paymentStatus === "string"
                    ? booking.paymentStatus
                    : "N/A"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row
                label="Amount"
                value={`₹${
                  typeof booking.amount === "number"
                    ? booking.amount
                    : typeof booking.amount === "object"
                    ? 0
                    : parseFloat(booking.amount) || 0
                }`}
              />
              <Row
                label="Paid On"
                value={
                  booking.purchaseDate &&
                  typeof booking.purchaseDate !== "object"
                    ? new Date(booking.purchaseDate).toLocaleString()
                    : "N/A"
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Info({ icon, label, children }: any) {
  return (
    <div className="flex gap-3">
      <div className="p-2 bg-primary/10 rounded">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{children}</p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
