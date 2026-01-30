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

const planOptions = [
  { label: "Daily", value: "daily", months: 1 },
  { label: "Weekly", value: "weekly", months: 1 },
  { label: "Monthly", value: "monthly", months: 1 },
  { label: "Quarterly", value: "quarterly", months: 3 },
  { label: "Yearly", value: "yearly", months: 12 },
  { label: "Lifetime", value: "lifetime", months: 999 }, // Representing lifetime as 999 months
];

const durationOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "Lifetime", value: "lifetime" },
  { label: "Custom", value: "custom" },
  { label: "Unlimited", value: "unlimited" },
  { label: "One-time", value: "onetime" },
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
    price: 0,
    originalPrice: 0,
    discountPercent: 0,
    duration: "monthly",
    validityInMonths: 1,
    sessions: 0, // 0 = Unlimited
    sessionDuration: 60,
    features: [""],
    benefits: [""],
    services: ["Physiotherapy"],
    maxBookingsPerDay: 1,
    cancellationWindow: 12,
    popular: false,
    autoRenew: true,
    status: "active",
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPlanForm((p) => ({
      ...p,
      [name]: ["price", "originalPrice", "discountPercent"].includes(name)
        ? Number(value)
        : value,
    }));
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
    if (!planForm.planId || !planForm.name || !planForm.price) {
      toast({
        title: "Validation Error",
        description: "Plan Type, Name and Price are required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...planForm,
      price: Number(planForm.price),
      originalPrice: Number(planForm.originalPrice),
      discountPercent: Number(planForm.discountPercent),
      sessions: Number(planForm.sessions),
      sessionDuration: Number(planForm.sessionDuration),
      validityInMonths: Number(planForm.validityInMonths),
      maxBookingsPerDay: Number(planForm.maxBookingsPerDay),
      cancellationWindow: Number(planForm.cancellationWindow),
    };

    const result = await dispatch(createSubscriptionPlan(payload));

    if (createSubscriptionPlan.fulfilled.match(result)) {
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      navigate("/subscriptions");
    } else {
      toast({
        title: "Error",
        description: result.payload?.message || "Failed to create plan",
        variant: "destructive",
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
            <Label>Plan Type</Label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={planForm.planId}
              onChange={(e) => {
                const plan = planOptions.find(
                  (p) => p.value === e.target.value
                );
                setPlanForm((p) => ({
                  ...p,
                  planId: e.target.value,
                  validityInMonths: plan?.months || 1,
                }));
              }}
            >
              <option value="">Select Plan</option>
              {planOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Plan Name</Label>
            <Input name="name" value={planForm.name} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (₹)</Label>
              <Input
                name="price"
                type="number"
                value={planForm.price}
                onChange={handleChange}
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

         

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Sessions</Label>
              <Input
                type="number"
                value={planForm.sessions}
                onChange={(e) =>
                  setPlanForm((p) => ({
                    ...p,
                    sessions: Number(e.target.value),
                  }))
                }
                placeholder="0 = Unlimited"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter 0 for unlimited sessions
              </p>
            </div>
            <div>
              <Label>Validity Period (Days)</Label>
              <Input
                type="number"
                name="validityInMonths"
                value={planForm.validityInMonths}
                onChange={(e) =>
                  setPlanForm((p) => ({
                    ...p,
                    validityInMonths: Number(e.target.value),
                  }))
                }
                placeholder="Number of days"
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How long the subscription is valid
              </p>
            </div>
          </div>
          <div>
            <Label>Session Duration (min)</Label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={planForm.sessionDuration}
              onChange={(e) =>
                setPlanForm((p) => ({
                  ...p,
                  sessionDuration: Number(e.target.value),
                }))
              }
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={75}>75 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
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

          {/* BENEFITS */}
          {/* <div>
            <div className="flex justify-between mb-2">
              <Label>Benefits</Label>
              <Button size="sm" variant="outline" onClick={() => addArrayItem("benefits")}>
                Add
              </Button>
            </div>
            {planForm.benefits.map((b, i) => (
              <Input
                key={i}
                className="mb-2"
                value={b}
                onChange={(e) =>
                  updateArrayField("benefits", i, e.target.value)
                }
              />
            ))}
          </div> */}

          {/* <div className="flex justify-between items-center">
            <Label>Popular Plan</Label>
            <Switch
              checked={planForm.popular}
              onCheckedChange={(v) =>
                setPlanForm((p) => ({ ...p, popular: v }))
              }
            />
          </div> */}

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
        <Button onClick={handleSave}>Create Plan</Button>
      </div>
    </div>
  );
}
