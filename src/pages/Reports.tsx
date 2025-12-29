import { useState } from "react";
import { Download, FileText, BarChart3, Users, CreditCard, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const userGrowthData = [
  { month: "Jan", users: 1200, newUsers: 320 },
  { month: "Feb", users: 1520, newUsers: 380 },
  { month: "Mar", users: 1900, newUsers: 420 },
  { month: "Apr", users: 2320, newUsers: 480 },
  { month: "May", users: 2800, newUsers: 550 },
  { month: "Jun", users: 3350, newUsers: 620 },
];

const subscriptionData = [
  { month: "Jan", daily: 120, weekly: 340, monthly: 1800 },
  { month: "Feb", daily: 145, weekly: 380, monthly: 2100 },
  { month: "Mar", daily: 160, weekly: 420, monthly: 2400 },
  { month: "Apr", daily: 180, weekly: 460, monthly: 2750 },
  { month: "May", daily: 200, weekly: 500, monthly: 3100 },
  { month: "Jun", daily: 220, weekly: 540, monthly: 3500 },
];

const sessionData = [
  { month: "Jan", completed: 850, cancelled: 45, noShow: 32 },
  { month: "Feb", completed: 980, cancelled: 52, noShow: 38 },
  { month: "Mar", completed: 1120, cancelled: 48, noShow: 41 },
  { month: "Apr", completed: 1280, cancelled: 55, noShow: 35 },
  { month: "May", completed: 1450, cancelled: 60, noShow: 42 },
  { month: "Jun", completed: 1620, cancelled: 58, noShow: 38 },
];

const therapistPerformanceData = [
  { name: "Dr. Sarah Johnson", sessions: 248, rating: 4.9, revenue: 12400 },
  { name: "Dr. Michael Chen", sessions: 312, rating: 4.8, revenue: 15600 },
  { name: "Dr. Lisa Williams", sessions: 186, rating: 4.7, revenue: 9300 },
  { name: "Dr. James Brown", sessions: 94, rating: 4.6, revenue: 4700 },
  { name: "Dr. Emma Davis", sessions: 156, rating: 4.9, revenue: 7800 },
];

const revenueBreakdownData = [
  { name: "Monthly Plans", value: 68, color: "hsl(var(--primary))" },
  { name: "Weekly Plans", value: 18, color: "hsl(var(--success))" },
  { name: "Daily Passes", value: 10, color: "hsl(var(--warning))" },
  { name: "Premium Plans", value: 4, color: "hsl(var(--info))" },
];

const reportTypes = [
  { id: "user_growth", name: "User Growth Report", icon: Users, description: "User registration and growth trends" },
  { id: "subscription", name: "Subscription Report", icon: CreditCard, description: "Subscription performance and metrics" },
  { id: "session", name: "Session Report", icon: Calendar, description: "Session utilization and completion rates" },
  { id: "therapist", name: "Therapist Performance", icon: TrendingUp, description: "Individual therapist metrics" },
  { id: "revenue", name: "Revenue Report", icon: BarChart3, description: "Financial performance and breakdown" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("user_growth");
  const [dateRange, setDateRange] = useState("6months");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Platform performance insights and data exports</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveTab(report.id)}
            className={`stat-card text-left transition-all ${
              activeTab === report.id ? "ring-2 ring-primary border-primary" : ""
            }`}
          >
            <report.icon className={`w-6 h-6 mb-2 ${activeTab === report.id ? "text-primary" : "text-muted-foreground"}`} />
            <p className="font-medium text-sm">{report.name}</p>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-card rounded-lg border border-border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">
            {reportTypes.find(r => r.id === activeTab)?.name}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* User Growth */}
        {activeTab === "user_growth" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-primary">6,850</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-success">+2,770</p>
                <p className="text-sm text-muted-foreground">New This Period</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-info">68%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="Total Users" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="newUsers" name="New Users" stroke="hsl(var(--success))" strokeWidth={2} fill="hsl(var(--success))" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Subscription Performance */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-primary">4,230</p>
                <p className="text-sm text-muted-foreground">Active Subs</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-success">$45,800</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-warning">68%</p>
                <p className="text-sm text-muted-foreground">Renewal Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-info">$38.50</p>
                <p className="text-sm text-muted-foreground">Avg. Sub Value</p>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="monthly" name="Monthly" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="weekly" name="Weekly" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="daily" name="Daily" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Session Utilization */}
        {activeTab === "session" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-primary">7,500</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-success">95.2%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-warning">318</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-3xl font-bold text-destructive">226</p>
                <p className="text-sm text-muted-foreground">No-shows</p>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="noShow" name="No-show" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Therapist Performance */}
        {activeTab === "therapist" && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Therapist</th>
                    <th>Sessions</th>
                    <th>Rating</th>
                    <th>Revenue</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {therapistPerformanceData.map((therapist, index) => (
                    <tr key={index}>
                      <td className="font-medium">{therapist.name}</td>
                      <td>{therapist.sessions}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className="text-warning">★</span>
                          <span>{therapist.rating}</span>
                        </div>
                      </td>
                      <td className="font-medium">${therapist.revenue.toLocaleString()}</td>
                      <td>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${(therapist.sessions / 312) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue Analytics */}
        {activeTab === "revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Revenue by Plan Type</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Revenue Summary</h4>
              {revenueBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${((45800 * item.value) / 100).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
