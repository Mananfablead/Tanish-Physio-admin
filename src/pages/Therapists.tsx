import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Eye, UserCheck, UserX, Download, Star, Video, FileText, ChevronLeft, ChevronRight, Check, X, Mail, Shield, Activity, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import { mockStaff, mockApplications, mockSessionHistory } from "@/lib/staff-data";

export default function Staff() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<typeof mockApplications[0] | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isViewSessionsOpen, setIsViewSessionsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [staffMembers, setStaffMembers] = useState(mockStaff);
  const [addForm, setAddForm] = useState({ name: "", email: "", specialty: "", sessionTypes: ["1-on-1"] });



  const filteredStaff = staffMembers.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApplications = mockApplications.filter(app => app.status === "pending");

  const handleAddStaff = () => {
    const newStaff = {
      id: staffMembers.length + 1,
      ...addForm,
      rating: 0,
      sessions: 0,
      status: "active" as const,
      sessionTypes: addForm.sessionTypes
    };
    setStaffMembers([...staffMembers, newStaff]);
    setIsAddStaffOpen(false);
    setAddForm({ name: "", email: "", specialty: "", sessionTypes: ["1-on-1"] });
  };

  const handleDeleteStaff = (id: number) => {
    setStaffMembers(staffMembers.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage staff profiles and applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"  className="gap-2 bg-primary text-white" onClick={() => setIsAddStaffOpen(true)}>
            <UserCheck className="w-4 h-4" />
            Add Staff
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search staff members..."
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
                  <th>Staff Member</th>
                  <th>Specialty</th>
                  <th>Rating</th>
                  <th>Sessions</th>
                  <th>Session Types</th>
                  <th>Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="cursor-pointer" onClick={() => navigate(`/therapists/${staff.id}`)}>
                    <td>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                      </div>
                    </td>
                    <td>{staff.specialty}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="font-medium">{staff.rating}</span>
                      </div>
                    </td>
                    <td>{staff.sessions}</td>
                    <td>
                      <div className="flex gap-1">
                        {staff.sessionTypes.map((type) => (
                          <span key={type} className="status-badge bg-muted text-muted-foreground">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={cn("status-badge", staff.status === "active" ? "status-active" : "status-inactive")}>
                        {staff.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/therapists/${staff.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigate(`/staff/sessions/${staff.id}`);
                          }}>
                            <Video className="w-4 h-4 mr-2" />
                            View Sessions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteStaff(staff.id)}>
                            <UserX className="w-4 h-4 mr-2" />
                            Delete Staff
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
              Showing <span className="font-medium">{filteredStaff.length}</span> staff members
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="min-w-[32px]">1</Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* Add Staff Modal */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>Fill in the details to add a new staff member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Dr. John Smith"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialty</label>
              <Input
                placeholder="e.g. Physiotherapy"
                value={addForm.specialty}
                onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Review Modal */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review the applicant's credentials and decide on their application.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Applicant</label>
                  <p className="font-medium">{selectedApplication.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Specialty</label>
                  <p className="font-medium">{selectedApplication.specialty}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Submitted Documents</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">License_Certificate.pdf</span>
                    <Button variant="ghost" size="sm" className="ml-auto">View</Button>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Degree_Verification.pdf</span>
                    <Button variant="ghost" size="sm" className="ml-auto">View</Button>
                  </div>
                </div>
              </div>

              {selectedApplication.status === "pending" && (
                <div>
                  <label className="text-sm text-muted-foreground">Rejection Reason (optional)</label>
                  <Textarea
                    placeholder="Provide a reason if rejecting..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}
          
          {selectedApplication?.status === "pending" && (
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsApplicationOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive">
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button className="bg-success hover:bg-success/90">
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      {/* View Sessions Modal */}
      <Dialog open={isViewSessionsOpen} onOpenChange={setIsViewSessionsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session History</DialogTitle>
            <DialogDescription>
              Detailed view of all past and upcoming sessions for this staff member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client / Patient</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Feedback</th>
                    <th>Rating</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSessionHistory.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div className="font-medium">{session.patient}</div>
                      </td>
                      <td>
                        <div className="text-sm">{session.date}</div>
                        <div className="text-xs text-muted-foreground">{session.time}</div>
                      </td>
                      <td>
                        <span className="status-badge bg-muted text-muted-foreground">{session.type}</span>
                      </td>
                      <td>
                        <span className={cn(
                          "status-badge",
                          session.status === "completed" ? "status-active" :
                          session.status === "cancelled" ? "status-pending" :
                          "status-inactive"
                        )}>
                          {session.status}
                        </span>
                      </td>
                      <td>
                        <p className="text-xs max-w-[150px] truncate" title={session.feedback}>
                          {session.feedback}
                        </p>
                      </td>
                      <td>
                        {session.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning fill-warning" />
                            <span className="text-sm font-medium">{session.rating}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td>
                        <span className={cn(
                          "font-medium",
                          parseInt(session.performance) >= 90 ? "text-success" :
                          parseInt(session.performance) >= 70 ? "text-warning" :
                          "text-muted-foreground"
                        )}>
                          {session.performance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={() => setIsViewSessionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
