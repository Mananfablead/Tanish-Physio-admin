import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserX,
  Download,
  Plus,
  Trash,
  Mail,
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

const filters = ["All", "Active Subscription", "Expired", "No Subscription"];

export default function Users() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: users = [], loading, pagination } = useSelector(
    (state: any) => state.users
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "patient",
    status: "active"
  });

  /* ---------------- FETCH USERS ---------------- */
  useEffect(() => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      })
    );
  }, [dispatch, currentPage, searchQuery]);

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

  /* ---------------- FILTER LOGIC (FIX) ---------------- */
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

    dispatch(createUser(newUser))
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
          role: "client",
          status: "active"
        });
        // Refresh user list
        dispatch(fetchUsers({ page: currentPage, limit: 10, search: searchQuery }));
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
                {filteredUsers.map((user) => (
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
          {pagination && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} users
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
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                  {pagination.totalPages > 5 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
        <DialogContent className="max-w-md">
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
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
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
