import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import {
    createService,
    fetchServices,
} from "@/features/services/serviceSlice";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddService() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ================= STATE ================= */
    const [serviceForm, setServiceForm] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "Therapy",
        status: "active" as "active" | "inactive",
        features: [""] as string[],
        prerequisites: [""] as string[],
        benefits: [""] as string[],
    });

    const [durationError, setDurationError] = useState("");
    const [imageError, setImageError] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /* ================= IMAGE ================= */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            setImageError("Image size must be less than or equal to 5 MB");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setImageError("");
        const reader = new FileReader();
        reader.onloadend = () =>
            setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /* ================= SUBMIT ================= */
    const handleAddService = async () => {
        const durationRegex = /^\d+\s*(min|mins|minutes)$/i;
        if (!durationRegex.test(serviceForm.duration)) {
            setDurationError('Duration must be like "60 min"');
            return;
        }

        setIsLoading(true);
        
        const payload = {
            name: serviceForm.name.trim(),
            description: serviceForm.description.trim(),
            price: Number(serviceForm.price),
            duration: serviceForm.duration,
            category: serviceForm.category,
            status: serviceForm.status,
            image: imagePreview || "",
            features: serviceForm.features.filter(Boolean),
            benefits: serviceForm.benefits.filter(Boolean),
            prerequisites: serviceForm.prerequisites.filter(Boolean),
        };

        const res = await dispatch(createService(payload) as any);
        setIsLoading(false);

        if (createService.fulfilled.match(res)) {
            dispatch(fetchServices());
            navigate("/services");
        }
    };

    /* ================= ARRAY HELPERS ================= */
    const updateArray = (
        key: keyof typeof serviceForm,
        index: number,
        value: string
    ) => {
        const arr = [...(serviceForm[key] as string[])];
        arr[index] = value;
        setServiceForm({ ...serviceForm, [key]: arr });
    };

    const addItem = (key: keyof typeof serviceForm) => {
        setServiceForm({
            ...serviceForm,
            [key]: [...(serviceForm[key] as string[]), ""],
        });
    };

    const removeItem = (key: keyof typeof serviceForm, index: number) => {
        const arr = (serviceForm[key] as string[]).filter(
            (_, i) => i !== index
        );
        setServiceForm({ ...serviceForm, [key]: arr });
    };

    /* ================= UI ================= */
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/services")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Add New Service</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Service Information</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Input
                        placeholder="Service Name"
                        value={serviceForm.name}
                        onChange={(e) =>
                            setServiceForm({ ...serviceForm, name: e.target.value })
                        }
                    />

                    <Textarea
                        placeholder="Description"
                        value={serviceForm.description}
                        onChange={(e) =>
                            setServiceForm({ ...serviceForm, description: e.target.value })
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            placeholder="Price"
                            value={serviceForm.price}
                            onChange={(e) =>
                                setServiceForm({ ...serviceForm, price: e.target.value })
                            }
                        />

                        <div>
                            <Input
                                placeholder="Duration (60 min)"
                                value={serviceForm.duration}
                                onChange={(e) => {
                                    setServiceForm({ ...serviceForm, duration: e.target.value });
                                    setDurationError("");
                                }}
                                className={durationError ? "border-red-500" : ""}
                            />
                            {durationError && (
                                <p className="text-sm text-red-500 mt-1">{durationError}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            value={serviceForm.category}
                            onValueChange={(v) =>
                                setServiceForm({ ...serviceForm, category: v })
                            }
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Therapy">Therapy</SelectItem>
                                <SelectItem value="Wellness">Wellness</SelectItem>
                                <SelectItem value="Alternative">Alternative</SelectItem>
                                <SelectItem value="Specialized">Specialized</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={serviceForm.status}
                            onValueChange={(v) =>
                                setServiceForm({ ...serviceForm, status: v as any })
                            }
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ===== ARRAY SECTIONS ===== */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {(["features", "benefits", "prerequisites"] as const).map((key) => (
    <div key={key} className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium capitalize">{key}</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addItem(key)}
        >
          Add
        </Button>
      </div>

      {(serviceForm[key] as string[]).map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) =>
              updateArray(key, i, e.target.value)
            }
            placeholder={`Enter ${key}`}
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => removeItem(key, i)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {(serviceForm[key] as string[]).length === 0 && (
        <p className="text-sm text-muted-foreground italic text-center">
          No {key} added
        </p>
      )}
    </div>
  ))}
</div>


                    {/* Image */}
                    <div>
                        <div
                            className="flex items-center gap-4 border border-dashed p-4 rounded cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} className="w-16 h-16 rounded object-cover" />
                                    <Button variant="ghost" onClick={removeImage}>
                                        Remove
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6" />
                                    <span>Upload image (max 5MB)</span>
                                </>
                            )}
                        </div>

                        {imageError && (
                            <p className="text-sm text-red-500 mt-1">{imageError}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleAddService}
                            disabled={!serviceForm.name || !serviceForm.price || !serviceForm.duration || !serviceForm.features || !!imageError || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Adding...
                                </>
                            ) : (
                                "Add Service"
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/services")} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
