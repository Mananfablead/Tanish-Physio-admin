import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createSubscriptionPlan } from "@/features/subscriptions/subscriptionSlice";
import { Link } from "react-router-dom";

export default function AddSubscription() {
    const dispatch = useDispatch();
    const { toast } = useToast();

    // State for the plan form
    const [planForm, setPlanForm] = useState({
        name: "",
        price: 0,
        description: "",
        status: "active", // Using status instead of active
        features: [""], // Array of features
        duration: "monthly",
        autoRenew: true,
    });

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const target = e.target as HTMLInputElement;
            if (name === "status") {
                setPlanForm(prev => ({
                    ...prev,
                    [name]: target.checked ? 'active' : 'inactive'
                }));
            } else {
                setPlanForm(prev => ({
                    ...prev,
                    [name]: target.checked
                }));
            }
        } else {
            setPlanForm(prev => ({
                ...prev,
                [name]: name === "price" ? Number(value) : value
            }));
        }
    };

    // Handle feature changes
    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...planForm.features];
        newFeatures[index] = value;
        setPlanForm(prev => ({
            ...prev,
            features: newFeatures
        }));
    };

    // Add a new feature input
    const addFeature = () => {
        setPlanForm(prev => ({
            ...prev,
            features: [...prev.features, ""]
        }));
    };

    // Remove a feature
    const removeFeature = (index: number) => {
        if (planForm.features.length <= 1) return;
        const newFeatures = planForm.features.filter((_, i) => i !== index);
        setPlanForm(prev => ({
            ...prev,
            features: newFeatures
        }));
    };

    // Handle save plan (create only)
    const handleSavePlan = async () => {
        try {
            // Create new plan - format data according to API expectation
            const createData = {
                ...planForm,
                status: planForm.status,
            };
            const result = await dispatch(createSubscriptionPlan(createData));

            if (createSubscriptionPlan.fulfilled.match(result)) {
                toast({
                    title: "Success",
                    description: "Subscription plan created successfully!",
                });
                // Reset form after successful creation
                setPlanForm({
                    name: "",
                    price: 0,
                    description: "",
                    status: "active",
                    features: [""],
                    duration: "monthly",
                    autoRenew: true,
                });
            } else {
                throw new Error(result.payload || 'Failed to create subscription plan');
            }
        } catch (err: any) {
            console.error('Error saving subscription plan:', err);
            toast({
                title: "Error",
                description: err.message || 'Failed to save subscription plan',
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Add New Subscription Plan</h1>
                    <p className="text-muted-foreground">Create a new subscription plan for users</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/subscriptions">Back to Subscriptions</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-4">Plan Details</h2>

                    <div className="space-y-4">
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
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-4">Plan Configuration</h2>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Features</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                                    Add Feature
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {planForm.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder={`Feature ${index + 1}`}
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
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
                                <p className="text-xs text-muted-foreground">Automatically renew at end of period</p>
                            </div>
                            <Switch
                                id="autoRenew"
                                name="autoRenew"
                                checked={planForm.autoRenew}
                                onCheckedChange={(checked) => setPlanForm(prev => ({ ...prev, autoRenew: checked }))}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Active</Label>
                                <p className="text-xs text-muted-foreground">Plan is available for purchase</p>
                            </div>
                            <Switch
                                id="status"
                                name="status"
                                checked={planForm.status === 'active'}
                                onCheckedChange={(checked) => setPlanForm(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                    <Link to="/subscriptions">Cancel</Link>
                </Button>
                <Button onClick={handleSavePlan}>
                    Create Plan
                </Button>
            </div>
        </div>
    );
}