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

export default function Dashboard() {
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
          value="6,850"
          change={{ value: 12.5, isPositive: true }}
          icon={Users}
          iconColor="bg-info"
          
        />
        <StatCard
          title="Active Staff"
          value="120"
          change={{ value: 8.2, isPositive: true }}
          icon={Stethoscope}
          iconColor="bg-warning"
        />
        <StatCard
          title="Active Subscriptions"
          value="4,230"
          change={{ value: 15.3, isPositive: true }}
          icon={CreditCard}
          iconColor="bg-primary"
        />
        <StatCard
          title="Total Revenue"
          value="Rs 45,800"
          change={{ value: 18.7, isPositive: true }}
          icon={DollarSign}
          iconColor="bg-success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Sessions"
          value="156"
          icon={Calendar}
          iconColor="bg-warning"
        />
        <StatCard
          title="Completed Today"
          value="48"
          icon={Clock}
          iconColor="bg-primary"
        />
        <StatCard
          title="Avg. Therapist Rating"
          value="4.8"
          icon={Star}
          iconColor="bg-warning"
        />
        <StatCard
          title="Conversion Rate"
          value="68%"
          change={{ value: 5.2, isPositive: true }}
          icon={TrendingUp}
          iconColor="bg-success"
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
