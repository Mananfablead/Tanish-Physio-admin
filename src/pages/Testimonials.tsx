import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Star, User, Calendar, Award, Filter, CheckCircle, MessageSquare, Clock } from "lucide-react";
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

interface Testimonial {
  id: string;
  clientName: string;
  clientEmail?: string;
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

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    rating: 5,
    content: "",
    serviceUsed: "",
    problem: "",
    status: "pending" as "pending" | "approved" | "rejected",
    featured: false,
  });

  // Mock data
  useEffect(() => {
    const mockTestimonials: Testimonial[] = [
      {
        id: "1",
        clientName: "Sarah Johnson",
        clientEmail: "sarah@example.com",
        rating: 5,
        content: "Exceptional care and professional treatment. The physiotherapist really understood my needs and helped me recover faster than expected.",
        serviceUsed: "Sports Injury Rehabilitation",
        problem: "Knee injury from running",
        status: "approved",
        featured: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random"
      },
      {
        id: "2",
        clientName: "Michael Chen",
        clientEmail: "michael@example.com",
        rating: 4,
        content: "Great facility and knowledgeable staff. My back pain has significantly improved after just a few sessions.",
        serviceUsed: "Back Pain Treatment",
        problem: "Chronic lower back pain",
        status: "approved",
        featured: false,
        createdAt: "2024-01-18T09:30:00Z",
        updatedAt: "2024-01-19T11:15:00Z",
        avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random"
      },
      {
        id: "3",
        clientName: "Emma Rodriguez",
        rating: 5,
        content: "Outstanding service! The team is caring and the results speak for themselves. Highly recommend to anyone needing physiotherapy.",
        serviceUsed: "Post-Surgery Recovery",
        problem: "Recovery after knee surgery",
        status: "pending",
        featured: false,
        createdAt: "2024-01-22T14:20:00Z",
        updatedAt: "2024-01-22T14:20:00Z",
        avatar: "https://ui-avatars.com/api/?name=Emma+Rodriguez&background=random"
      },
      {
        id: "4",
        clientName: "David Wilson",
        clientEmail: "david@example.com",
        rating: 3,
        content: "Decent service but felt rushed during sessions. Could use more personalized attention.",
        serviceUsed: "General Physiotherapy",
        problem: "General muscle tension",
        status: "rejected",
        featured: false,
        createdAt: "2024-01-10T16:45:00Z",
        updatedAt: "2024-01-12T09:30:00Z",
        avatar: "https://ui-avatars.com/api/?name=David+Wilson&background=random"
      }
    ];
    setTestimonials(mockTestimonials);
  }, []);

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         testimonial.serviceUsed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = testimonials.filter(t => t.status === "pending").length;
  const approvedCount = testimonials.filter(t => t.status === "approved").length;
  const featuredCount = testimonials.filter(t => t.featured && t.status === "approved").length;

  const handleCreate = () => {
    setEditingTestimonial(null);
    setFormData({
      clientName: "",
      clientEmail: "",
      rating: 5,
      content: "",
      serviceUsed: "",
      problem: "",
      status: "pending",
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      clientName: testimonial.clientName,
      clientEmail: testimonial.clientEmail || "",
      rating: testimonial.rating,
      content: testimonial.content,
      serviceUsed: testimonial.serviceUsed,
      problem: testimonial.problem,
      status: testimonial.status,
      featured: testimonial.featured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingTestimonial) {
      // Update existing testimonial
      setTestimonials(testimonials.map(t => 
        t.id === editingTestimonial.id 
          ? { ...t, ...formData, updatedAt: new Date().toISOString() }
          : t
      ));
    } else {
      // Create new testimonial
      const newTestimonial: Testimonial = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        problem: formData.problem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTestimonials([...testimonials, newTestimonial]);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: "approved" | "rejected") => {
    setTestimonials(testimonials.map(t => 
      t.id === id 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ));
  };

  const handleFeatureToggle = (id: string) => {
    setTestimonials(testimonials.map(t => 
      t.id === id 
        ? { ...t, featured: !t.featured, updatedAt: new Date().toISOString() }
        : t
    ));
  };

  // Handle delete - opens confirmation dialog
  const handleDelete = (id: string) => {
    setDeleteTestId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteTestId) {
      setTestimonials(testimonials.filter(t => t.id !== deleteTestId));
      setDeleteTestId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteTestId(null);
    setIsDeleteDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            onClick={() => {
              if (interactive) {
                setFormData({...formData, rating: i + 1});
              }
            }}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage client testimonials and reviews</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
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
        <p className="text-2xl font-bold">
          {testimonials.length}
        </p>
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
          <CardDescription>Manage client testimonials and reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Rating</TableHead>
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
                <TableRow key={testimonial.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {testimonial.avatar ? (
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.clientName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.clientName}</div>
                        {testimonial.clientEmail && (
                          <div className="text-sm text-muted-foreground">{testimonial.clientEmail}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating, false)}
                      <span className="text-sm font-medium ml-1">{testimonial.rating}/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{testimonial.problem}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{testimonial.serviceUsed}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(testimonial.status)}>
                      {testimonial.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {testimonial.featured ? (
                      <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {testimonial.status === "pending" && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(testimonial.id, "approved")}
                            className="text-green-600 hover:text-green-700"
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(testimonial.id, "rejected")}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {testimonial.status === "approved" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleFeatureToggle(testimonial.id)}
                          className={testimonial.featured ? "text-blue-600" : "text-muted-foreground"}
                        >
                          {testimonial.featured ? "Unfeature" : "Feature"}
                        </Button>
                      )}
                      
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
                        onClick={() => handleDelete(testimonial.id)}
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
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="Enter client email"
                />
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
                <Input
                  id="serviceUsed"
                  value={formData.serviceUsed}
                  onChange={(e) => setFormData({...formData, serviceUsed: e.target.value})}
                  placeholder="e.g., Sports Injury Rehabilitation"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="problem">Problem *</Label>
              <Input
                id="problem"
                value={formData.problem}
                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                placeholder="Enter the problem that was treated"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
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
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Enter the client's testimonial..."
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="featured">Feature this testimonial on homepage</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTestimonial ? "Update Testimonial" : "Add Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the testimonial and remove it from the system.
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