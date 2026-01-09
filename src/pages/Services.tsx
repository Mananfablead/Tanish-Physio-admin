import { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal, Plus, Upload, X, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices, createService, updateService, deleteService } from "@/features/services/serviceSlice";

export default function Services() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const { list: services, loading, error } = useSelector((state: any) => state.services);

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Therapy" as string,
    status: "active" as "active" | "inactive",
    features: [] as string[],
    prerequisites: [] as string[],
    benefits: [] as string[]
  });
  
  const [durationError, setDurationError] = useState("");
  
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const filteredServices = (services || []).filter((service) =>
    service?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    service?.description?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    service?.category?.toLowerCase().includes(searchQuery?.toLowerCase())
  );



const handleUpdateService = () => {
  if (!selectedService) return;

  // Validate duration format
  const durationRegex = /^\d+\s*(min|mins|minutes)$/i;
  if (!durationRegex.test(serviceForm.duration)) {
    setDurationError('Duration must be in format: "X min/mins/minutes"');
    return;
  }

  setDurationError(""); // Clear error if validation passes
  
  const serviceId = selectedService._id ?? selectedService.id;

  const updatedService = {
    name: serviceForm.name,
    description: serviceForm.description,
    price: Number(serviceForm.price),
    duration: serviceForm.duration,
    image: imagePreview || selectedService.image,
    category: serviceForm.category,
    status: serviceForm.status,
    features: serviceForm.features,
    prerequisites: serviceForm.prerequisites,
    benefits: serviceForm.benefits
  };

  dispatch(updateService({
    id: serviceId,
    serviceData: updatedService,
  })).then(() => {
    dispatch(fetchServices());
  });

  resetForm();
  setIsEditServiceOpen(false);
};


  const handleDeleteService = () => {
    if (!selectedService) return;

    dispatch(deleteService(selectedService._id || selectedService.id)).then(() => {
      dispatch(fetchServices());
    });
    setIsDeleteServiceOpen(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Services Management</h1>
          <p className="page-subtitle">Manage services offered by your clinic</p>
        </div>
        <Button onClick={() => navigate("/add-service")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
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
                  <th>Service</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Duration</th>
                  {/* <th>Category</th> */}
                  <th>Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service._id || service.id} className="cursor-pointer" onClick={() => navigate(`/services/${service._id || service.id}`)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{service.name}</span>
                      </div>
                    </td>
                    <td className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate" title={service.description}>
                        {service.description}
                      </p>
                    </td>
                    <td>&#8377;{service.price}</td>
                    <td>{service.duration}</td>
                    {/* <td>
                      <span className="status-badge bg-muted text-muted-foreground">
                        {service.category}
                      </span>
                    </td> */}
                    <td>
                      <span className={cn("status-badge", (service.status === "active" || service.status === true) ? "status-active" : "status-inactive")}>
                        {service.status === true ? 'active' : service.status === false ? 'inactive' : service.status}
                      </span>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service);
                            setServiceForm({
                              name: service.name,
                              description: service.description,
                              price: (service.price || service.price === 0) ? service.price.toString() : '',
                              duration: service.duration || '',
                              category: service.category || 'Therapy',
                              status: (service.status === 'active' || service.status === 'inactive') ? service.status as "active" | "inactive" : "active",
                              features: service.features || [],
                              prerequisites: service.prerequisites || [],
                              benefits: service.benefits || []
                            });
                            setImagePreview(service.image);
                            setIsEditServiceOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(service);
                              setIsDeleteServiceOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredServices.length}</span> services
            </p>
          </div>
        </div>
      </div>




      {/* Edit Service Modal */}
      <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
        <DialogContent className="max-w-lg p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Service</DialogTitle>
            <DialogDescription className="text-sm">
              Update service details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Service Name */}
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
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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
                rows={2}
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

            {/* Features */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Features</label>
              <Textarea
                rows={2}
                placeholder="Enter features, one per line"
                value={serviceForm.features.join('\n')}
                onChange={(e) => {
                  const features = e.target.value.split('\n').filter(f => f.trim() !== '');
                  setServiceForm({
                    ...serviceForm,
                    features: features,
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">Enter each feature on a new line</p>
            </div>

            {/* Prerequisites */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Prerequisites</label>
              <Textarea
                rows={2}
                placeholder="Enter prerequisites, one per line"
                value={serviceForm.prerequisites.join('\n')}
                onChange={(e) => {
                  const prerequisites = e.target.value.split('\n').filter(f => f.trim() !== '');
                  setServiceForm({
                    ...serviceForm,
                    prerequisites: prerequisites,
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">Enter each prerequisite on a new line</p>
            </div>

            {/* Benefits */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Benefits</label>
              <Textarea
                rows={2}
                placeholder="Enter benefits, one per line"
                value={serviceForm.benefits.join('\n')}
                onChange={(e) => {
                  const benefits = e.target.value.split('\n').filter(f => f.trim() !== '');
                  setServiceForm({
                    ...serviceForm,
                    benefits: benefits,
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">Enter each benefit on a new line</p>
            </div>

            {/* Image (Compact) */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Image</label>
              <div
                className="flex items-center gap-3 border border-dashed rounded-md p-2 cursor-pointer"
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}

                <span className="text-sm text-muted-foreground">
                  {imagePreview ? "Change image" : "Upload image"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditServiceOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateService}
              disabled={!serviceForm.name || !serviceForm.price}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Service Confirmation Modal */}
      <Dialog open={isDeleteServiceOpen} onOpenChange={setIsDeleteServiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">Service:</span>{" "}
                  <span className="font-medium">{selectedService.name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium">{selectedService.category}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Price:</span>{" "}
                  <span className="font-medium">₹{selectedService.price}</span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteServiceOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}