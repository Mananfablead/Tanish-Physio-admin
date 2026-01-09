import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { createService, fetchServices } from "@/features/services/serviceSlice";

export default function AddService() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [serviceForm, setServiceForm] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "Therapy" as string,
        status: "active" as "active" | "inactive",
        features: [""] as string[],
        prerequisites: [""] as string[],
        benefits: [""] as string[]
    });

    const [durationError, setDurationError] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleAddService = async () => {
        const durationRegex = /^\d+\s*(min|mins|minutes)$/i;

        if (!durationRegex.test(serviceForm.duration)) {
            setDurationError('Duration must be in format: "X min / mins / minutes"');
            return;
        }

        setDurationError("");

        // 🔥 IMPORTANT: safe payload
        const newService = {
            name: serviceForm.name?.trim(),
            description: serviceForm.description?.trim(),
            price: Number(serviceForm.price) || 0,
            duration: serviceForm.duration,
            category: serviceForm.category,
            status: serviceForm.status || "active",

            // ✅ VERY IMPORTANT
            image: imagePreview || "",

            // ✅ ARRAYS MUST ALWAYS EXIST
            features: serviceForm.features ?? [],
            benefits: serviceForm.benefits ?? [],
            prerequisites: serviceForm.prerequisites ?? [],
            contraindications: serviceForm.contraindications ?? [],
        };

        try {
            const res = await dispatch(createService(newService));

            if (createService.fulfilled.match(res)) {
                console.log("✅ Service created:", res.payload);
                dispatch(fetchServices());
                navigate("/services");
            }

            if (createService.rejected.match(res)) {
                console.error("❌ Backend error:", res.payload);
                alert(res.payload || "Service creation failed");
            }

        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };


    const resetForm = () => {
        setServiceForm({
            name: "",
            description: "",
            price: "",
            duration: "",
            category: "Therapy",
            status: "active",
            features: [],
            prerequisites: [],
            benefits: []
        });
        setDurationError("");
        setImagePreview(null);
        setImageFile(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6   ">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/services")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Services
                </Button>
                <h1 className="text-2xl font-bold">Add New Service</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Service Name</label>
                            <Input
                                placeholder="Physical Therapy"
                                value={serviceForm.name}
                                onChange={(e) =>
                                    setServiceForm({ ...serviceForm, name: e.target.value })
                                }
                            />
                        </div>

                        {/* Price + Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Price (₹)</label>
                                <Input
                                    type="number"
                                    placeholder="500"
                                    value={serviceForm.price}
                                    onChange={(e) =>
                                        setServiceForm({ ...serviceForm, price: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Duration</label>
                                <Input
                                    placeholder="60 min"
                                    value={serviceForm.duration}
                                    onChange={(e) => {
                                        setServiceForm({ ...serviceForm, duration: e.target.value });
                                        // Clear error when user types
                                        if (durationError) setDurationError("");
                                    }}
                                    className={durationError ? "border-red-500" : ""}
                                />
                                {durationError && (
                                    <p className="text-red-500 text-sm mt-1">{durationError}</p>
                                )}
                            </div>
                        </div>

                        {/* Category + Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Category</label>
                                <Select
                                    value={serviceForm.category}
                                    onValueChange={(value) =>
                                        setServiceForm({ ...serviceForm, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Therapy">Therapy</SelectItem>
                                        <SelectItem value="Wellness">Wellness</SelectItem>
                                        <SelectItem value="Alternative">Alternative</SelectItem>
                                        <SelectItem value="Specialized">Specialized</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={serviceForm.status}
                                    onValueChange={(value) =>
                                        setServiceForm({
                                            ...serviceForm,
                                            status: value as "active" | "inactive",
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                rows={3}
                                placeholder="Service description"
                                value={serviceForm.description}
                                onChange={(e) =>
                                    setServiceForm({
                                        ...serviceForm,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Features */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Features</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setServiceForm({
                                                ...serviceForm,
                                                features: [...serviceForm.features, ""]
                                            });
                                        }}
                                    >
                                        Add More
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {serviceForm.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={feature}
                                                onChange={(e) => {
                                                    const newFeatures = [...serviceForm.features];
                                                    newFeatures[index] = e.target.value;
                                                    setServiceForm({
                                                        ...serviceForm,
                                                        features: newFeatures,
                                                    });
                                                }}
                                                placeholder="Enter feature"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const newFeatures = serviceForm.features.filter((_, i) => i !== index);
                                                    setServiceForm({
                                                        ...serviceForm,
                                                        features: newFeatures,
                                                    });
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {serviceForm.features.length === 0 && (
                                        <div className="text-sm text-muted-foreground italic py-2 text-center">
                                            No features added yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Prerequisites */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Prerequisites</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setServiceForm({
                                                ...serviceForm,
                                                prerequisites: [...serviceForm.prerequisites, ""]
                                            });
                                        }}
                                    >
                                        Add More
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {serviceForm.prerequisites.map((prerequisite, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={prerequisite}
                                                onChange={(e) => {
                                                    const newPrerequisites = [...serviceForm.prerequisites];
                                                    newPrerequisites[index] = e.target.value;
                                                    setServiceForm({
                                                        ...serviceForm,
                                                        prerequisites: newPrerequisites,
                                                    });
                                                }}
                                                placeholder="Enter prerequisite"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const newPrerequisites = serviceForm.prerequisites.filter((_, i) => i !== index);
                                                    setServiceForm({
                                                        ...serviceForm,
                                                        prerequisites: newPrerequisites,
                                                    });
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {serviceForm.prerequisites.length === 0 && (
                                        <div className="text-sm text-muted-foreground italic py-2 text-center">
                                            No prerequisites added yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Benefits</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setServiceForm({
                                                ...serviceForm,
                                                benefits: [...serviceForm.benefits, ""]
                                            });
                                        }}
                                    >
                                        Add More
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {serviceForm.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={benefit}
                                                onChange={(e) => {
                                                    const newBenefits = [...serviceForm.benefits];
                                                    newBenefits[index] = e.target.value;
                                                    setServiceForm({
                                                        ...serviceForm,
                                                        benefits: newBenefits,
                                                    });
                                                }}
                                                placeholder="Enter benefit"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const newBenefits = serviceForm.benefits.filter((_, i) => i !== index);
                                                    setServiceForm({
                                                        ...serviceForm,
                                                        benefits: newBenefits,
                                                    });
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {serviceForm.benefits.length === 0 && (
                                        <div className="text-sm text-muted-foreground italic py-2 text-center">
                                            No benefits added yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Image</label>
                            <div
                                className="flex items-center gap-3 border border-dashed rounded-md p-4 cursor-pointer"
                                onClick={triggerFileInput}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />

                                {imagePreview ? (
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">Click to change image</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage();
                                                }}
                                                className="text-destructive mt-1"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload image
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                onClick={handleAddService}
                                disabled={!serviceForm.name || !serviceForm.price}
                            >
                                Add Service
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    navigate("/services");
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}