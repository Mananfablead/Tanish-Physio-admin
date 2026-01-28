import {
  Users,
  Stethoscope,
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../assets/style.css';

// Import Redux hooks
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboard } from '@/features/dashboard/dashboardSlice';
import { useEffect } from 'react';
import PageLoader from "@/components/PageLoader";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state: any) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const exportToPDF = async () => {
    const dashboardElement = document.querySelector('.dashboard-content') as HTMLElement;

    if (!dashboardElement) {
      console.error('Dashboard content not found');
      return;
    }

    try {
      // Create canvas from the dashboard element
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scaling to fit the page
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;

      // Center the image
      const x = (pdfWidth - imgScaledWidth) / 2;
      const y = (pdfHeight - imgScaledHeight) / 2;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, imgScaledWidth, imgScaledHeight);

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `dashboard_report_${currentDate}.pdf`;

      // Save PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading && !error) {
    return <PageLoader text="Loading dashboard..." />;
}  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="text-red-500 text-xl">Error loading dashboard: {error}</div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 dashboard-content">
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
          <Button variant="outline" className="" onClick={exportToPDF}>Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.stats?.totalUsers ? stats.stats.totalUsers.toLocaleString() : '0'}
          change={{ value: 12.5, isPositive: true }}
          icon={Users}
          iconColor="bg-info"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.stats?.activeSubscriptions ? stats.stats.activeSubscriptions.toLocaleString() : '0'}
          change={{ value: 15.3, isPositive: true }}
          icon={CreditCard}
          iconColor="bg-primary"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.stats?.totalRevenue ? stats.stats.totalRevenue.toLocaleString() : '0'}`}
          change={{ value: 18.7, isPositive: true }}
          icon={DollarSign}
          iconColor="bg-success"
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats?.stats?.upcomingSessions ? stats.stats.upcomingSessions.toString() : '0'}
          icon={Calendar}
          iconColor="bg-warning"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Today"
          value={stats?.stats?.completedToday ? stats.stats.completedToday.toString() : '0'}
          icon={Clock}
          iconColor="bg-primary"
        />
        <StatCard
          title="Avg. Therapist Rating"
          value={stats?.stats?.avgRating ? stats.stats.avgRating.toString() : '0'}
          icon={Star}
          iconColor="bg-warning"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.stats?.conversionRate ? stats.stats.conversionRate : 0}%`}
          change={{ value: 5.2, isPositive: true }}
          icon={TrendingUp}
          iconColor="bg-success"
        />
        <StatCard
          title="Total Services"
          value={stats?.stats?.totalServices ? stats.stats.totalServices.toString() : '0'}
          icon={Stethoscope}
          iconColor="bg-info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart revenueData={stats?.revenueChart || []} />
        <SessionsChart sessionsData={stats?.sessionsChart || []} />
      </div>

      {/* User Growth Chart */}
      <UserGrowthChart userGrowthData={stats?.userGrowthChart || []} />

      {/* Activity & Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity recentActivityData={stats?.recentActivity || []} />
        <UpcomingSessions upcomingSessionsData={stats?.upcomingSessions || []} />
      </div>
    </div>
  );
}
