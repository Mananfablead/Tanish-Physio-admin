import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createSubscriptionPlan } from "@/features/subscriptions/subscriptionSlice";
import { Link, useNavigate } from "react-router-dom";

/* ---------------- CONSTANTS ---------------- */



const durationOptions = [
  { label: "One-time", value: "one-time" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Half-yearly", value: "half-yearly" },
  { label: "Yearly", value: "yearly" },
];

/* ---------------- COMPONENT ---------------- */

export default function AddSubscription() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [planForm, setPlanForm] = useState({
    planId: "",
    name: "",
    description: "",
    price: "",
    originalPrice: 0,
    discountPercent: "",
    duration: "monthly",
    validityInMonths: "",
    sessions: "",
    sessionDuration: "",
    session_type: "individual",
    price_inr: "",
    price_usd: "",
    features: [""],
    benefits: [""],
    services: ["Physiotherapy"],
    maxBookingsPerDay: "",
    cancellationWindow: "",
    popular: false,
    autoRenew: true,
    status: "active",
  } as {
    planId: string;
    name: string;
    description: string;
    price: string;
    originalPrice: number;
    discountPercent: string;
    duration: string;
    validityInMonths: string;
    sessions: string;
    totalService: string;
    sessionDuration: string;
    session_type: string;
    price_inr: string;
    price_usd: string;
    features: string[];
    benefits: string[];
    services: string[];
    maxBookingsPerDay: string;
    cancellationWindow: string;
    popular: boolean;
    autoRenew: boolean;
    status: string;
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Update the form state
    setPlanForm(prev => {
      let newState = {
        ...prev,
        [name]: ["price_inr", "price_usd", "originalPrice", "discountPercent", "sessions", "totalService", "sessionDuration", "validityInMonths", "maxBookingsPerDay", "cancellationWindow"].includes(name)
          ? Number(value) || ""
          : value,
      };

      // Auto-populate validityInMonths based on duration
      if (name === 'duration') {
        let validityValue;
        switch(value) {
          case 'one-time': 
            validityValue = 1; // One day validity
            break;
          case 'daily': 
            validityValue = 0.03; // Approx 1 day in months
            break;
          case 'weekly': 
            validityValue = 0.25; // Approx 1 week in months
            break;
          case 'monthly': 
            validityValue = 1;
            break;
          case 'quarterly': 
            validityValue = 3;
            break;
          case 'half-yearly': 
            validityValue = 6;
            break;
          case 'yearly': 
            validityValue = 12;
            break;
          default:
            validityValue = 1;
        }
        newState = {...newState, validityInMonths: validityValue};
      }

      return newState;
    });
  };

  const updateArrayField = (
    field: "features" | "benefits",
    index: number,
    value: string
  ) => {
    const updated = [...planForm[field]];
    updated[index] = value;
    setPlanForm((p) => ({ ...p, [field]: updated }));
  };

  const addArrayItem = (field: "features" | "benefits") =>
    setPlanForm((p) => ({ ...p, [field]: [...p[field], ""] }));

  const removeArrayItem = (field: "features" | "benefits", index: number) =>
    setPlanForm((p) => ({
      ...p,
      [field]: p[field].filter((_, i) => i !== index),
    }));

  const handleSave = async () => {
    const missingFields = [];
    if (!planForm.planId) missingFields.push('Plan ID');
    if (!planForm.name) missingFields.push('Name');
    if (!planForm.price_inr || Number(planForm.price_inr) <= 0) missingFields.push('Price INR');
    if (!planForm.price_usd || Number(planForm.price_usd) <= 0) missingFields.push('Price USD');
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...planForm,
      price: Number(planForm.price_inr),
      originalPrice: Number(planForm.originalPrice),
      discountPercent: Number(planForm.discountPercent),
      sessions: Number(planForm.sessions),
      totalService: Number(planForm.totalService),
      sessionDuration: Number(planForm.sessionDuration),
      validityInMonths: Number(planForm.validityInMonths),
      maxBookingsPerDay: Number(planForm.maxBookingsPerDay),
      cancellationWindow: Number(planForm.cancellationWindow),
      session_type: planForm.session_type,
      price_inr: Number(planForm.price_inr) || 0,
      price_usd: Number(planForm.price_usd) || 0,
    };

    const result = await dispatch(createSubscriptionPlan(payload));

    if (createSubscriptionPlan.fulfilled.match(result)) {
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      navigate("/subscriptions");
    } else {
      console.log("Failed to create subscription plan:", result.payload);
      toast({
        title: "Error",
        description: result.payload || "Failed to create plan",
        variant: "destructive",
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-0 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Add Subscription Plan</h1>
          <p className="text-muted-foreground">
            Create and manage subscription offerings
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/subscriptions">Back</Link>
        </Button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="border rounded-lg p-6 space-y-4 bg-card">
          <div>
            <Label>Plan ID</Label>
            <Input
              name="planId"
              value={planForm.planId}
              onChange={handleChange}
              placeholder="Enter unique plan ID (e.g., premium-monthly-2023)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a unique identifier for this plan. Plan IDs must be unique across all plans.
            </p>
          </div>

          <div>
            <Label>Plan Name</Label>
            <Input name="name" value={planForm.name} onChange={handleChange} />
          </div>

          <div>
            <Label>Session Type</Label>
            <select
              name="session_type"
              value={planForm.session_type}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="individual">Individual (1-on-1)</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price INR (₹)</Label>
              <Input
                name="price_inr"
                type="number"
                value={planForm.price_inr}
                onChange={handleChange}
                placeholder="2000"
              />
            </div>
            <div>
              <Label>Price USD ($)</Label>
              <Input
                name="price_usd"
                type="number"
                value={planForm.price_usd}
                onChange={handleChange}
                placeholder="800"
              />
            </div>
          </div>

          <div>
            <Label>Billing Duration</Label>
            <select
              name="duration"
              value={planForm.duration}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            >
              {durationOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Validity Period (months)</Label>
            <Input
              type="number"
              value={planForm.validityInMonths}
              onChange={handleChange}
              name="validityInMonths"
              placeholder="Enter validity period in months"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Sessions</Label>
              <Input
                type="number"
                value={planForm.sessions}
                onChange={handleChange}
                name="sessions"
                placeholder="Enter the number of sessions"
                min="0"
              />
              {/* <p className="text-xs text-muted-foreground mt-1">
                Enter 0 for unlimited sessions
              </p> */}
            </div>
            
            <div>
              <Label>Total Services</Label>
              <Input
                type="number"
                value={planForm.totalService}
                onChange={handleChange}
                name="totalService"
                placeholder="Enter the number of total services"
                min="0"
              />
            </div>
          </div>
          <div>
            <Label>Session Duration (min)</Label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={planForm.sessionDuration}
              onChange={handleChange}
              name="sessionDuration"
            >
              <option value={15}>15 min</option>
              {/* <option value={30}>30 min</option> */}
              <option value={45}>45 min</option>
              {/* <option value={60}>60 min</option>
              <option value={75}>75 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option> */}
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="border rounded-lg p-6 space-y-4 bg-card">
          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              value={planForm.description}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded min-h-[80px]"
            />
          </div>
          {/* FEATURES */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>Features</Label>
              <Button size="sm" variant="outline" onClick={() => addArrayItem("features")}>
                Add
              </Button>
            </div>
            {planForm.features.map((f, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={f}
                  onChange={(e) =>
                    updateArrayField("features", i, e.target.value)
                  }
                />
                {planForm.features.length > 1 && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeArrayItem("features", i)}
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
              onCheckedChange={(v) =>
                setPlanForm((p) => ({
                  ...p,
                  status: v ? "active" : "inactive",
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link to="/subscriptions">Cancel</Link>
        </Button>
        <Button 
          disabled={
            !planForm.name || 
            !planForm.price_inr || Number(planForm.price_inr) <= 0 || 
            !planForm.price_usd || Number(planForm.price_usd) <= 0 || 
            !planForm.validityInMonths || 
            !planForm.sessionDuration || 
            !planForm.features.length || 
            !planForm.description || 
            !planForm.planId || 
            !planForm.duration
          } 
          onClick={handleSave}
        >
          Create Plan
        </Button>
      </div>
    </div>
  );
}
