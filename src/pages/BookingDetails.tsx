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
                {booking.serviceName || "N/A"}
              </h2>
              <p className="text-muted-foreground">
                Booking ID: {booking._id || booking.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusBadge(booking.status || "")}>
                {booking.status || "N/A"}
              </Badge>
              <Badge className={getPaymentBadge(booking.paymentStatus || "")}>
                {booking.paymentStatus || "N/A"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <Info icon={<Calendar />} label="Date">
            {booking.date ? new Date(booking.date).toDateString() : "N/A"}
          </Info>
          <Info icon={<Clock />} label="Time">
            {booking.time || "N/A"}
          </Info>
          <Info icon={<Package />} label="Duration">
            {booking.serviceId?.duration || "N/A"}
          </Info>
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
              <Row label="Name" value={booking.clientName || "N/A"} />
              <Row label="User ID" value={booking.userId || "N/A"} mono />
            </CardContent>
          </Card>

          {/* Therapist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <User /> Therapist Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Name"
                value={booking.therapistId?.name || "N/A"}
              />
              <Row
                label="Email"
                value={booking.therapistId?.email || "N/A"}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <FileText /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.notes || "No notes"}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                disabled={booking.status === "confirmed"}
                onClick={() => handleStatusChange("confirmed")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </Button>

              <Button
                className="w-full"
                variant="outline"
                disabled={booking.status === "pending"}
                onClick={() => handleStatusChange("pending")}
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                Pending
              </Button>

              <Button
                className="w-full"
                variant="destructive"
                disabled={booking.status === "cancelled"}
                onClick={() => handleStatusChange("cancelled")}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Package /> Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Service Name" value={booking.serviceName || "N/A"} />
              <Row label="Duration" value={booking.serviceId?.duration || "N/A"} />
              <Row label="Price" value={`₹${booking.serviceId?.price || 0}`} />
              <Row label="Validity" value={`${booking.serviceId?.validity || 0} days`} />
              <Row label="Expiry Date" value={booking.serviceExpiryDate ? new Date(booking.serviceExpiryDate).toDateString() : "N/A"} />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <CreditCard /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Amount" value={`₹${booking.amount || 0}`} />
              <Row label="Paid On" value={booking.purchaseDate ? new Date(booking.purchaseDate).toLocaleString() : "N/A"} />
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
