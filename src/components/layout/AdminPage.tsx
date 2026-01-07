import { AdminLayout } from "@/components/layout/AdminLayout";

interface AdminPageProps {
  children: React.ReactNode;
}

const AdminPage = ({ children }: AdminPageProps) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminPage;
    