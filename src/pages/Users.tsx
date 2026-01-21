import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Eye, UserX, RefreshCw, Download, ChevronLeft, ChevronRight, Delete, Trash } from "lucide-react";
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, updateUser } from "@/features/users/userSlice";
import { RootState } from "@/store";
import PageLoader from "@/components/PageLoader";

const filters = ["All", "Active Subscription", "Expired", "No Subscription"];

export default function Users() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: users, loading } = useSelector((state: RootState) => state.users);

  console.log("list of users", users)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);


  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      user?.phone?.includes(searchQuery);

    if (activeFilter === "All") return matchesSearch;
    if (activeFilter === "Active Subscription") return matchesSearch && ["Monthly", "Weekly", "Daily"].includes(user.subscription);
    if (activeFilter === "Expired") return matchesSearch && user.subscription === "Expired";
    if (activeFilter === "No Subscription") return matchesSearch && user.subscription === "None";
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getSubscriptionBadge = (subscription) => {
    switch (subscription) {
      case "Monthly":
        return "bg-blue-100 text-blue-700";
      case "Yearly":
        return "bg-purple-100 text-purple-700";
      case "Trial":
        return "bg-yellow-100 text-yellow-700";
      case "none":
      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  const openUserProfile = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Subscription': user.subscription,
      'Status': user.status,
      'Join Date': user.joinDate
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Subscription
      { wch: 10 }, // Status
      { wch: 12 }  // Join Date
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `users_export_${currentDate}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (deleteUserId) {
      dispatch(deleteUser(deleteUserId));
      setDeleteUserId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const cancelDeleteUser = () => {
    setDeleteUserId(null);
    setIsDeleteDialogOpen(false);
  };


  const toggleUserStatus = (user) => {
    if (!user?._id) return;

    const newStatus = user.status === "active" ? "inactive" : "active";

    dispatch(
      updateUser({
        userId: user._id,
        userData: { status: newStatus },
      })
    );
    dispatch(fetchUsers());
  };

  const getSubscriptionLabel = (subscription) => {
    if (!subscription || subscription === "none") return "No Subscription";
    return subscription;
  };



  if (loading && users.length === 0) {
    return <PageLoader text="Loading users..." />;
}




  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage and monitor platform users</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportToExcel}>
          <Download className="w-4 h-4" />
          Export Users
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* <div className="flex items-center gap-2 flex-wrap">
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
        </div> */}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>Join Date</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="cursor-pointer">
                  <td className="font-medium">{user.name}</td>
                  <td className="text-muted-foreground">{user.email}</td>
                  <td className="text-muted-foreground">{user.phone}</td>
                  <td>
                    <td>
                      <span
                        className={cn(
                          "status-badge px-2 py-1 rounded-full text-xs font-medium",
                          getSubscriptionBadge(user.subscription)
                        )}
                      >
                        {getSubscriptionLabel(user.subscription)}
                      </span>
                    </td>

                  </td>
                  <td>
                    <span className={cn("status-badge", user.status === "active" ? "status-active" : "status-inactive")}>
                      {user.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{user.joinDate}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openUserProfile(user._id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user._id)}>
                          <Trash className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleUserStatus(user)}
                          className={user.status === "active" ? "text-destructive" : "text-emerald-600"}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          {user.status === "active" ? "Deactivate User" : "Activate User"}
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
            Showing <span className="font-medium">{startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
            <span className="font-medium">{filteredUsers.length}</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "outline" : "ghost"}
                size="sm"
                className="min-w-[32px]"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
