import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Eye, UserX, RefreshCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 890", subscription: "Monthly", status: "active", joinDate: "2024-01-15" },
  { id: 2, name: "Emily Parker", email: "emily@example.com", phone: "+1 234 567 891", subscription: "Weekly", status: "active", joinDate: "2024-02-20" },
  { id: 3, name: "Mike Wilson", email: "mike@example.com", phone: "+1 234 567 892", subscription: "None", status: "inactive", joinDate: "2024-01-10" },
  { id: 4, name: "Anna Smith", email: "anna@example.com", phone: "+1 234 567 893", subscription: "Monthly", status: "active", joinDate: "2024-03-05" },
  { id: 5, name: "Robert Brown", email: "robert@example.com", phone: "+1 234 567 894", subscription: "Expired", status: "active", joinDate: "2023-12-01" },
  { id: 6, name: "Lisa Anderson", email: "lisa@example.com", phone: "+1 234 567 895", subscription: "Monthly", status: "active", joinDate: "2024-02-28" },
  { id: 7, name: "David Lee", email: "david@example.com", phone: "+1 234 567 896", subscription: "Daily", status: "active", joinDate: "2024-03-10" },
  { id: 8, name: "Sarah Taylor", email: "sarah@example.com", phone: "+1 234 567 897", subscription: "None", status: "inactive", joinDate: "2024-01-25" },
];

const filters = ["All", "Active Subscription", "Expired", "No Subscription"];

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const openUserProfile = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredUsers.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Subscription': user.subscription,
      'Status': user.status,
      'Join Date': user.joinDate
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Subscription
      { wch: 10 }, // Status
      { wch: 12 }  // Join Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `users_export_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filters & Search */}
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

      {/* Users Table */}
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
                <tr key={user.id} className="cursor-pointer" onClick={() => openUserProfile(user)}>
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
                        <DropdownMenuItem onClick={() => openUserProfile(user)}>
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

        {/* Pagination */}
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

      {/* User Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Join Date</label>
                    <p className="font-medium">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Subscription</label>
                    <p>
                      <span className={cn("status-badge", getSubscriptionBadge(selectedUser.subscription))}>
                        {selectedUser.subscription}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Account Status</label>
                    <p>
                      <span className={cn("status-badge", selectedUser.status === "active" ? "status-active" : "status-inactive")}>
                        {selectedUser.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm">Reset Access</Button>
                  <Button variant="outline" size="sm">Assign Subscription</Button>
                  <Button variant="destructive" size="sm">Deactivate</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="questionnaire" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Primary concern?</p>
                    <p className="font-medium">Lower back pain</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Pain intensity (1-10)?</p>
                    <p className="font-medium">6</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Previous treatments?</p>
                    <p className="font-medium">Physical therapy, massage</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="subscriptions" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly Plan</p>
                      <p className="text-sm text-muted-foreground">Active since Jan 15, 2024</p>
                    </div>
                    <span className="status-badge status-active">Active</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-card flex items-center justify-between opacity-60">
                    <div>
                      <p className="font-medium">Weekly Plan</p>
                      <p className="text-sm text-muted-foreground">Dec 1 - Dec 7, 2023</p>
                    </div>
                    <span className="status-badge status-inactive">Expired</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sessions" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session with Dr. Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">March 15, 2024 - 10:00 AM</p>
                      </div>
                      <span className="status-badge status-active">Completed</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session with Dr. Michael Chen</p>
                        <p className="text-sm text-muted-foreground">March 8, 2024 - 2:30 PM</p>
                      </div>
                      <span className="status-badge status-active">Completed</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="feedback" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Dr. Sarah Johnson</p>
                      <div className="flex items-center gap-1 text-warning">
                        {"★".repeat(5)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Excellent session! Very helpful exercises and great communication."
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
