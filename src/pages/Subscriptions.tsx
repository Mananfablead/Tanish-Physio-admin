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
  period?: string;
  duration?: string;
  autoRenew?: boolean;
  subscribers?: number;
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
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for the plan form
  const [planForm, setPlanForm] = useState({
    name: "",
    price: 0,
    description: "",
    status: "active", // Using status instead of active
    features: [""], // Array of features
    duration: "",
    autoRenew: true,
  });

  useEffect(() => {
    dispatch(fetchAllSubscriptionPlans());
    dispatch(fetchAllUserSubscriptions());
  }, [dispatch]);

  const filteredSubscriptions = Array.isArray(userSubscriptions)
    ? userSubscriptions.filter(
        (sub) =>
          sub.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  console.log("filteredSubscriptions", filteredSubscriptions);
  // Calculate stats from actual plans
  const totalSubscribers = plans.reduce(
    (acc: number, plan: SubscriptionPlan) => acc + (plan.subscribers || 0),
    0
  );
  const totalRevenue = plans.reduce(
    (acc: number, plan: SubscriptionPlan) => acc + plan.price,
    0
  ); // Using actual plan prices

  // Populate form when selectedPlan changes (for editing)
  useEffect(() => {
    if (selectedPlan) {
      setPlanForm({
        name: selectedPlan.name || "",
        price: selectedPlan.price || 0,
        description: selectedPlan.description || "",
        status: selectedPlan.status || "active",
        features: selectedPlan.features || [""],
        duration: selectedPlan.duration || selectedPlan.period || "",
        autoRenew:
          selectedPlan.autoRenew !== undefined ? selectedPlan.autoRenew : true,
      });
    } else if (!isEditPlanOpen) {
      // Reset form when modal is closed
      resetForm();
    }
  }, [selectedPlan, isEditPlanOpen]);

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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      if (name === "status") {
        setPlanForm((prev) => ({
          ...prev,
          [name]: target.checked ? "active" : "inactive",
        }));
      } else {
        setPlanForm((prev) => ({
          ...prev,
          [name]: target.checked,
        }));
      }
    } else {
      setPlanForm((prev) => ({
        ...prev,
        [name]: name === "price" ? Number(value) : value,
      }));
    }
  };

  // Handle feature changes
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  // Add a new feature input
  const addFeature = () => {
    setPlanForm((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  // Remove a feature
  const removeFeature = (index: number) => {
    if (planForm.features.length <= 1) return;
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  // Reset form
  const resetForm = () => {
    setPlanForm({
      name: "",
      price: 0,
      description: "",
      status: "active",
      features: [""],
      duration: "",
      autoRenew: true,
    });
    setSelectedPlan(null);
  };

  // Handle save plan (update only)
  const handleSavePlan = async () => {
    try {
      if (selectedPlan) {
        // Update existing plan - format data according to API expectation
        const updateData = {
          name: planForm.name,
          price: planForm.price,
          description: planForm.description,
          status: planForm.status,
          duration: planForm.duration,
          features: planForm.features,
          autoRenew: planForm.autoRenew,
        };
        const result = await dispatch(
          updateSubscriptionPlan({
            id: selectedPlan._id || selectedPlan.id,
            planData: updateData,
          })
        );

        if (updateSubscriptionPlan.fulfilled.match(result)) {
          toast({
            title: "Success",
            description: "Subscription plan updated successfully!",
          });
          setIsEditPlanOpen(false);
          resetForm();
          dispatch(fetchAllSubscriptionPlans());
        }
      }
    } catch (err: any) {
      console.error("Error saving subscription plan:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save subscription plan",
        variant: "destructive",
      });
    }
  };

  // Handle delete plan - opens confirmation dialog
  const handleDeletePlan = (planId: string) => {
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

          <Button className="gap-2" asChild>
            <Link to="/add-subscription">
              <Plus className="w-4 h-4" />
              Create Plan
            </Link>
          </Button>
        </div>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
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
                      "status-badge",
                      plan.status === "active"
                        ? "status-active"
                        : "status-inactive"
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
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-renew</span>
                    <span className="text-success">
                      {plan.autoRenew ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subscribers</span>
                    <span className="font-medium">{plan.subscribers || 0}</span>
                  </div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                      setIsEditPlanOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {/* DELETE */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan._id || plan.id);
                    }}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* User Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Sessions Used</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub, index) => {
                    console.log("Subscription Row:", index, sub);

                    return (
                      <tr key={sub._id}>
                        {/* USER */}
                        <td>
                          <div>
                            <p className="font-medium">
                              {sub.userId?.name || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {sub.userId?.email || "N/A"}
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
                          {sub.planId === "monthly"
                            ? new Date(
                                new Date(sub.startDate).setDate(
                                  new Date(sub.startDate).getDate() + 30
                                )
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* SESSIONS */}
                        <td>—</td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={cn(
                              "status-badge",
                              sub.status === "active"
                                ? "status-active"
                                : "status-inactive"
                            )}
                          >
                            {sub.status}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td>
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {filteredSubscriptions.length}
                </span>{" "}
                subscriptions
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

      {/* Edit/Create Plan Modal */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? "Update the subscription plan details."
                : "Set up a new subscription plan."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Monthly Plan"
                value={planForm.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="49.99"
                  value={planForm.price}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  name="duration"
                  value={planForm.duration}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the subscription plan"
                value={planForm.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                >
                  Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {planForm.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    {planForm.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        className="h-9 w-9"
                      >
                        <span className="text-red-500">-</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Renew</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically renew at end of period
                </p>
              </div>
              <Switch
                id="autoRenew"
                name="autoRenew"
                checked={planForm.autoRenew}
                onCheckedChange={(checked) =>
                  setPlanForm((prev) => ({ ...prev, autoRenew: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Plan is available for purchase
                </p>
              </div>
              <Switch
                id="status"
                name="status"
                checked={planForm.status === "active"}
                onCheckedChange={(checked) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    status: checked ? "active" : "inactive",
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditPlanOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
