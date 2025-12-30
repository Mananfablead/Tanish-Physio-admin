import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Eye, UserCheck, UserX, Download, Star, Video, FileText, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
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

const mockStaff = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah@clinic.com", specialty: "Sports Injury", rating: 4.9, sessions: 248, status: "active", sessionTypes: ["1-on-1", "Group"] },
  { id: 2, name: "Dr. Michael Chen", email: "michael@clinic.com", specialty: "Rehabilitation", rating: 4.8, sessions: 312, status: "active", sessionTypes: ["1-on-1"] },
  { id: 3, name: "Dr. Lisa Williams", email: "lisa@clinic.com", specialty: "Pain Management", rating: 4.7, sessions: 186, status: "active", sessionTypes: ["Group"] },
  { id: 4, name: "Dr. James Brown", email: "james@clinic.com", specialty: "Orthopedic", rating: 4.6, sessions: 94, status: "active", sessionTypes: ["1-on-1"] },
  { id: 5, name: "Dr. Emma Davis", email: "emma@clinic.com", specialty: "Pediatric", rating: 4.9, sessions: 156, status: "inactive", sessionTypes: ["1-on-1", "Group"] },
];

const mockApplications = [
  { id: 1, name: "Dr. Robert Martinez", email: "robert@email.com", specialty: "Neurological", submitted: "2024-03-10", status: "pending" },
  { id: 2, name: "Dr. Jennifer White", email: "jennifer@email.com", specialty: "Geriatric", submitted: "2024-03-12", status: "pending" },
  { id: 3, name: "Dr. Thomas Anderson", email: "thomas@email.com", specialty: "Sports Medicine", submitted: "2024-03-08", status: "rejected" },
];

const mockSessionHistory = [
  { id: 1, patient: "John Smith", date: "2024-03-15", time: "10:00 AM", type: "1-on-1", status: "completed", feedback: "Excellent session, very helpful.", rating: 5, performance: "95%" },
  { id: 2, patient: "Sarah Wilson", date: "2024-03-15", time: "11:30 AM", type: "Group", status: "completed", feedback: "Great group dynamics.", rating: 4, performance: "88%" },
  { id: 3, patient: "Michael Brown", date: "2024-03-16", time: "02:00 PM", type: "1-on-1", status: "cancelled", feedback: "-", rating: 0, performance: "0%" },
  { id: 4, patient: "Emily Davis", date: "2024-03-17", time: "09:00 AM", type: "1-on-1", status: "scheduled", feedback: "Pending", rating: 0, performance: "-" },
];

export default function Staff() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<typeof mockApplications[0] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isViewSessionsOpen, setIsViewSessionsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [staffMembers, setStaffMembers] = useState(mockStaff);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", specialty: "" });
  const [addForm, setAddForm] = useState({ name: "", email: "", specialty: "", sessionTypes: ["1-on-1"] });

  useEffect(() => {
    if (selectedStaff) {
      setEditForm({
        name: selectedStaff.name,
        email: selectedStaff.email,
        specialty: selectedStaff.specialty,
      });
      setIsEditing(false);
    }
  }, [selectedStaff]);

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
    setIsProfileOpen(false);
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
                  <tr key={staff.id} className="cursor-pointer" onClick={() => {
                    setSelectedStaff(staff);
                    setIsProfileOpen(true);
                  }}>
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedStaff(staff);
                            setIsProfileOpen(true);
                          }}>
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

      {/* Staff Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={(open) => {
        setIsProfileOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Profile</DialogTitle>
          </DialogHeader>
          
          {selectedStaff && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">Session History</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{selectedStaff.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    {isEditing ? (
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{selectedStaff.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Specialty</label>
                    {isEditing ? (
                      <Input
                        value={editForm.specialty}
                        onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{selectedStaff.specialty}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <p>
                      <span className={cn("status-badge", selectedStaff.status === "active" ? "status-active" : "status-inactive")}>
                        {selectedStaff.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Session Types</label>
                    <div className="flex gap-1 mt-1">
                      {selectedStaff.sessionTypes.map((type) => (
                        <span key={type} className="status-badge bg-muted text-muted-foreground">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  {isEditing ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setStaffMembers(staffMembers.map(t => t.id === selectedStaff.id ? { ...t, ...editForm } : t));
                          setIsEditing(false);
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditForm({
                            name: selectedStaff.name,
                            email: selectedStaff.email,
                            specialty: selectedStaff.specialty,
                          });
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => navigate(`/staff/sessions/${selectedStaff.id}`)}>Manage Sessions</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteStaff(selectedStaff.id)}>
                    Delete Staff
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Patient</th>
                        <th className="px-4 py-2 text-left font-medium">Date</th>
                        <th className="px-4 py-2 text-left font-medium">Type</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockSessionHistory.map((session) => (
                        <tr key={session.id}>
                          <td className="px-4 py-2">{session.patient}</td>
                          <td className="px-4 py-2">
                            <div>{session.date}</div>
                            <div className="text-xs text-muted-foreground">{session.time}</div>
                          </td>
                          <td className="px-4 py-2">{session.type}</td>
                          <td className="px-4 py-2">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                              session.status === "completed" ? "bg-success/10 text-success" :
                              session.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                              "bg-warning/10 text-warning"
                            )}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">{selectedStaff.sessions}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-6 h-6 text-warning fill-warning" />
                      <span className="text-3xl font-bold">{selectedStaff.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-success">2.3%</p>
                    <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="feedback" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">John Doe</p>
                      <div className="flex items-center gap-1 text-warning text-sm">
                        {"★".repeat(5)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Excellent professional! Very knowledgeable and patient."
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Emily Parker</p>
                      <div className="flex items-center gap-1 text-warning text-sm">
                        {"★".repeat(5)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Great session, really helped with my recovery."
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

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
            <DialogTitle>Session History - {selectedStaff?.name}</DialogTitle>
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
