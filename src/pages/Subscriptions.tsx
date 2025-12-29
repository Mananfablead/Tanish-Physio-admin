import { useState } from "react";
import { Plus, Edit2, ToggleLeft, ToggleRight, Search, ChevronLeft, ChevronRight, CreditCard, Users, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const mockPlans = [
  { id: 1, name: "Daily Pass", price: 9.99, sessions: 1, period: "day", autoRenew: false, active: true, subscribers: 156 },
  { id: 2, name: "Weekly Plan", price: 29.99, sessions: 4, period: "week", autoRenew: true, active: true, subscribers: 423 },
  { id: 3, name: "Monthly Plan", price: 49.99, sessions: 12, period: "month", autoRenew: true, active: true, subscribers: 2847 },
  { id: 4, name: "Premium Monthly", price: 79.99, sessions: -1, period: "month", autoRenew: true, active: true, subscribers: 804 },
];

const mockUserSubscriptions = [
  { id: 1, user: "John Doe", email: "john@example.com", plan: "Monthly Plan", startDate: "2024-01-15", endDate: "2024-04-15", status: "active", sessionsUsed: 8 },
  { id: 2, user: "Emily Parker", email: "emily@example.com", plan: "Weekly Plan", startDate: "2024-03-10", endDate: "2024-03-17", status: "active", sessionsUsed: 2 },
  { id: 3, user: "Mike Wilson", email: "mike@example.com", plan: "Monthly Plan", startDate: "2024-02-01", endDate: "2024-03-01", status: "expired", sessionsUsed: 12 },
  { id: 4, user: "Anna Smith", email: "anna@example.com", plan: "Premium Monthly", startDate: "2024-03-01", endDate: "2024-04-01", status: "active", sessionsUsed: 15 },
  { id: 5, user: "Robert Brown", email: "robert@example.com", plan: "Daily Pass", startDate: "2024-03-18", endDate: "2024-03-18", status: "expired", sessionsUsed: 1 },
];

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof mockPlans[0] | null>(null);

  const filteredSubscriptions = mockUserSubscriptions.filter(
    (sub) =>
      sub.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = mockPlans.reduce((acc, plan) => acc + plan.price * plan.subscribers, 0);
  const totalSubscribers = mockPlans.reduce((acc, plan) => acc + plan.subscribers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Subscription Management</h1>
          <p className="page-subtitle">Manage plans and user subscriptions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{mockPlans.length}</p>
              <p className="text-sm text-muted-foreground">Active Plans</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalSubscribers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">68%</p>
              <p className="text-sm text-muted-foreground">Renewal Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button className="gap-2" onClick={() => {
              setSelectedPlan(null);
              setIsEditPlanOpen(true);
            }}>
              <Plus className="w-4 h-4" />
              Create Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "bg-card rounded-lg border p-5 transition-all duration-200 animate-fade-in",
                  plan.active ? "border-border hover:border-primary/30 hover:shadow-md" : "border-border opacity-60"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{plan.period}ly</p>
                  </div>
                  <span className={cn("status-badge", plan.active ? "status-active" : "status-inactive")}>
                    {plan.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold">${plan.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.sessions === -1 ? "Unlimited sessions" : `${plan.sessions} session${plan.sessions > 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-renew</span>
                    <span className={plan.autoRenew ? "text-success" : "text-muted-foreground"}>
                      {plan.autoRenew ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subscribers</span>
                    <span className="font-medium">{plan.subscribers.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsEditPlanOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    {plan.active ? (
                      <ToggleRight className="w-4 h-4 text-success" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* User Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or email..."
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
                    <th>User</th>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Sessions Used</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div>
                          <p className="font-medium">{sub.user}</p>
                          <p className="text-sm text-muted-foreground">{sub.email}</p>
                        </div>
                      </td>
                      <td className="font-medium">{sub.plan}</td>
                      <td className="text-muted-foreground">{sub.startDate}</td>
                      <td className="text-muted-foreground">{sub.endDate}</td>
                      <td>{sub.sessionsUsed}</td>
                      <td>
                        <span className={cn("status-badge", sub.status === "active" ? "status-active" : "status-inactive")}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {sub.status === "active" ? (
                            <>
                              <Button variant="ghost" size="sm">Pause</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Cancel</Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm">Reactivate</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{filteredSubscriptions.length}</span> subscriptions
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
      </Tabs>

      {/* Edit/Create Plan Modal */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
            <DialogDescription>
              {selectedPlan ? "Update the subscription plan details." : "Set up a new subscription plan."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Plan Name</Label>
              <Input
                placeholder="e.g., Monthly Plan"
                defaultValue={selectedPlan?.name || ""}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  placeholder="49.99"
                  defaultValue={selectedPlan?.price || ""}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Period</Label>
                <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background">
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month" selected={selectedPlan?.period === "month"}>Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Session Limit</Label>
              <Input
                type="number"
                placeholder="12 (or -1 for unlimited)"
                defaultValue={selectedPlan?.sessions || ""}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Use -1 for unlimited sessions</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Renew</Label>
                <p className="text-xs text-muted-foreground">Automatically renew at end of period</p>
              </div>
              <Switch defaultChecked={selectedPlan?.autoRenew || false} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Plan is available for purchase</p>
              </div>
              <Switch defaultChecked={selectedPlan?.active !== false} />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditPlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditPlanOpen(false)}>
              {selectedPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
