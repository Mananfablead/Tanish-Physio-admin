import { useState } from "react";
import { Search, Star, AlertTriangle, CheckCircle, Clock, Filter, ChevronLeft, ChevronRight, MessageSquare, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const mockFeedback = [
  { id: 1, user: "John Doe", therapist: "Dr. Sarah Johnson", rating: 5, comment: "Excellent session! Very helpful exercises and great communication.", date: "2024-03-18", session: "1-on-1" },
  { id: 2, user: "Emily Parker", therapist: "Dr. Michael Chen", rating: 5, comment: "Dr. Chen is very professional and knowledgeable. Highly recommend!", date: "2024-03-17", session: "1-on-1" },
  { id: 3, user: "Mike Wilson", therapist: "Dr. Lisa Williams", rating: 3, comment: "Session was okay, but had some technical issues with video quality.", date: "2024-03-17", session: "Group" },
  { id: 4, user: "Anna Smith", therapist: "Dr. James Brown", rating: 4, comment: "Good session overall. Would have appreciated more time.", date: "2024-03-16", session: "1-on-1" },
  { id: 5, user: "Robert Brown", therapist: "Dr. Sarah Johnson", rating: 2, comment: "The session was rushed and I didn't feel heard. Disappointing experience.", date: "2024-03-16", session: "1-on-1" },
  { id: 6, user: "Lisa Anderson", therapist: "Dr. Michael Chen", rating: 5, comment: "Amazing therapist! The exercises really helped with my back pain.", date: "2024-03-15", session: "1-on-1" },
];

const mockIssues = [
  { id: 1, user: "Mike Wilson", type: "Technical", description: "Video quality was poor during the entire session, couldn't see the exercises clearly.", status: "open", date: "2024-03-17", priority: "high" },
  { id: 2, user: "David Lee", type: "Billing", description: "I was charged twice for my monthly subscription.", status: "in_progress", date: "2024-03-16", priority: "high" },
  { id: 3, user: "Sarah Taylor", type: "Session", description: "Therapist was 15 minutes late to the session.", status: "resolved", date: "2024-03-15", priority: "medium" },
  { id: 4, user: "James Miller", type: "Technical", description: "Unable to access chat feature during session.", status: "open", date: "2024-03-14", priority: "low" },
];

export default function Feedback() {
  const [activeTab, setActiveTab] = useState("feedback");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<typeof mockIssues[0] | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const filteredFeedback = mockFeedback.filter((fb) => {
    const matchesSearch =
      fb.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.therapist.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (ratingFilter === "all") return matchesSearch;
    if (ratingFilter === "low") return matchesSearch && fb.rating <= 3;
    if (ratingFilter === "high") return matchesSearch && fb.rating >= 4;
    return matchesSearch;
  });

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch =
      issue.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && issue.status === statusFilter;
  });

  const averageRating = (mockFeedback.reduce((acc, fb) => acc + fb.rating, 0) / mockFeedback.length).toFixed(1);
  const lowRatings = mockFeedback.filter(fb => fb.rating <= 3).length;
  const openIssues = mockIssues.filter(i => i.status === "open").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "status-rejected";
      case "in_progress":
        return "status-pending";
      case "resolved":
        return "status-active";
      default:
        return "status-inactive";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/15 text-destructive";
      case "medium":
        return "bg-warning/15 text-warning";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating ? "text-warning fill-warning" : "text-muted"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Feedback & Issues</h1>
        <p className="page-subtitle">Monitor user feedback and manage reported issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Star className="w-5 h-5 text-warning fill-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{averageRating}</p>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{mockFeedback.length}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{lowRatings}</p>
              <p className="text-sm text-muted-foreground">Low Ratings</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{openIssues}</p>
              <p className="text-sm text-muted-foreground">Open Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="feedback">Session Feedback</TabsTrigger>
          <TabsTrigger value="issues" className="relative">
            Reported Issues
            {openIssues > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                {openIssues}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or therapist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="high">4-5 Stars</SelectItem>
                <SelectItem value="low">1-3 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredFeedback.map((fb) => (
              <div
                key={fb.id}
                className={cn(
                  "bg-card rounded-lg border p-4 animate-fade-in",
                  fb.rating <= 3 ? "border-destructive/30" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{fb.user}</p>
                      <p className="text-sm text-muted-foreground">Session with {fb.therapist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(fb.rating)}
                    <p className="text-xs text-muted-foreground mt-1">{fb.date}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{fb.comment}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="status-badge bg-muted text-muted-foreground">{fb.session}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="font-medium">{issue.user}</td>
                      <td>
                        <span className="status-badge bg-muted text-muted-foreground">{issue.type}</span>
                      </td>
                      <td className="max-w-xs truncate text-muted-foreground">{issue.description}</td>
                      <td>
                        <span className={cn("status-badge capitalize", getPriorityBadge(issue.priority))}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>
                        <span className={cn("status-badge capitalize", getStatusBadge(issue.status))}>
                          {issue.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{issue.date}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setIsIssueModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Issue Detail Modal */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">User</label>
                  <p className="font-medium">{selectedIssue.user}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="font-medium">{selectedIssue.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Priority</label>
                  <span className={cn("status-badge capitalize", getPriorityBadge(selectedIssue.priority))}>
                    {selectedIssue.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <span className={cn("status-badge capitalize", getStatusBadge(selectedIssue.status))}>
                    {selectedIssue.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="mt-1">{selectedIssue.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about the resolution..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>
              Close
            </Button>
            {selectedIssue?.status !== "resolved" && (
              <>
                {selectedIssue?.status === "open" && (
                  <Button variant="secondary">Mark In Progress</Button>
                )}
                <Button className="bg-success hover:bg-success/90">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Resolved
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
