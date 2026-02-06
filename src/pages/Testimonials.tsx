import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { Search, Plus, Edit, Trash2, Star, User, Calendar, Award, Filter, CheckCircle, MessageSquare, Clock, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  fetchTestimonials,
  fetchTestimonialStats,
  createTestimonial,
  updateTestimonial,
  updateTestimonialStatus,
  toggleTestimonialFeatured,
  deleteTestimonial,
  clearSelectedTestimonial
} from '@/features/testimonials/testimonialSlice';
import { fetchUsers } from '@/features/users/userSlice';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"


interface Testimonial {
  _id: string;
  clientName?: string;
  clientEmail?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  rating: number;
  content: string;
  serviceUsed: string;
  problem: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

interface FormTestimonial {
  _id: string;
  clientName: string;
  clientEmail?: string;
  userId: string; // For form handling, we expect a string ID
  rating: number;
  content: string;
  serviceUsed: string;
  problem: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  id: string; // For backward compatibility with form handling
}

export default function Testimonials() {
  const dispatch = useDispatch();


  const { testimonials, stats, loading, error } = useSelector((state: any) => state.testimonials);
  const { list: allUsers, loading: usersLoading, pagination } = useSelector((state: any) => state.users);
  console.log("allUsers", allUsers)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    userId: false,
    clientEmail: false,
    serviceUsed: false,
    problem: false,
    content: false,
  });


  const [editingTestimonial, setEditingTestimonial] =
    useState<FormTestimonial | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [openUserSelector, setOpenUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  interface FormData {
    clientName: string;
    clientEmail: string;
    userId: string; // Store just the user ID as string for form submission
    rating: number;
    content: string;
    serviceUsed: string;
    problem: string;
    status: "pending" | "approved" | "rejected";
    featured: boolean;
  }

  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    clientEmail: "",
    userId: "", // Store just the user ID as string for form submission
    rating: 5,
    content: "",
    serviceUsed: "",
    problem: "",
    status: "pending" as "pending" | "approved" | "rejected",
    featured: false,
  });

  // Load testimonials and stats on component mount
  useEffect(() => {
    dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
    dispatch(fetchTestimonialStats());
  }, [dispatch, searchQuery, statusFilter]);

  // Load first page of users when modal opens
  useEffect(() => {
    if (isModalOpen && !editingTestimonial) {
      dispatch(fetchUsers({ page: 1, limit: usersPerPage }));
    }
  }, [isModalOpen, editingTestimonial, dispatch]);

  // Update hasMoreUsers based on pagination data
  useEffect(() => {
    if (pagination) {
      setHasMoreUsers(allUsers.length < pagination.totalDocs);
    }
  }, [allUsers, pagination]);

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = (testimonial.clientName && testimonial.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (testimonial.serviceUsed && testimonial.serviceUsed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (testimonial.content && testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = stats.pending || 0;
  const approvedCount = stats.approved || 0;
  const featuredCount = stats.featured || 0;

  const handleCreate = () => {
    setEditingTestimonial(null);
    setSelectedUser(null);
    setUsersPage(1);
    setHasMoreUsers(true);
    setFormData({
      clientName: "",
      clientEmail: "",
      userId: "",
      rating: 5,
      content: "",
      serviceUsed: "",
      problem: "",
      status: "pending",
      featured: false,
    });
    // Clear any existing errors
    setErrors({
      userId: false,
      clientEmail: false,
      serviceUsed: false,
      problem: false,
      content: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    const userIdString = testimonial.userId ? (typeof testimonial.userId === 'string' ? testimonial.userId : testimonial.userId._id) : "";

    setEditingTestimonial({
      _id: testimonial._id,
      clientName: testimonial.clientName || '',
      clientEmail: testimonial.clientEmail || testimonial.userId?.email,
      userId: userIdString, // Convert object to string for form handling
      rating: testimonial.rating,
      content: testimonial.content,
      serviceUsed: testimonial.serviceUsed,
      problem: testimonial.problem,
      status: testimonial.status,
      featured: testimonial.featured,
      createdAt: testimonial.createdAt,
      updatedAt: testimonial.updatedAt,
      avatar: testimonial.avatar,
      id: testimonial._id,
    });

    // Find and set the selected user
    const user = allUsers.find((u: any) => u._id === userIdString);
    if (user) {
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }

    setUsersPage(1);
    setHasMoreUsers(true);
    setFormData({
      clientName: testimonial.clientName || '',
      clientEmail: testimonial.clientEmail || testimonial.userId?.email || "",
      userId: userIdString, // Extract ID from populated object
      rating: testimonial.rating,
      content: testimonial.content,
      serviceUsed: testimonial.serviceUsed,
      problem: testimonial.problem,
      status: testimonial.status,
      featured: testimonial.featured,
    });
    // Clear any existing errors
    setErrors({
      userId: false,
      clientEmail: false,
      serviceUsed: false,
      problem: false,
      content: false,
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {
      userId: !formData.userId.trim(),
      clientEmail: !formData.clientEmail.trim(),
      serviceUsed: !formData.serviceUsed.trim(),
      problem: !formData.problem.trim(),
      content: !formData.content.trim(),
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingTestimonial) {
        // Update existing testimonial
        await dispatch(updateTestimonial({ id: editingTestimonial.id, data: formData })).unwrap();
      } else {
        // Create new testimonial
        await dispatch(createTestimonial(formData)).unwrap();
      }

      // Close modal
      setIsModalOpen(false);
      
      // Clear errors
      setErrors({
        userId: false,
        clientEmail: false,
        serviceUsed: false,
        problem: false,
        content: false,
      });

      // Refresh testimonials to ensure the new/updated testimonial appears in the filtered list
      dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
      dispatch(fetchTestimonialStats());
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert(error.message || "An error occurred while saving the testimonial");
      // Still refresh in case of error to ensure UI consistency
      dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
      dispatch(fetchTestimonialStats());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      await dispatch(updateTestimonialStatus({ id, status: newStatus })).unwrap();
      // Refresh testimonials to ensure the updated status appears in the filtered list
      dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
      dispatch(fetchTestimonialStats());
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      // Still refresh in case of error to ensure UI consistency
      dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
      dispatch(fetchTestimonialStats());
    }
  };

  const handleFeatureToggle = async (id: string) => {
    try {
      await dispatch(toggleTestimonialFeatured(id)).unwrap();
      // Refresh testimonials to ensure the updated featured status appears in the filtered list
      dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
      dispatch(fetchTestimonialStats());
    } catch (error) {
      console.error('Error toggling testimonial featured status:', error);
      // Still refresh in case of error to ensure UI consistency
      dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
      dispatch(fetchTestimonialStats());
    }
  };

  // Handle delete - opens confirmation dialog
  const handleDelete = (id: string) => {
    setDeleteTestId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteTestId) {
      try {
        await dispatch(deleteTestimonial(deleteTestId)).unwrap();
        setDeleteTestId(null);
        setIsDeleteDialogOpen(false);
        // Refresh testimonials to ensure the deleted testimonial is removed from the filtered list
        dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
        dispatch(fetchTestimonialStats());
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        setDeleteTestId(null);
        setIsDeleteDialogOpen(false);
        // Still refresh in case of error to ensure UI consistency
        dispatch(fetchTestimonials({ search: searchQuery, status: statusFilter }));
        dispatch(fetchTestimonialStats());
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteTestId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      userId: user._id,
      clientName: user.name || user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user._id),
      clientEmail: user.email || "",
      // Automatically set service used if user has services
      serviceUsed: user.servicesUsed && user.servicesUsed.length > 0 
        ? user.servicesUsed[0].serviceName || "" 
        : ""
    }));
    setOpenUserSelector(false);
  };

  const loadMoreUsers = () => {
    if (hasMoreUsers && !usersLoading) {
      const nextPage = usersPage + 1;
      setUsersPage(nextPage);
      // Dispatch fetchUsers with pagination parameters
      dispatch(fetchUsers({ page: nextPage, limit: usersPerPage }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            onClick={() => {
              if (interactive) {
                setFormData({ ...formData, rating: i + 1 });
              }
            }}
            style={{ cursor: interactive ? "pointer" : "default" }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}



      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage client testimonials and reviews
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </p>
              <p className="text-2xl font-bold">{testimonials.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Approval */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Approved
              </p>
              <p className="text-2xl font-bold text-green-600">
                {approvedCount}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Featured */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Featured
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {featuredCount}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            Manage client testimonials and reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>

                <TableHead>Problem</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        {testimonial.userId?.profilePicture ? (
                          <img
                            src={testimonial.userId.profilePicture}
                            alt={testimonial.userId.name || ''}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {testimonial.userId?.name || testimonial.clientName || 'N/A'}
                        </div>
                        {(testimonial.userId?.email || testimonial.clientEmail) && (
                          <div className="text-sm text-muted-foreground">
                            {testimonial.userId?.email || testimonial.clientEmail}
                          </div>
                        )}
                        {renderStars(testimonial.rating, false)}
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating, false)}
                      <span className="text-sm font-medium ml-1">
                        {testimonial.rating}/5
                      </span>
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <span className="text-sm">{testimonial.problem || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{testimonial.serviceUsed || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={testimonial.status}
                      onValueChange={(value) => handleStatusChange(testimonial._id, value as any)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={testimonial.featured ? "featured" : "not-featured"}
                      onValueChange={(value) => handleFeatureToggle(testimonial._id)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="not-featured">Not Featured</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(testimonial._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Testimonial Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            {/* <DialogDescription>
              {editingTestimonial 
                ? "Modify the testimonial details below" 
                : "Add a new client testimonial"}
            </DialogDescription> */}
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Popover open={openUserSelector} onOpenChange={setOpenUserSelector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openUserSelector}
                      className={`w-full justify-between ${errors.userId ? "border-red-500" : ""}`}
                    >
                      {selectedUser
                        ? selectedUser.name || selectedUser.fullName || selectedUser.firstName + " " + selectedUser.lastName
                        : "Select user..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {allUsers.map((user) => (
                            <CommandItem
                              key={user._id}
                              value={user.name || user.fullName || user.firstName + " " + user.lastName}
                              onSelect={() => handleUserSelect(user)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser?._id === user._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {user.name || user.fullName || `${user.firstName} ${user.lastName}`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {usersLoading && (
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            Loading more users...
                          </div>
                        )}
                        {!usersLoading && hasMoreUsers && (
                          <CommandItem onSelect={loadMoreUsers} className="py-2 text-sm text-center justify-center">
                            Load more users
                          </CommandItem>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.userId && (
                  <p className="text-sm text-red-500">Client is required</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, clientEmail: e.target.value });
                    if (errors.clientEmail && e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, clientEmail: false }));
                    }
                  }}
                  placeholder="Enter client email"
                  className={errors.clientEmail ? "border-red-500" : ""}
                />
                {errors.clientEmail && (
                  <p className="text-sm text-red-500">Client email is required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                <div className="flex items-center gap-2">
                  {renderStars(formData.rating, true)}
                  <span className="ml-2 font-medium">{formData.rating}/5</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceUsed">Service Used *</Label>

                <Select
                  value={formData.serviceUsed}
                  onValueChange={(value) => {
                    setFormData({ ...formData, serviceUsed: value });
                    if (errors.serviceUsed && value.trim()) {
                      setErrors(prev => ({ ...prev, serviceUsed: false }));
                    }
                  }}
                  disabled={!allUsers?.length}
                >
                  <SelectTrigger
                    id="serviceUsed"
                    className={errors.serviceUsed ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>

                  <SelectContent>
                    {Array.from(
                      new Set(
                        allUsers.flatMap((user: any) =>
                          user.servicesUsed?.map((service: any) => service.serviceName) || []
                        )
                      )
                    )
                    .filter((serviceName: string) => serviceName && serviceName.trim() !== "")
                    .map((serviceName: string) => (
                      <SelectItem key={serviceName} value={serviceName}>
                        {serviceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceUsed && (
                  <p className="text-sm text-red-500">Service used is required</p>
                )}
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="problem">Problem *</Label>
              <Input
                id="problem"
                value={formData.problem}
                onChange={(e) => {
                  setFormData({ ...formData, problem: e.target.value });
                  if (errors.problem && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, problem: false }));
                  }
                }}
                placeholder="Enter the problem that was treated"
                className={errors.problem ? "border-red-500" : ""}
              />
              {errors.problem && (
                <p className="text-sm text-red-500">Problem is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Testimonial Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  if (errors.content && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, content: false }));
                  }
                }}
                placeholder="Enter the client's testimonial..."
                rows={4}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-sm text-red-500">Testimonial content is required</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="featured">
                Feature this testimonial on homepage
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingTestimonial ? "Updating..." : "Adding..."}
                </>
              ) : (
                editingTestimonial ? "Update Testimonial" : "Add Testimonial"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              testimonial and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Testimonial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}