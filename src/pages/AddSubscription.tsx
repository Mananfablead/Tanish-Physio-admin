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
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const durationOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const planValidityMap: Record<string, number> = {
  daily: 1,
  weekly: 1,
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/* ---------------- COMPONENT ---------------- */

export default function AddSubscription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [planForm, setPlanForm] = useState({
    planId: "",
    name: "",
    price: 0,
    originalPrice: 0,
    discountPercent: 0,

    description: "",
    features: [""],
    benefits: [""],
    services: ["Physiotherapy"],

    sessions: 0, // 0 = Unlimited
    sessionDuration: 60,

    duration: "monthly",
    validityInMonths: 1,

    maxBookingsPerDay: 1,
    cancellationWindow: 12,

    popular: false,
    autoRenew: true,
    status: "active",
  });

  /* ---------------- HANDLERS ---------------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPlanForm((prev) => ({
      ...prev,
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

  const handleSavePlan = async () => {
    try {
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
        sessions: Number(planForm.sessions),
        sessionDuration: Number(planForm.sessionDuration),
      };

      const result: any = await dispatch(createSubscriptionPlan(payload));

      if (createSubscriptionPlan.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Subscription plan created successfully",
        });
        navigate("/subscriptions");
      } else {
        throw new Error(
          result.payload?.message || "Failed to create subscription plan"
        );
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-6">
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
        {/* LEFT */}
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <div>
            <Label>Plan Type</Label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={planForm.planId}
              onChange={(e) =>
                setPlanForm((p) => ({
                  ...p,
                  planId: e.target.value,
                  validityInMonths:
                    planValidityMap[e.target.value] || 1,
                }))
              }
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
            <Input name="name" value={planForm.name} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (₹)</Label>
              <Input name="price" type="number" value={planForm.price} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Original Price (₹)</Label>
              <Input name="originalPrice" type="number" value={planForm.originalPrice} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount (%)</Label>
              <Input name="discountPercent" type="number" value={planForm.discountPercent} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Billing Duration</Label>
              <select
                name="duration"
                value={planForm.duration}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded"
              >
                {durationOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              value={planForm.description}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Sessions</Label>
              <Input
                type="number"
                value={planForm.sessions}
                onChange={(e) =>
                  setPlanForm((p) => ({ ...p, sessions: Number(e.target.value) }))
                }
                placeholder="0 = Unlimited"
              />
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
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-card p-6 rounded-lg border space-y-4">
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
                <Input value={f} onChange={(e) => updateArrayField("features", i, e.target.value)} />
                {planForm.features.length > 1 && (
                  <Button size="icon" variant="outline" onClick={() => removeArrayItem("features", i)}>
                    −
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* BENEFITS */}
          <div>
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
                onChange={(e) => updateArrayField("benefits", i, e.target.value)}
              />
            ))}
          </div>

          {/* SERVICES */}
          <div>
            <Label>Services Included</Label>
            <select
              multiple
              className="w-full mt-1 p-2 border rounded"
              value={planForm.services}
              onChange={(e) =>
                setPlanForm((p) => ({
                  ...p,
                  services: Array.from(e.target.selectedOptions, (o) => o.value),
                }))
              }
            >
              <option value="Physiotherapy">Physiotherapy</option>
              <option value="Sports Rehab">Sports Rehab</option>
              <option value="Post Surgery Rehab">Post Surgery Rehab</option>
              <option value="Pain Management">Pain Management</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <Label>Popular Plan</Label>
            <Switch
              checked={planForm.popular}
              onCheckedChange={(v) =>
                setPlanForm((p) => ({ ...p, popular: v }))
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Auto Renew</Label>
            <Switch
              checked={planForm.autoRenew}
              onCheckedChange={(v) =>
                setPlanForm((p) => ({ ...p, autoRenew: v }))
              }
            />
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
        <Button onClick={handleSavePlan}>Create Plan</Button>
      </div>
    </div>
  );
}
