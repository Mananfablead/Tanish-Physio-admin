import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  Eye,
  Trash2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useToast } from "@/hooks/use-toast";
import {
  fetchSubscriptionPlans,
  createSubscriptionOrder,
  fetchAllSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  fetchSubscriptionPlanById,
  fetchAllUserSubscriptions,
} from "@/features/subscriptions/subscriptionSlice";
import PageLoader from "@/components/PageLoader";

interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  status?: string;
  active?: boolean;
  sessions?: number;
  validity?: number;
  period?: string;
  duration?: string;
  autoRenew?: boolean;
  subscribers?: number;
  subscriberCount?: number;
}

export default function Subscriptions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, userSubscriptions, loading, error, order } = useSelector(
    (state: any) => state.subscriptions
  );
  const { toast } = useToast();
  console.log("userSubscriptions", userSubscriptions);
  const [activeTab, setActiveTab] = useState("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllSubscriptionPlans());
    dispatch(fetchAllUserSubscriptions());
  }, [dispatch]);

const filteredSubscriptions = Array.isArray(userSubscriptions)
  ? userSubscriptions.filter((sub) => {
      if (!searchQuery.trim()) return true;

      const name = sub.userId?.name?.toLowerCase() || "";
      const email = sub.userId?.email?.toLowerCase() || "";

      return (
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase())
      );
    })
  : [];


    console.log("filteredSubscriptions", filteredSubscriptions);
  // Calculate stats from actual plans
  const totalSubscribers =
    userSubscriptions?.filter(
      (sub) => sub.status?.toLowerCase() === "active"
    ).length || 0;

  const totalRevenue = plans.reduce(
    (acc: number, plan: SubscriptionPlan) => acc + plan.price,
    0
  ); // Using actual plan prices

  const initializeRazorpayPayment = (orderData: any) => {
    // This function would initialize the Razorpay checkout
    // For now, we'll just show an alert
    if ((window as any).Razorpay) {
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Tanish Physio",
        description: "Subscription Payment",
        order_id: orderData.orderId,
        handler: function (response: any) {
          console.log("Payment successful:", response);
          toast({
            title: "Payment Successful",
            description: "Your subscription has been successfully processed!",
          });
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Fallback for testing without Razorpay SDK
      alert(`Payment gateway would open for order: ₹{orderData.orderId}`);
    }
  };

  // Check if a plan has subscribers
  const hasSubscribers = (planId: string) => {
    const plan = plans.find(p => p._id === planId || p.id === planId);
    return (plan?.subscriberCount || 0) > 0;
  };

  // Handle delete plan - opens confirmation dialog
  const handleDeletePlan = (planId: string) => {
    const planHasSubscribers = hasSubscribers(planId);

    if (planHasSubscribers) {
      toast({
        title: "Cannot Delete Plan",
        description: "This plan has active subscribers and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setDeletePlanId(planId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete plan
  const confirmDeletePlan = async () => {
    if (!deletePlanId) return;

    try {
      const result = await dispatch(deleteSubscriptionPlan(deletePlanId));

      if (deleteSubscriptionPlan.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Subscription plan deleted successfully!",
        });
        dispatch(fetchAllSubscriptionPlans());
      } else {
        throw new Error(result.payload || "Failed to delete subscription plan");
      }
    } catch (err: any) {
      console.error("Error deleting subscription plan:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete subscription plan",
        variant: "destructive",
      });
    } finally {
      setDeletePlanId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Cancel delete plan
  const cancelDeletePlan = () => {
    setDeletePlanId(null);
    setIsDeleteDialogOpen(false);
  };
  if (loading || !plans) {
    return <PageLoader text="Loading plans..." />;
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Subscription Management</h1>
          <p className="page-subtitle">Manage plans and user subscriptions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {loading ? "..." : plans.length}
              </p>
              <p className="text-sm text-muted-foreground">Active Plans</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {totalSubscribers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
          </TabsList>
          {plans.length < 3 && (
            <Button className="gap-2" asChild>
              <Link to="/add-subscription">
                <Plus className="w-4 h-4" />
                Create Plan
              </Link>
            </Button>
          )}


        </div>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <div
                  className={cn(
                    "bg-card rounded-lg border p-5 transition-all duration-200 animate-fade-in",
                    "border-border hover:border-primary/30 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        plan.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {plan.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-3xl font-bold">₹{plan.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.features && plan.features.length > 0
                        ? `${plan.features.length} features`
                        : "Basic plan"}
                    </p>
                    {plan.sessions !== undefined && plan.sessions > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Sessions:</span>
                          <span className="font-medium">{plan.sessions} total</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                      <span className="text-black font-bold">Plan Type</span>
                      <span className="font-bold uppercase">{plan.planId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subscribers</span>
                      <span className="font-medium">{plan.subscriberCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sessions</span>
                      <span className="font-medium">{plan.sessions || 'Unlimited'}</span>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{plan.duration || 'N/A'}</span>
                    </div> */}
                    
                  </div>

                  <div className="flex gap-2 justify-end">
                    {/* VIEW */}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link to={`/subscriptions/${plan._id || plan.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    {/* EDIT */}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/subscriptions/edit/${plan._id || plan.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </Button>
                    {/* DELETE - disabled if plan has subscribers */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan._id || plan.id);
                      }}
                      disabled={loading || hasSubscribers(plan._id || plan.id)}
                      title={hasSubscribers(plan._id || plan.id) ? "Cannot delete plan with active subscribers" : "Delete plan"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Subscription Plans</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first subscription plan.</p>
                <Button asChild>
                  <Link to="/add-subscription">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* User Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={filteredSubscriptions.length > 0 ? "Search by user or email..." : "No subscriptions available"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={filteredSubscriptions.length === 0}
            />
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              {filteredSubscriptions.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Subscription Sessions</th>
                      {/* <th>Service Sessions</th> */}
                      <th>Status</th>
                      {/* <th>Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((sub, index) => {

                      return (
                        <tr key={sub._id}>
                          {/* USER */}
                          <td>
                            <div>
                              <p className="font-bold">
                                {sub.userId?.name ||sub.guestName}
                              </p>
                              <p className="text-sm text-medium">
                                {sub.userId?.email || sub.guestEmail}
                              </p>
                            </div>
                          </td>

                          {/* PLAN NAME */}
                          <td className="font-medium">{sub.planName}</td>

                          {/* START DATE */}
                          <td className="text-muted-foreground">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </td>

                          {/* END DATE */}
                          <td className="text-muted-foreground">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </td>

                          {/* SUBSCRIPTION SESSIONS */}
                          <td>
                            {sub.availableSessions ? (
                              <div className="text-center">
                                <span className="font-medium">
                                  {sub.availableSessions.used}/{sub.availableSessions.total}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {sub.availableSessions.remaining} left
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                sub.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              )}
                            >
                              {sub.status}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          {/* <td>
                          <div className="flex items-center gap-2">
                            {sub.status === "active" ? (
                              <>
                                <Button variant="ghost" size="sm">
                                  Pause
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" size="sm">
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No User Subscriptions</h3>
                  <p className="text-muted-foreground">No users have subscribed to any plans yet.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {filteredSubscriptions.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-medium">
                      {filteredSubscriptions.length}
                    </span>{" "}
                    subscriptions
                  </>
                ) : (
                  "No subscriptions to display"
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="min-w-[32px]">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              subscription plan and remove it from all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeletePlan}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}