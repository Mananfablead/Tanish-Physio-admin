import { useState, useRef, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Plus,
  Upload,
  X,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from "@/features/services/serviceSlice";
import PageLoader from "@/components/PageLoader";

export default function Services() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 10;

  const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const {
    list: services,
    loading,
    error,
  } = useSelector((state: any) => state.services);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredServices = (services || []).filter(
    (service) =>
      service?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      service?.description
        ?.toLowerCase()
        .includes(searchQuery?.toLowerCase()) ||
      service?.category?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + servicesPerPage
  );

  if (loading || !services) {
    return <PageLoader text="Loading services..." />;
  }

  const handleDeleteService = () => {
    if (!selectedService) return;

    setIsDeleting(true);

    dispatch(deleteService(selectedService._id || selectedService.id))
      .then(() => {
        dispatch(fetchServices());
      })
      .finally(() => {
        setIsDeleting(false);
      });
    setIsDeleteServiceOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Services Management</h1>
          <p className="page-subtitle">
            Manage services offered by your clinic
          </p>
        </div>
        <Button onClick={() => navigate("/add-service")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {!loading &&
          (paginatedServices.length > 0 ? (
            <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      {/* <th>Description</th> */}
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Purchases</th>
                      {/* <th>Sessions</th> */}
                      <th>Validity</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th className="w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServices.map((service) => (
                      <tr
                        key={service._id || service.id}
                        className={cn(
                          "cursor-pointer",
                          service.status === "inactive" ||
                            service.status === false
                            ? "opacity-70"
                            : ""
                        )}
                        onClick={() =>
                          navigate(
                            service.slug
                              ? `/services/slug/${service.slug}`
                              : `/services/${service._id || service.id}`
                          )
                        }
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                              {service.images && service.images.length > 0 ? (
                                <img
                                  src={service.images[0]}
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium ">
                                {service.name}
                              </span>
                              {(service.status === "inactive" ||
                                service.status === false) && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Inactive)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>&#8377;{service.price}</td>
                        <td>{service.duration}</td>
                        <td>{service.purchaseCount}</td>
                        {/* <td>{service.sessions}</td> */}
                        <td>{service.validity} days</td>
                        <td>
                          <span
                            className={cn(
                              "status-badge capitalize",
                              service.featured
                                ? "status-active"
                                : "status-inactive"
                            )}
                          >
                            {service.featured ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={cn(
                              "status-badge capitalize",
                              service.status === "active" ||
                                service.status === true
                                ? "status-active"
                                : "status-inactive"
                            )}
                          >
                            {service.status === true
                              ? "active"
                              : service.status === false
                              ? "inactive"
                              : service.status}
                          </span>
                        </td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    service.slug
                                      ? `/services/slug/${service.slug}/edit`
                                      : `/services/${
                                          service._id || service.id
                                        }/edit`
                                  );
                                }}
                              >
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

              {/* PAGINATION CONTROLS */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      startIndex + servicesPerPage,
                      filteredServices.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredServices.length}</span>{" "}
                  services
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Services Found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No services match your search criteria."
                  : "Get started by adding your first service."}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  onClick={() => navigate("/add-service")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              )}
            </div>
          ))}
      </div>

      {/* Delete Service Confirmation Modal */}
      <Dialog open={isDeleteServiceOpen} onOpenChange={setIsDeleteServiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot
              be undone.
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
                  <span className="font-medium">
                    {selectedService.category}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Price:</span>{" "}
                  <span className="font-medium">₹{selectedService.price}</span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteServiceOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}