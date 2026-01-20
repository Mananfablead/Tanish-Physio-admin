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

export const planOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];


const durationOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
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
      const navigate = useNavigate();
    const dispatch = useDispatch();
    const { toast } = useToast();

    const [planForm, setPlanForm] = useState({
        planId: "",
        name: "",
        price: 0,
        description: "",
        features: [""],
        status: "active",
        duration: "monthly",          // backend enum-safe
        validityInMonths: 1,           // real duration
        autoRenew: true,
    });

    /* ------------ HANDLERS ------------ */

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setPlanForm((prev) => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value,
        }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const updated = [...planForm.features];
        updated[index] = value;
        setPlanForm((prev) => ({ ...prev, features: updated }));
    };

    const addFeature = () =>
        setPlanForm((prev) => ({ ...prev, features: [...prev.features, ""] }));

    const removeFeature = (index: number) =>
        setPlanForm((prev) => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));

 const handleSavePlan = async () => {
  try {
    if (!planForm.planId) {
      toast({
        title: "Validation Error",
        description: "Please select a Plan Type",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...planForm,
      duration: planForm.duration,
    };

    const result = await dispatch(createSubscriptionPlan(payload));

    if (createSubscriptionPlan.fulfilled.match(result)) {
      toast({
        title: "Success",
        description: "Subscription plan created successfully!",
      });

      navigate("/subscriptions");
    } else {
      // ✅ BACKEND MESSAGE EXTRACT
      const errorMessage =
        result.payload?.message ||
        result.error?.message ||
        "Failed to create plan";

      throw new Error(errorMessage);
    }
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message, // 👈 EXACT backend message
      variant: "destructive",
    });
  }
};


    /* ---------------- UI ---------------- */

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Add Subscription Plan</h1>
                    <p className="text-muted-foreground">
                        Create a new subscription plan
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/subscriptions">Back</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT */}
                <div className="bg-card p-6 rounded-lg border space-y-4">
                    <div>
                        <Label>Plan Type</Label>
                        <select
                            className="w-full mt-1 p-2 border rounded"
                            value={planForm.planId}
                            onChange={(e) =>
                                setPlanForm((prev) => ({
                                    ...prev,
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
                        <Input
                            name="name"
                            value={planForm.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Price (₹)</Label>
                            <Input
                                name="price"
                                type="number"
                                value={planForm.price}
                                onChange={handleInputChange}
                            />
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
                            className="w-full p-2 border rounded mt-1"
                        />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="bg-card p-6 rounded-lg border space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <Label>Features</Label>
                            <Button size="sm" variant="outline" onClick={addFeature}>
                                Add Feature
                            </Button>
                        </div>

                        {planForm.features.map((f, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={f}
                                    onChange={(e) =>
                                        handleFeatureChange(i, e.target.value)
                                    }
                                />
                                {planForm.features.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeFeature(i)}
                                    >
                                        −
                                    </Button>
                                )}
                            </div>
                        ))}
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

            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link to="/subscriptions">Cancel</Link>
                </Button>
                <Button
                    disabled={!planForm.planId || !planForm.name || !planForm.price || !planForm.duration || !planForm.features.length}
                onClick={handleSavePlan}>Create Plan</Button>
            </div>
        </div>
    );
}
