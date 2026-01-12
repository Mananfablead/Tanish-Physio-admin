import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/types/store";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = useSelector((state: RootState) => state.auth.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
