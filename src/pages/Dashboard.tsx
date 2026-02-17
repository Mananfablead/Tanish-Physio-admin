import {
  Users,
  Stethoscope,
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  BadgeCheck,
  IndianRupee,
  CalendarClock,
  CheckCircle,
  Hourglass,
  Layers
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpiredItemsDashboard } from '@/components/ExpiredItemsDashboard';
import { AlertCircle } from 'lucide-react';
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
  }



  return (
    <div className="space-y-6 dashboard-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's your platform overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="" onClick={exportToPDF}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={
            stats?.stats?.totalUsers
              ? stats.stats.totalUsers.toLocaleString()
              : "0"
          }
          change={{ value: 12.5, isPositive: true }}
          icon={Users} // ✅ correct
          iconColor="bg-info"
        />

        <StatCard
          title="Active Subscriptions"
          value={
            stats?.stats?.activeSubscriptions
              ? stats.stats.activeSubscriptions.toLocaleString()
              : "0"
          }
          change={{ value: 15.3, isPositive: true }}
          icon={BadgeCheck} // 🔥 better than CreditCard
          iconColor="bg-primary"
        />

        <StatCard
          title="Total Revenue"
          value={`₹${
            stats?.stats?.totalRevenue
              ? stats.stats.totalRevenue.toLocaleString()
              : "0"
          }`}
          change={{ value: 18.7, isPositive: true }}
          icon={IndianRupee} // 🔥 better than DollarSign (India)
          iconColor="bg-success"
        />

        <StatCard
          title="Upcoming Sessions"
          value={
            stats?.stats?.upcomingSessions != null
              ? stats.stats.upcomingSessions.toString()
              : "0"
          }
          icon={CalendarClock} // 🔥 more specific
          iconColor="bg-warning"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Today"
          value={
            stats?.stats?.completedToday != null
              ? stats.stats.completedToday.toString()
              : "0"
          }
          icon={CheckCircle} // 🔥 completion indicator
          iconColor="bg-success"
        />

        <StatCard
          title="Pending Bookings"
          value={
            stats?.stats?.pendingBookings != null
              ? stats.stats.pendingBookings.toString()
              : "0"
          }
          icon={Hourglass} // 🔥 pending / waiting
          iconColor="bg-warning"
        />

        <StatCard
          title="Total Subscription Plans"
          value={
            stats?.stats?.totalSubscriptionPlans != null
              ? stats.stats.totalSubscriptionPlans.toString()
              : "0"
          }
          icon={Layers} // 🔥 stack / plans
          iconColor="bg-primary"
        />

        <StatCard
          title="Total Services"
          value={
            stats?.stats?.totalServices != null
              ? stats.stats.totalServices.toString()
              : "0"
          }
          icon={Stethoscope} // ✅ perfect
          iconColor="bg-info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart revenueData={stats?.revenueChart ?? []} />
        <SessionsChart sessionsData={stats?.sessionsChart ?? []} />
      </div>

      {/* User Growth Chart */}
      <UserGrowthChart userGrowthData={stats?.userGrowthChart ?? []} />

      {/* Expiration Overview Section */}
      {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h3 className="font-bold text-yellow-800 text-lg">
            Expiration Overview
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-slate-600">Expiring Soon (7 days)</p>
            <p className="text-2xl font-bold text-yellow-600">0</p>
            <p className="text-xs text-slate-500">Subscriptions & Services</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-slate-600">Recently Expired</p>
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-xs text-slate-500">Past 30 days</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-slate-600">Total Expired</p>
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-xs text-slate-500">All time</p>
          </div>
        </div>
      </div> */}

      {/* Expired Items Dashboard */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">
          Expired Items Overview
        </h3>
        <ExpiredItemsDashboard />
      </div>

      {/* Activity & Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity recentActivityData={stats?.recentActivity ?? []} />
        <UpcomingSessions
          upcomingSessionsData={stats?.upcomingSessions ?? []}
        />
      </div>
    </div>
  );
}
