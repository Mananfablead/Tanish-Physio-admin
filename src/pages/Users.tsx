import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserX,
  Download,
  Plus,
  Trash,
  Mail,
  CreditCard,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, updateUser, createUser } from "@/features/users/userSlice";
import PageLoader from "@/components/PageLoader";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import { API } from "@/api/apiClient";

const filters = ["All", "Active Subscription", "Expired", "No Subscription"];

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { list: users = [], loading } = useSelector(
    (state: any) => state.users
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "patient",
    status: "active",
    assignedServices: [],
    subscriptionPlan: ""
  });

  const [services, setServices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [assignmentType, setAssignmentType] = useState(""); // 'plan' or 'service'

  /* ---------------- FETCH USERS ---------------- */
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Check for query param to auto-open create user modal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("action") === "create") {
      setIsCreateDialogOpen(true);
      // Clean up the URL after opening the modal
      navigate("/users", { replace: true });
    }
  }, [location.search, navigate]);

  // Fetch services and plans when create dialog opens
  useEffect(() => {
    if (isCreateDialogOpen) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          // Fetch services
          console.log('Fetching services from:', API.SERVICES);
          const servicesRes = await apiClient.get(API.SERVICES);
          console.log('Services API response:', servicesRes);
          // The API returns { services: [...] } inside data, so we need to extract it
          const servicesData = Array.isArray(servicesRes.data?.data?.services) 
            ? servicesRes.data.data.services 
            : Array.isArray(servicesRes.data?.data) 
              ? servicesRes.data.data 
              : [];
          setServices(servicesData);
          console.log('Fetched services count:', servicesData.length);
          console.log('Fetched services:', servicesData);

          // Fetch plans
          console.log('Fetching plans from:', API.SUBSCRIPTION_PLANS);
          const plansRes = await apiClient.get(API.SUBSCRIPTION_PLANS);
          console.log('Plans API response:', plansRes);
          // The API returns { plans: [...] } inside data, so we need to extract it
          const plansData = plansRes.data?.data;
          const plansArray = Array.isArray(plansData?.plans) ? plansData.plans : Array.isArray(plansData) ? plansData : [];
          setPlans(plansArray);
          console.log('Fetched plans count:', plansArray.length);
          console.log('Fetched plans:', plansArray);
        } catch (error) {
          console.error("Error fetching services/plans:", error);
          console.error("Error response:", error.response?.data);
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to load services or plans",
            variant: "destructive"
          });
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    }
  }, [isCreateDialogOpen]);

  // Reset assignment type when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setAssignmentType("");
    }
  }, [isCreateDialogOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const matchesSearch = (user, query) => {
    if (!query) return true;

    const q = query.toLowerCase();

    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.toLowerCase().includes(q)
    );
  };

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 🔍 SEARCH FILTER
      if (!matchesSearch(user, searchQuery)) {
        return false;
      }

      // 🎯 SUBSCRIPTION FILTER
      if (activeFilter === "All") return true;

      if (activeFilter === "Active Subscription") {
        return user.subscriptionInfo?.status === "active";
      }

      if (activeFilter === "Expired") {
        return user.subscriptionInfo?.isExpired === true;
      }

      if (activeFilter === "No Subscription") {
        return !user.subscriptionInfo;
      }

      return true;
    });
  }, [users, activeFilter, searchQuery]);

  // Client-side pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);


  /* ---------------- HELPERS ---------------- */
  const getSubscriptionBadge = (status, isExpired) => {
    // Check if subscription is expired first
    if (isExpired) {
      return "bg-red-100 text-red-700";
    }

    // Otherwise check status
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const openUserProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  const exportToExcel = () => {
    const exportData = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Subscription: user.subscriptionInfo?.planName || "None",
      Status: user.status,
      "Join Date": user.joinDate?.split("T")[0],
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    XLSX.writeFile(
      wb,
      `users_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    dispatch(deleteUser(deleteUserId));
    setIsDeleteDialogOpen(false);
  };

  const toggleUserStatus = (user) => {
    dispatch(
      updateUser({
        userId: user._id,
        userData: {
          status: user.status === "active" ? "inactive" : "active",
        },
      })
    );
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Email)",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    dispatch(createUser({
      ...newUser,
      subscriptionInfo: assignmentType === 'plan' && newUser.subscriptionPlan ? { planId: newUser.subscriptionPlan } : null,
      assignedServices: assignmentType === 'service' ? newUser.assignedServices : []
    }))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "User created successfully! Welcome email with credentials sent to user's email.",
        });
        setIsCreateDialogOpen(false);
        // Reset form
        setNewUser({
          name: "",
          email: "",
          phone: "",
          role: "patient",
          status: "active",
          assignedServices: [],
          subscriptionPlan: ""
        });
        setAssignmentType("");
        // Refresh user list
        dispatch(fetchUsers());
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error || "Failed to create user",
          variant: "destructive"
        });
      });
  };

  const handleInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && users.length === 0) {
    return <PageLoader text="Loading users..." />;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage and monitor platform users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "filter-button",
                activeFilter === filter && "filter-button-active"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE OR EMPTY STATE */}
      {filteredUsers.length > 0 ? (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                 
                  <th>Phone</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {/* Avatar */}
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Status Dot */}
                          <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.status === "active" ? "bg-green-500" : "bg-gray-400"
                              }`}
                          />
                        </div>

                        {/* User Info */}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>{user.phone}</td>
                    <td>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          getSubscriptionBadge(user.subscriptionInfo?.status, user.subscriptionInfo?.isExpired)
                        )}
                      >
                        {user.subscriptionInfo?.planName || "No Subscription"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={cn(
                          "status-badge inline-flex items-center gap-1 capitalize",
                          user.status === "active"
                            ? "status-active"
                            : "status-inactive"
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{user.joinDate?.split("T")[0]}</td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openUserProfile(user._id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleUserStatus(user)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                      variant={currentPage === pageNum ? "default" : "outline"}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="border rounded-lg p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Users Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || activeFilter !== "All"
              ? "No users match your current search or filter criteria."
              : "There are no users in the system yet."}
          </p>
        </div>
      )}

      {/* CREATE USER DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new patient account. A welcome email with auto-generated credentials will be sent to the user's email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter user's full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter user's email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter user's phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={newUser.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {isLoadingData ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Loading services and plans...
              </div>
            ) : (
              <>
                {/* Assignment Type Selection */}
                <div className="space-y-2">
                  <Label>What would you like to assign?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentType('plan');
                        setNewUser(prev => ({ ...prev, assignedServices: [], subscriptionPlan: "" }));
                      }}
                      className={`p-3 border rounded-lg transition-all ${
                        assignmentType === 'plan'
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Subscription Plan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentType('service');
                        setNewUser(prev => ({ ...prev, assignedServices: [], subscriptionPlan: "" }));
                      }}
                      className={`p-3 border rounded-lg transition-all ${
                        assignmentType === 'service'
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <Download className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Service</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentType('none');
                        setNewUser(prev => ({ ...prev, assignedServices: [], subscriptionPlan: "" }));
                      }}
                      className={`p-3 border rounded-lg transition-all ${
                        assignmentType === 'none'
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <UserX className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">None</span>
                    </button>
                  </div>
                </div>

                {/* Subscription Plan Dropdown */}
                {assignmentType === 'plan' && (
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPlan">Select Subscription Plan</Label>
                    <select
                      id="subscriptionPlan"
                      value={newUser.subscriptionPlan}
                      onChange={(e) => handleInputChange("subscriptionPlan", e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Choose a plan...</option>
                      {plans.map((plan) => (
                        <option key={plan.planId} value={plan.planId}>
                          {plan.name} - ₹{plan.price} ({plan.duration})
                        </option>
                      ))}
                    </select>
                    {newUser.subscriptionPlan && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {plans.find(p => p.planId === newUser.subscriptionPlan)?.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Service Dropdown */}
                {assignmentType === 'service' && (
                  <div className="space-y-2">
                    <Label htmlFor="assignedServices">Select Service</Label>
                    <select
                      id="assignedServices"
                      value={newUser.assignedServices[0] || ""}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        // Store as single-item array or empty array if no selection
                        handleInputChange("assignedServices", selectedValue ? [selectedValue] : []);
                      }}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Choose a service...</option>
                      {services.length > 0 ? (
                        services.map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.name} - ₹{service.price}
                          </option>
                        ))
                      ) : (
                        <option disabled>No services available</option>
                      )}
                    </select>
                    {newUser.assignedServices.length > 0 && services.find(s => s._id === newUser.assignedServices[0]) && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {services.find(s => s._id === newUser.assignedServices[0])?.name}
                      </p>
                    )}
                    {services.length === 0 && !isLoadingData && (
                      <p className="text-xs text-red-500">
                        No services available. Please create services first.
                      </p>
                    )}
                  </div>
                )}

                {/* None Selected Message */}
                {assignmentType === 'none' && (
                  <div className="p-4 border rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      No plan or service will be assigned. You can add them later from the user's profile.
                    </p>
                  </div>
                )}

                {!assignmentType && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Select an option above to continue
                  </p>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4 border-t mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={loading || isLoadingData}
            >
              {loading || isLoadingData ? "Creating..." : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
