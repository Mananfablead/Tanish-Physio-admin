import { useState, useEffect } from "react";
import { Search, Download, ChevronLeft, ChevronRight, DollarSign, CheckCircle, XCircle, RefreshCw, Eye, RotateCcw, FileText, RefreshCw as RefreshIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPayments } from '@/features/payments/paymentSlice';
import { useNavigate } from 'react-router-dom';

// API Base URL - Update this to your backend URL
const API_BASE_URL = "http://localhost:3000";

interface Payment {
  _id: string;
  bookingId?: {
    _id: string;
    patientName: string;
    patientEmail: string;
    serviceName: string;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
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
  __v?: number;
  // Additional fields for combined payment/subscription display
  isSubscription?: boolean;
  subscriptionId?: string;
  planName?: string;
  therapistName?: string;
  serviceName?: string;
  finalAmount?: number;
  orderId?: string;
  paymentId?: string;
}



type PaymentStatus = "created" | "captured" | "failed" | "refunded" | "disputed" | "pending" | "successful" | "paid";

const filters = ["All", "Successful", "Failed", "Refunded", "Disputed", "Pending"];

export default function Payments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { payments, loading: isLoading, error } = useSelector((state: any) => state.payments);
  console.log(payments);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Set to 10 items per page as requested
  // Load payments on component mount
  useEffect(() => {
    dispatch(fetchAllPayments());
  }, [dispatch]);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "captured":
        return "bg-green-100 text-green-800 border border-green-200";
      case "successful":
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border border-red-200";
      case "refunded":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "disputed":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "created":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "captured":
        return <CheckCircle className="w-4 h-4" />;
      case "successful":
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <RotateCcw className="w-4 h-4" />;
      case "disputed":
        return <RefreshCw className="w-4 h-4" />;
      case "pending":
        return <RefreshIcon className="w-4 h-4" />;
      case "created":
        return <RefreshIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredPayments = payments?.filter((payment: Payment) => {
    const matchesSearch =
      payment.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingId?.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingId?.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "All") return matchesSearch;

    // Handle Successful filter which maps to captured, successful, and paid statuses
    if (activeFilter === "captured" || activeFilter === "successful") {
      return matchesSearch && (payment.status === "captured" || payment.status === "successful" || payment.status === "paid");
    }

    return matchesSearch && payment.status.toLowerCase() === activeFilter.toLowerCase();
  }) || [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const stats = {
    total: payments?.reduce((acc: number, p: Payment) => acc + p.amount, 0) || 0,
    successful: payments?.filter((p: Payment) => p.status === "captured" || p.status === "successful" || p.status === "paid").length || 0,
    failed: payments?.filter((p: Payment) => p.status === "failed").length || 0,
    refunded: payments?.filter((p: Payment) => p.status === "refunded").reduce((acc: number, p: Payment) => acc + p.amount, 0) || 0,
    pending: payments?.filter((p: Payment) => p.status === "pending" || p.status === "created").length || 0,
  };

  // Function to change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Function to go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, dateFilter]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">Track and manage all platform transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => dispatch(fetchAllPayments())}
            disabled={isLoading}
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">₹{stats.total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.successful}</p>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <RotateCcw className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">₹{stats.refunded.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Refunded</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <RefreshIcon className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, email, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                if (filter === "Successful") {
                  setActiveFilter("successful");
                } else {
                  setActiveFilter(filter === "All" ? "All" : filter.toLowerCase());
                }
              }}
              className={cn(
                "filter-button",
                activeFilter === (filter === "Successful" ? "successful" : filter.toLowerCase()) && "filter-button-active"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      {filteredPayments.length > 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {/* <th>Transaction ID</th> */}
                  <th>User</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((payment: Payment) => (
                  <tr key={payment._id}>
                    {/* <td className="font-mono text-sm">{payment._id}</td> */}
                    <td>
                      <div>
                        <p className="font-medium">{payment.userId?.name || payment?.guestName}</p>
                        <p className="text-sm text-muted-foreground">{payment.userId?.email || payment?.guestEmail}</p>
                      </div>
                    </td>
                    <td>
                      {payment.isSubscription ? (
                        <div>
                          <p className="font-medium">{payment.planName || 'Subscription Plan'}</p>
                          {payment.therapistName && payment.therapistName !== 'N/A' && (
                            <p className="text-sm text-muted-foreground">Therapist: {payment.therapistName}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">{payment.serviceName || 'Service Booking'}</p>
                          {payment.therapistName && payment.therapistName !== 'N/A' && (
                            <p className="text-sm text-muted-foreground">Therapist: {payment.therapistName}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">₹{payment.amount}</td>
                    <td className="text-muted-foreground">{payment.paymentMethod}</td>
                    <td className="text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={cn("status-badge inline-flex items-center gap-1 capitalize", getStatusBadge(payment.status as PaymentStatus))}>
                        {getStatusIcon(payment.status as PaymentStatus)}
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/payment-details/${payment._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === "captured" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsRefundModalOpen(true);
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === "disputed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsDisputeModalOpen(true);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{Math.min(indexOfLastItem, filteredPayments.length)}</span> of{" "}
              <span className="font-medium">{filteredPayments.length}</span> transactions
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  // If total pages <= 5, show all pages
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // If near the beginning, show first 5
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // If near the end, show last 5
                  pageNum = totalPages - 4 + i;
                } else {
                  // Otherwise, show current page in the middle
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="min-w-[32px]"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Payments Found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No payments match your search criteria."
              : activeFilter !== "All"
                ? `No ${activeFilter} payments found.`
                : "No payment transactions found in the system."}
          </p>
        </div>
      )}

      {/* Refund Modal */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Process a refund for this transaction. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transaction:</span>
                    <span className="ml-2 font-mono">{selectedPayment._id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-semibold">₹{selectedPayment.amount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User:</span>
                    <span className="ml-2">{selectedPayment.userId?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service:</span>
                    <span className="ml-2">{selectedPayment.bookingId?.serviceName}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Refund Reason</label>
                <Textarea
                  placeholder="Please provide a reason for this refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsRefundModalOpen(false)}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Resolution Modal */}
      <Dialog open={isDisputeModalOpen} onOpenChange={setIsDisputeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Review and resolve this payment dispute.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transaction:</span>
                    <span className="ml-2 font-mono">{selectedPayment._id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-semibold">₹{selectedPayment.amount}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  placeholder="Describe how the dispute was resolved..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsDisputeModalOpen(false)}>
              Refund & Close
            </Button>
            <Button className="bg-success hover:bg-success/90" onClick={() => setIsDisputeModalOpen(false)}>
              Accept Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}