import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, DollarSign, CheckCircle, XCircle, RefreshCw, Eye, RotateCcw, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const mockPayments = [
  { id: "PAY-001", user: "John Doe", email: "john@example.com", amount: 49.99, plan: "Monthly Plan", date: "2024-03-18", status: "successful", method: "Credit Card" },
  { id: "PAY-002", user: "Emily Parker", email: "emily@example.com", amount: 29.99, plan: "Weekly Plan", date: "2024-03-18", status: "successful", method: "PayPal" },
  { id: "PAY-003", user: "Mike Wilson", email: "mike@example.com", amount: 49.99, plan: "Monthly Plan", date: "2024-03-17", status: "failed", method: "Credit Card" },
  { id: "PAY-004", user: "Anna Smith", email: "anna@example.com", amount: 79.99, plan: "Premium Monthly", date: "2024-03-17", status: "successful", method: "Credit Card" },
  { id: "PAY-005", user: "Robert Brown", email: "robert@example.com", amount: 9.99, plan: "Daily Pass", date: "2024-03-16", status: "refunded", method: "Credit Card" },
  { id: "PAY-006", user: "Lisa Anderson", email: "lisa@example.com", amount: 49.99, plan: "Monthly Plan", date: "2024-03-16", status: "successful", method: "Apple Pay" },
  { id: "PAY-007", user: "David Lee", email: "david@example.com", amount: 29.99, plan: "Weekly Plan", date: "2024-03-15", status: "disputed", method: "Credit Card" },
  { id: "PAY-008", user: "Sarah Taylor", email: "sarah@example.com", amount: 49.99, plan: "Monthly Plan", date: "2024-03-15", status: "successful", method: "Credit Card" },
];

type PaymentStatus = "successful" | "failed" | "refunded" | "disputed";

const filters = ["All", "Successful", "Failed", "Refunded", "Disputed"];

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "successful":
        return "status-active";
      case "failed":
        return "status-rejected";
      case "refunded":
        return "status-inactive";
      case "disputed":
        return "status-pending";
      default:
        return "status-inactive";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "successful":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <RotateCcw className="w-4 h-4" />;
      case "disputed":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "All") return matchesSearch;
    return matchesSearch && payment.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const stats = {
    total: mockPayments.filter(p => p.status === "successful").reduce((acc, p) => acc + p.amount, 0),
    successful: mockPayments.filter(p => p.status === "successful").length,
    failed: mockPayments.filter(p => p.status === "failed").length,
    refunded: mockPayments.filter(p => p.status === "refunded").reduce((acc, p) => acc + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">Track and manage all platform transactions</p>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "filter-button",
                activeFilter === filter && "filter-button-active"
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
      <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-mono text-sm">{payment.id}</td>
                  <td>
                    <div>
                      <p className="font-medium">{payment.user}</p>
                      <p className="text-sm text-muted-foreground">{payment.email}</p>
                    </div>
                  </td>
                  <td>{payment.plan}</td>
                  <td className="font-semibold">₹{payment.amount}</td>
                  <td className="text-muted-foreground">{payment.method}</td>
                  <td className="text-muted-foreground">{payment.date}</td>
                  <td>
                    <span className={cn("status-badge inline-flex items-center gap-1", getStatusBadge(payment.status as PaymentStatus))}>
                      {getStatusIcon(payment.status as PaymentStatus)}
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {payment.status === "successful" && (
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
            Showing <span className="font-medium">{filteredPayments.length}</span> of{" "}
            <span className="font-medium">{mockPayments.length}</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="min-w-[32px]">1</Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

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
                    <span className="ml-2 font-mono">{selectedPayment.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-semibold">₹{selectedPayment.amount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User:</span>
                    <span className="ml-2">{selectedPayment.user}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="ml-2">{selectedPayment.plan}</span>
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
                    <span className="ml-2 font-mono">{selectedPayment.id}</span>
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
