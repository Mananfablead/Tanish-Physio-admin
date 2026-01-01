import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Eye, UserX, RefreshCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { mockUsers } from "@/lib/mock-data";

const filters = ["All", "Active Subscription", "Expired", "No Subscription"];

export default function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
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

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Monthly":
      case "Weekly":
      case "Daily":
        return "status-active";
      case "Expired":
        return "status-pending";
      case "None":
        return "status-inactive";
      default:
        return "status-inactive";
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
        <div className="flex items-center gap-2 flex-wrap">
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
                <tr key={user.id} className="cursor-pointer" onClick={() => openUserProfile(user.id)}>
                  <td className="font-medium">{user.name}</td>
                  <td className="text-muted-foreground">{user.email}</td>
                  <td className="text-muted-foreground">{user.phone}</td>
                  <td>
                    <span className={cn("status-badge", getSubscriptionBadge(user.subscription))}>
                      {user.subscription}
                    </span>
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
                        <DropdownMenuItem onClick={() => openUserProfile(user.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Access
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserX className="w-4 h-4 mr-2" />
                          Deactivate User
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
    </div>
  );
}
