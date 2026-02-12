import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  fetchServiceById,
  fetchServiceBySlug,
  updateService,
  fetchServices,
} from "@/features/services/serviceSlice";
import { serviceAPI } from "@/api/apiClient";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UpdateService() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  /* ================= STATE ================= */
  const [serviceForm, setServiceForm] = useState<{
    name: string;
    description: string;
    about: string;
    price: string;
    duration: string;
    sessions: string;
    validity: string;
    category: string;
    status: "active" | "inactive";
    featured: boolean;
    features: string[];
    prerequisites: string[];
    benefits: string[];
  }>({
    name: "",
    description: "",
    about: "", // New field
    price: "",
    duration: "",
    sessions: "",
    validity: "",
    category: "Therapy",
    status: "active" as "active" | "inactive",
    featured: false,
    features: [] as string[],
    prerequisites: [] as string[],
    benefits: [] as string[],
  });

  const [durationError, setDurationError] = useState("");
  const [imageError, setImageError] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [initialVideos, setInitialVideos] = useState<string[]>([]);

  // New state for file handling
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);

  // State for media removal
  const [removingMedia, setRemovingMedia] = useState<{
    [key: string]: boolean;
  }>({});

  const { currentService: service, loading: serviceLoading } = useSelector(
    (state: any) => state.services
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchServiceBySlug(slug));
    } else if (id) {
      dispatch(fetchServiceById(id));
    }
  }, [id, slug, dispatch]);

  useEffect(() => {
    if (service && (id === service._id || slug === service.slug)) {
      setServiceForm({
        name: service.name || "",
        description: service.description || "",
        about: service.about || "", // New field
        price:
          service.price || service.price === 0 ? service.price.toString() : "",
        duration: service.duration || "",
        sessions:
          service.sessions || service.sessions === 0
            ? service.sessions.toString()
            : "",
        validity:
          service.validity || service.validity === 0
            ? service.validity.toString()
            : "",
        category: service.category || "Therapy",
        status:
          service.status === "active" || service.status === "inactive"
            ? (service.status as "active" | "inactive")
            : "active",
        featured: service.featured || false,
        features: service.features || [],
        prerequisites: service.prerequisites || [],
        benefits: service.benefits || [],
      });

      // Set initial images and videos from the service
      setInitialImages(service.images || []);
      setInitialVideos(service.videos || []);
      setImagePreviews(service.images || []);
      setVideoPreviews(service.videos || []);
    }
  }, [service, id]);

  /* ================= IMAGE ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_IMAGE_SIZE) {
        setImageError(`Image size must be less than or equal to 5 MB`);
        e.target.value = "";
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImageError("");
    setSelectedImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
    if (fileInputRef.current && selectedImages.length <= 1)
      fileInputRef.current.value = "";
  };

  // New video handler
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("video/")) {
        setImageError("Please upload a valid video file");
        e.target.value = "";
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        setImageError("Video size must be less than 100MB");
        e.target.value = "";
        return;
      }

      newFiles.push(file);
      newPreviews.push(file.name);
    }

    setImageError("");
    setSelectedVideos((prev) => [...prev, ...newFiles]);
    setVideoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeVideo = (index: number) => {
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedVideos((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
    if (videoInputRef.current && selectedVideos.length <= 1)
      videoInputRef.current.value = "";
  };

  // Remove existing media from server
  const removeExistingMedia = async (
    mediaType: "image" | "video",
    index: number
  ) => {
    if (!id && !slug) return;

    const mediaKey = `${mediaType}-${index}`;
    setRemovingMedia((prev) => ({ ...prev, [mediaKey]: true }));

    try {
      await serviceAPI.removeMedia(id, {
        mediaType,
        mediaIndex: index,
      });

      // Update local state to reflect removal
      if (mediaType === "image") {
        setInitialImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
      } else {
        setInitialVideos((prev) => prev.filter((_, i) => i !== index));
        setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
      }

      // Refresh service data
      if (slug) {
        dispatch(fetchServiceBySlug(slug));
      } else if (id) {
        dispatch(fetchServiceById(id));
      }
    } catch (error) {
      console.error("Error removing media:", error);
      setImageError("Failed to remove media");
    } finally {
      setRemovingMedia((prev) => ({ ...prev, [mediaKey]: false }));
    }
  };

  // Remove newly added media (before saving)
  const removeNewMedia = (mediaType: "image" | "video", index: number) => {
    if (mediaType === "image") {
      removeImage(index);
    } else {
      removeVideo(index);
    }
  };

  /* ================= SUBMIT ================= */
  const handleUpdateService = async () => {
    const durationRegex = /^\d+\s*(min|mins|minutes)$/i;
    if (!durationRegex.test(serviceForm.duration)) {
      setDurationError('Duration must be like "60 min"');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();

    formData.append("name", serviceForm.name.trim());
    formData.append("description", serviceForm.description.trim());
    formData.append("about", serviceForm.about.trim());
    formData.append("price", serviceForm.price);
    formData.append("duration", serviceForm.duration);
    formData.append("sessions", serviceForm.sessions);
    formData.append("validity", serviceForm.validity);
    formData.append("category", serviceForm.category);
    formData.append("status", serviceForm.status);
    formData.append("featured", serviceForm.featured.toString());

    serviceForm.features
      .filter(Boolean)
      .forEach((f) => formData.append("features[]", f));
    serviceForm.benefits
      .filter(Boolean)
      .forEach((b) => formData.append("benefits[]", b));
    serviceForm.prerequisites
      .filter(Boolean)
      .forEach((p) => formData.append("prerequisites[]", p));

    // Add new images and videos to the form data
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    selectedVideos.forEach((video) => {
      formData.append("videos", video);
    });

    const serviceId = id || service?._id;
    if (!serviceId) return;

    const res = await dispatch(
      updateService({ id: serviceId, serviceData: formData }) as any
    );
    setIsLoading(false);

    if (updateService.fulfilled.match(res)) {
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
    const arr = (serviceForm[key] as string[]).filter((_, i) => i !== index);
    setServiceForm({ ...serviceForm, [key]: arr });
  };

  /* ================= LOADING STATE ================= */
  if (serviceLoading && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/services")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Update Service</h1>
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

          <Textarea
            placeholder="About This Service (Full Information)"
            value={serviceForm.about}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, about: e.target.value })
            }
            rows={4}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              type="text"
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

            <Input
              type="text"
              placeholder="Sessions"
              value={serviceForm.sessions}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, sessions: e.target.value })
              }
            />

            <Input
              type="text"
              placeholder="Validity (days)"
              value={serviceForm.validity}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, validity: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={serviceForm.category}
              onValueChange={(v) =>
                setServiceForm({ ...serviceForm, category: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={serviceForm.featured}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, featured: e.target.checked })
                }
                className="h-4 w-4 rounded border-input bg-background"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Featured
              </label>
            </div>
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
                      onChange={(e) => updateArray(key, i, e.target.value)}
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
              className="flex flex-col gap-4 border border-dashed p-4 rounded cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                multiple
              />

              {imagePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => {
                    const isExistingImage = index < initialImages.length;
                    const mediaKey = `image-${index}`;
                    const isRemoving = removingMedia[mediaKey];

                    return (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          disabled={isRemoving}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExistingImage) {
                              removeExistingMedia("image", index);
                            } else {
                              removeNewMedia(
                                "image",
                                index - initialImages.length
                              );
                            }
                          }}
                        >
                          {isRemoving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <Upload className="w-6 h-6" />
                    <span>Add More Images</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  <span>Upload image (max 5MB)</span>
                </div>
              )}
            </div>

            {imageError && (
              <p className="text-sm text-red-500 mt-1">{imageError}</p>
            )}
          </div>

          {/* Video */}
          <div>
            <div
              className="flex flex-col gap-4 border border-dashed p-4 rounded cursor-pointer"
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                ref={videoInputRef}
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleVideoChange}
                multiple
              />

              {videoPreviews.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {videoPreviews.map((preview, index) => {
                    const isExistingVideo = index < initialVideos.length;
                    const mediaKey = `video-${index}`;
                    const isRemoving = removingMedia[mediaKey];

                    return (
                      <div
                        key={index}
                        className="relative flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-sm"
                      >
                        <span>{preview}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 p-0"
                          disabled={isRemoving}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExistingVideo) {
                              removeExistingMedia("video", index);
                            } else {
                              removeNewMedia(
                                "video",
                                index - initialVideos.length
                              );
                            }
                          }}
                        >
                          {isRemoving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <Upload className="w-6 h-6" />
                    <span>Add More Videos</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  <span>Upload video (max 100MB)</span>
                </div>
              )}
            </div>

            {imageError && (
              <p className="text-sm text-red-500 mt-1">{imageError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpdateService}
              disabled={
                !serviceForm.name ||
                !serviceForm.price ||
                !serviceForm.duration ||
                !!imageError ||
                isLoading
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Service"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/services")}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}