import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, DollarSign, User, Mail, Phone, Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, RotateCcw, RefreshCw, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector, useDispatch } from 'react-redux';
import { fetchPaymentById } from '@/features/payments/paymentSlice';
import PageLoader from "@/components/PageLoader";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImage from '@/assets/logo_pdf.png'; // Changed from logo.webp to logo.png

interface Payment {
  _id: string;
  bookingId: {
    _id: string;
    serviceName: string;
    therapistName: string;
    date: string;
    time: string;
    status: string;
    paymentStatus: string;
    clientName: string;
    purchaseDate: string;
    serviceExpiryDate: string;
    serviceValidityDays: number;
  } | string; // Can be string ID if not populated
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
  } | string; // Can be string ID if not populated
  subscriptionId?: {
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    nextBillingDate: string;
  } | string; // Can be string ID if not populated
  guestName?: string;
  guestEmail?: string;
  amount: number;
  currency: string;
  status: "created" | "captured" | "failed" | "refunded" | "disputed" | "pending" | "successful" | "paid";
  method?: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for subscription payments from backend
  planName?: string;
  therapistName?: string;
  scheduleType?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  orderId?: string;
  paymentId?: string;
}

export default function PaymentDetails() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singlePayment, loading, error } = useSelector(
    (state: any) => state.payments,
  );
  const payment: Payment | null =
    singlePayment?.data?.payment || singlePayment?.payment || null;

  // Currency symbol based on currency code
  const getCurrencySymbol = (currency: string) => {
    return currency === "USD" ? "$" : "₹";
  };

  useEffect(() => {
    if (paymentId) {
      dispatch(fetchPaymentById(paymentId));
    }
  }, [dispatch, paymentId]);

  // Function to generate and download receipt as PDF
  const handleDownloadReceipt = () => {
    if (!payment) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Load and add logo with better quality
    try {
      // Logo dimensions and position - centered at top
      const logoWidth = 60;
      const logoHeight = 25;
      const logoX = (pageWidth - logoWidth) / 2; // Center the logo
      const logoY = 15;

      // Add logo image to PDF with JPEG format for better quality
      doc.addImage(logoImage, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Add subtitle below logo
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(249, 115, 22); // Orange color
      doc.text("Payment Receipt", pageWidth / 2, logoY + logoHeight + 8, {
        align: "center",
      });
    } catch (error) {
      console.error("Error loading logo:", error);
      // Fallback to text-only header if logo fails
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, pageWidth, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("TANISH PHYSIO", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Payment Receipt", pageWidth / 2, 24, { align: "center" });
    }

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Receipt Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt ID: ${payment._id.substring(0, 12)}...`, 14, 40);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`, 14, 46);
    doc.text(`Status: ${payment.status.toUpperCase()}`, pageWidth - 14, 40, {
      align: "right",
    });

    // Payment Details Table
    autoTable(doc, {
      startY: 55,
      head: [["Payment Details", ""]],
      body: [
        [
          "Amount Paid",
          `${getCurrencySymbol(payment.currency)}${payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        ],
        ["Currency", payment.currency],
        ["Payment Method", payment.paymentMethod || payment.method || "N/A"],
        ["Order ID", payment.orderId || payment.razorpayOrderId || "N/A"],
        ["Payment ID", payment.paymentId || payment.razorpayPaymentId || "N/A"],
      ],
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] }, // Orange header
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });

    // Customer Details
    const customerY = (doc as any).lastAutoTable.finalY + 15;
    autoTable(doc, {
      startY: customerY,
      head: [["Customer Information", ""]],
      body: [
        [
          "Name",
          typeof payment.userId === "object"
            ? payment.userId?.name
            : payment.guestName || "N/A",
        ],
        [
          "Email",
          typeof payment.userId === "object"
            ? payment.userId?.email
            : payment.guestEmail || "N/A",
        ],
        [
          "Phone",
          typeof payment.userId === "object" ? payment.userId?.phone : "N/A",
        ],
        [
          "Role",
          typeof payment.userId === "object" ? payment.userId?.role : "N/A",
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] }, // Orange header
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });

    // Service/Subscription Details
    const serviceY = (doc as any).lastAutoTable.finalY + 15;
    const serviceTitle =
      payment.planName || payment.subscriptionId
        ? "Subscription Details"
        : "Booking Details";
    const serviceName =
      payment.planName ||
      (typeof payment.bookingId === "object"
        ? payment.bookingId?.serviceName
        : "N/A");

    autoTable(doc, {
      startY: serviceY,
      head: [[serviceTitle, ""]],
      body: [
        [
          payment.planName || payment.subscriptionId
            ? "Plan Name"
            : "Service Name",
          serviceName,
        ],
        ...(payment.therapistName
          ? [["Therapist", payment.therapistName]]
          : []),
        ...(payment.scheduleType
          ? [["Schedule Type", payment.scheduleType]]
          : []),
        ...(payment.scheduledDate
          ? [
              [
                "Scheduled Date",
                new Date(payment.scheduledDate).toLocaleDateString(),
              ],
            ]
          : []),
        ...(payment.scheduledTime
          ? [["Scheduled Time", payment.scheduledTime]]
          : []),
      ],
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] }, // Orange header
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });

    // Footer with gradient-like effect
    const footerY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFillColor(249, 115, 22); // Orange footer
    doc.rect(0, footerY, pageWidth, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Thank you for choosing Tanish Physio!",
      pageWidth / 2,
      footerY + 10,
      { align: "center" },
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      "For any queries, please contact our support team.",
      pageWidth / 2,
      footerY + 16,
      { align: "center" },
    );

    // Save the PDF
    const fileName = `receipt_${payment._id.substring(0, 8)}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading && !payment) {
    return <PageLoader text="Loading payment details..." />;
  }

  if (error && !payment) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Error Loading Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "captured":
      case "successful":
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-orange-100 text-orange-700";
      case "disputed":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
      case "created":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "card":
      case "credit_card":
      case "debit_card":
        return <CreditCard className="w-4 h-4" />;
      case "upi":
        return <FileText className="w-4 h-4" />;
      case "netbanking":
        return <MapPin className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Payments
        </Button>
        <h1 className="text-2xl font-bold">Payment Details</h1>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                Payment #{payment._id.substring(0, 8)}
              </h2>
              <p className="text-muted-foreground">
                Transaction ID: {payment.razorpayPaymentId || payment._id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusBadge(payment.status)}>
                {payment.status.charAt(0).toUpperCase() +
                  payment.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <Info icon={<DollarSign />} label="Amount">
            {getCurrencySymbol(payment.currency)}
            {payment.amount.toFixed(2)}
          </Info>
          <Info icon={<Calendar />} label="Date">
            {new Date(payment.createdAt).toLocaleDateString()}
          </Info>
          <Info icon={<Clock />} label="Time">
            {new Date(payment.createdAt).toLocaleTimeString()}
          </Info>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <User /> Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Name"
                value={
                  typeof payment.userId === "object" && payment.userId
                    ? payment.userId.name
                    : payment.guestName || "N/A"
                }
              />
              <Row
                label="Email"
                value={
                  typeof payment.userId === "object" && payment.userId
                    ? payment.userId.email
                    : payment.guestEmail || "N/A"
                }
              />
              <Row
                label="Phone"
                value={
                  typeof payment.userId === "object" && payment.userId
                    ? payment.userId.phone
                    : "N/A"
                }
              />
              <Row
                label="Role"
                value={
                  typeof payment.userId === "object" && payment.userId
                    ? payment.userId.role
                    : "N/A"
                }
              />
              <Row
                label="Account Created"
                value={
                  typeof payment.userId === "object" && payment.userId
                    ? new Date(payment.userId.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
            </CardContent>
          </Card>

          {/* Booking/Subscription Details */}
          {(payment.bookingId ||
            payment.subscriptionId ||
            payment.planName) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2">
                  <FileText />{" "}
                  {payment.planName || payment.subscriptionId
                    ? "Subscription Details"
                    : "Booking Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.planName || payment.subscriptionId ? (
                  <>
                    <Row
                      label="Plan Name"
                      value={
                        payment.planName ||
                        (typeof payment.subscriptionId === "object" &&
                        payment.subscriptionId
                          ? payment.subscriptionId.planName
                          : "N/A")
                      }
                    />
                    <Row
                      label="Therapist"
                      value={payment.therapistName || "N/A"}
                    />
                    <Row
                      label="Schedule Type"
                      value={payment.scheduleType || "N/A"}
                    />
                    {payment.scheduledDate && (
                      <Row
                        label="Scheduled Date"
                        value={new Date(
                          payment.scheduledDate,
                        ).toLocaleDateString()}
                      />
                    )}
                    {payment.scheduledTime && (
                      <Row
                        label="Scheduled Time"
                        value={payment.scheduledTime}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Row
                      label="Service Name"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.serviceName
                          : "N/A"
                      }
                    />
                    <Row
                      label="Therapist"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.therapistName || "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Date"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.date
                            ? new Date(
                                payment.bookingId.date,
                              ).toLocaleDateString()
                            : "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Time"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.time || "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Status"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.status || "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Payment Status"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.paymentStatus || "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Purchase Date"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.purchaseDate
                            ? new Date(
                                payment.bookingId.purchaseDate,
                              ).toLocaleDateString()
                            : "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Service Expiry"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.serviceExpiryDate
                            ? new Date(
                                payment.bookingId.serviceExpiryDate,
                              ).toLocaleDateString()
                            : "N/A"
                          : "N/A"
                      }
                    />
                    <Row
                      label="Validity (Days)"
                      value={
                        typeof payment.bookingId === "object" &&
                        payment.bookingId
                          ? payment.bookingId.serviceValidityDays?.toString() ||
                            "N/A"
                          : "N/A"
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Amount"
                value={`${getCurrencySymbol(payment.currency)}${payment.amount}`}
              />
              <Row label="Currency" value={payment.currency} />
              <Row
                label="Type"
                value={
                  payment.planName || payment.subscriptionId
                    ? "Subscription Payment"
                    : "Service Booking Payment"
                }
              />
              {payment.planName || payment.subscriptionId ? (
                <Row
                  label="Plan"
                  value={
                    payment.planName ||
                    (typeof payment.subscriptionId === "object" &&
                    payment.subscriptionId
                      ? payment.subscriptionId.planName
                      : "N/A")
                  }
                />
              ) : (
                <Row
                  label="Service"
                  value={
                    typeof payment.bookingId === "object" && payment.bookingId
                      ? payment.bookingId.serviceName
                      : "N/A"
                  }
                />
              )}
              <Row
                label="Method"
                value={
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(
                      payment.paymentMethod || payment.method || "",
                    )}
                    {payment.paymentMethod || payment.method || "N/A"}
                  </div>
                }
              />
              <Row label="Order ID" value={payment?.orderId || "N/A"} />
              <Row label="Payment ID" value={payment?.paymentId || "N/A"} />
              <Row
                label="Created"
                value={new Date(payment.createdAt).toLocaleString()}
              />
              <Row
                label="Updated"
                value={new Date(payment.updatedAt).toLocaleString()}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleDownloadReceipt}>
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              {payment.status === "captured" && (
                <Button variant="destructive" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Issue Refund
                </Button>
              )}
              {payment.status === "disputed" && (
                <Button className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resolve Dispute
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value}
      </span>
    </div>
  );
}