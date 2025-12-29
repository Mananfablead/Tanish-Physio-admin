import { useState } from "react";
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

const mockTherapists = [
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

export default function Therapists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedTherapist, setSelectedTherapist] = useState<typeof mockTherapists[0] | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<typeof mockApplications[0] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredTherapists = mockTherapists.filter((therapist) =>
    therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApplications = mockApplications.filter(app => app.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Therapist Management</h1>
          <p className="page-subtitle">Manage therapist profiles and applications</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Therapists ({mockTherapists.length})</TabsTrigger>
          <TabsTrigger value="applications" className="relative">
            Applications
            {pendingApplications.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Therapists */}
        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search therapists..."
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
                    <th>Therapist</th>
                    <th>Specialty</th>
                    <th>Rating</th>
                    <th>Sessions</th>
                    <th>Session Types</th>
                    <th>Status</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTherapists.map((therapist) => (
                    <tr key={therapist.id} className="cursor-pointer" onClick={() => {
                      setSelectedTherapist(therapist);
                      setIsProfileOpen(true);
                    }}>
                      <td>
                        <div>
                          <p className="font-medium">{therapist.name}</p>
                          <p className="text-sm text-muted-foreground">{therapist.email}</p>
                        </div>
                      </td>
                      <td>{therapist.specialty}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="font-medium">{therapist.rating}</span>
                        </div>
                      </td>
                      <td>{therapist.sessions}</td>
                      <td>
                        <div className="flex gap-1">
                          {therapist.sessionTypes.map((type) => (
                            <span key={type} className="status-badge bg-muted text-muted-foreground">
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={cn("status-badge", therapist.status === "active" ? "status-active" : "status-inactive")}>
                          {therapist.status}
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
                              setSelectedTherapist(therapist);
                              setIsProfileOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Video className="w-4 h-4 mr-2" />
                              View Sessions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserX className="w-4 h-4 mr-2" />
                              Disable Account
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
                Showing <span className="font-medium">{filteredTherapists.length}</span> therapists
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
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications" className="space-y-4 mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Specialty</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-muted-foreground">{app.email}</p>
                        </div>
                      </td>
                      <td>{app.specialty}</td>
                      <td className="text-muted-foreground">{app.submitted}</td>
                      <td>
                        <span className={cn(
                          "status-badge",
                          app.status === "pending" ? "status-pending" : "status-rejected"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(app);
                              setIsApplicationOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Therapist Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Therapist Profile</DialogTitle>
          </DialogHeader>
          
          {selectedTherapist && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="font-medium">{selectedTherapist.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedTherapist.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Specialty</label>
                    <p className="font-medium">{selectedTherapist.specialty}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <p>
                      <span className={cn("status-badge", selectedTherapist.status === "active" ? "status-active" : "status-inactive")}>
                        {selectedTherapist.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Session Types</label>
                    <div className="flex gap-1 mt-1">
                      {selectedTherapist.sessionTypes.map((type) => (
                        <span key={type} className="status-badge bg-muted text-muted-foreground">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" size="sm">Edit Profile</Button>
                  <Button variant="outline" size="sm">Manage Sessions</Button>
                  <Button variant="destructive" size="sm">
                    {selectedTherapist.status === "active" ? "Disable" : "Enable"} Account
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">{selectedTherapist.sessions}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-6 h-6 text-warning fill-warning" />
                      <span className="text-3xl font-bold">{selectedTherapist.rating}</span>
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
                      "Excellent therapist! Very professional and knowledgeable."
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

      {/* Application Review Modal */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review the therapist's credentials and decide on their application.
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
    </div>
  );
}
