import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchSubscriptionPlanById, 
  updateSubscriptionPlan 
} from "@/features/subscriptions/subscriptionSlice";

interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  status?: string;
  sessions?: number;
  totalService?: number;
  validity?: number;
  period?: string;
  duration?: string;
  autoRenew?: boolean;
  subscriberCount?: number;
  session_type?: string;
  price_inr?: number;
  price_usd?: number;
}

export default function EditSubscription() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plans, loading } = useSelector((state: any) => state.subscriptions);

  const [planForm, setPlanForm] = useState({
    name: "",
    price: 0,
    description: "",
    status: "active",
    features: [""],
    duration: "",
    autoRenew: true,
    sessions: 0,
    totalService: 0,
    session_type: "individual", // New field
    price_inr: 0, // New field
    price_usd: 0, // New field
  });

  const [initialPlan, setInitialPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (id) {
      // Load the specific plan if it's not already in the store
      const plan = plans.find((p: SubscriptionPlan) => p._id === id || p.id === id);
      if (plan) {
        setInitialPlan(plan);
        populateForm(plan);
      } else {
        // If not found in store, fetch it directly
        const fetchPlan = async () => {
          try {
            const result = await dispatch(fetchSubscriptionPlanById(id));
            const plan = result.payload;
            setInitialPlan(plan);
            populateForm(plan);
          } catch (error) {
            console.error("Error fetching plan:", error);
            toast({
              title: "Error",
              description: "Failed to load subscription plan",
              variant: "destructive",
            });
            navigate("/subscriptions");
          }
        };
        fetchPlan();
      }
    }
  }, [id, dispatch, plans, navigate, toast]);

  const populateForm = (plan: SubscriptionPlan) => {
    setPlanForm({
      name: plan.name || "",
      price: plan.price || 0,
      description: plan.description || "",
      status: plan.status || "active",
      features: plan.features || [""],
      duration: plan.duration || plan.period || "",
      autoRenew: plan.autoRenew !== undefined ? plan.autoRenew : true,
      sessions: plan.sessions || 0,
      totalService: plan.totalService || 0,
      session_type: (plan as any).session_type || "individual",
      price_inr: (plan as any).price_inr || 0,
      price_usd: (plan as any).price_usd || 0,
    });
  };

  // Check if a plan has subscribers
  const hasSubscribers = (plan: SubscriptionPlan) => {
    return (plan?.subscriberCount || 0) > 0;
  };

  const planHasSubscribers = initialPlan ? hasSubscribers(initialPlan) : false;

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
        [name]: name === "price" || name === "sessions" || name === "totalService" ? Number(value) : value,
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

  // Handle save plan
  const handleSavePlan = async () => {
    if (!id) return;

    try {
      // Prepare update data
      let updateData: any = {
        name: planForm.name,
        description: planForm.description,
        status: planForm.status,
        duration: planForm.duration,
        features: planForm.features,
        autoRenew: planForm.autoRenew,
        sessions: planForm.sessions,
        
        totalService: planForm.totalService,
        session_type: planForm.session_type,
        price_inr: planForm.price_inr,
        price_usd: planForm.price_usd,
      };

      // Only allow price update if the plan doesn't have subscribers
      if (!planHasSubscribers) {
        updateData.price = planForm.price;
      } else {
        // Show warning if trying to update price for a plan with subscribers
        if (planForm.price !== initialPlan?.price) {
          toast({
            title: "Warning",
            description: "Price cannot be updated for plans with active subscribers. The original price will be preserved.",
            variant: "default",
          });
        }
        // Preserve the original price
        updateData.price = initialPlan?.price;
      }

      const result = await dispatch(
        updateSubscriptionPlan({
          id: id,
          planData: updateData,
        })
      );

      if (updateSubscriptionPlan.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Subscription plan updated successfully!",
        });
        navigate("/subscriptions");
      } else {
        throw new Error(result.payload || "Failed to update subscription plan");
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

  if (!initialPlan && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-0 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Edit Subscription Plan</h1>
          <p className="text-muted-foreground">
            Update subscription plan details
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Back to Plans
        </Button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="border rounded-lg p-6 space-y-4 bg-card">
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

          <div>
            <Label htmlFor="session_type">Session Type</Label>
            <select
              id="session_type"
              name="session_type"
              value={planForm.session_type}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="individual">Individual (1-on-1)</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_inr">Price INR (₹)</Label>
              <Input
                id="price_inr"
                name="price_inr"
                type="number"
                placeholder="2000"
                value={planForm.price_inr || ''}
                onChange={(e) =>
                  setPlanForm((p) => ({
                    ...p,
                    price_inr: Number(e.target.value),
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price_usd">Price USD ($)</Label>
              <Input
                id="price_usd"
                name="price_usd"
                type="number"
                placeholder="800"
                value={planForm.price_usd || ''}
                onChange={(e) =>
                  setPlanForm((p) => ({
                    ...p,
                    price_usd: Number(e.target.value),
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <select
              id="duration"
              name="duration"
              value={planForm.duration}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded"
              disabled={planHasSubscribers}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            {planHasSubscribers && (
              <p className="text-xs text-muted-foreground mt-1">
                Duration cannot be modified for plans with active subscribers
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessions">Number of Sessions</Label>
              <Input
                id="sessions"
                name="sessions"
                type="number"
                placeholder="10"
                value={planForm.sessions || ''}
                onChange={(e) =>
                  setPlanForm((p) => ({
                    ...p,
                    sessions: Number(e.target.value),
                  }))
                }
                className="mt-1"
                disabled={planHasSubscribers}
              />
              {planHasSubscribers && (
                <p className="text-xs text-muted-foreground mt-1">
                  Number of sessions cannot be modified for plans with active subscribers
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="totalService">Total Services</Label>
              <Input
                id="totalService"
                name="totalService"
                type="number"
                placeholder="5"
                value={planForm.totalService || ''}
                onChange={(e) =>
                  setPlanForm((p) => ({
                    ...p,
                    totalService: Number(e.target.value),
                  }))
                }
                className="mt-1"
                disabled={planHasSubscribers}
              />
              {planHasSubscribers && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total services cannot be modified for plans with active subscribers
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="border rounded-lg p-6 space-y-4 bg-card">
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={planForm.description}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded min-h-[80px]"
            />
          </div>
          
          {/* FEATURES */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>Features</Label>
              <Button size="sm" variant="outline" onClick={addFeature}>
                Add
              </Button>
            </div>
            {planForm.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={feature}
                  onChange={(e) =>
                    handleFeatureChange(index, e.target.value)
                  }
                />
                {planForm.features.length > 1 && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeFeature(index)}
                  >
                    −
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Label>Active</Label>
            <Switch
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
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Cancel
        </Button>
        <Button onClick={handleSavePlan} disabled={loading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}