import { Users, UserCog, CreditCard, Calendar, DollarSign, Star, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your platform overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="6,850"
          change={{ value: 12.5, isPositive: true }}
          icon={Users}
          iconColor="text-info"
        />
        <StatCard
          title="Active Therapists"
          value="120"
          change={{ value: 8.2, isPositive: true }}
          icon={UserCog}
          iconColor="text-success"
        />
        <StatCard
          title="Active Subscriptions"
          value="4,230"
          change={{ value: 15.3, isPositive: true }}
          icon={CreditCard}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Revenue"
          value="$45,800"
          change={{ value: 18.7, isPositive: true }}
          icon={DollarSign}
          iconColor="text-success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Sessions"
          value="156"
          icon={Calendar}
          iconColor="text-warning"
        />
        <StatCard
          title="Completed Today"
          value="48"
          icon={Clock}
          iconColor="text-primary"
        />
        <StatCard
          title="Avg. Therapist Rating"
          value="4.8"
          icon={Star}
          iconColor="text-warning"
        />
        <StatCard
          title="Conversion Rate"
          value="68%"
          change={{ value: 5.2, isPositive: true }}
          icon={TrendingUp}
          iconColor="text-success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <SessionsChart />
      </div>

      {/* User Growth Chart */}
      <UserGrowthChart />

      {/* Activity & Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingSessions />
      </div>
    </div>
  );
}
