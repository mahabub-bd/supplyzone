import type { JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

interface PublicRouteProps {
  children: JSX.Element;
  redirectTo?: string;
}

const PublicRoute = ({
  children,
  redirectTo = "/dashboard",
}: PublicRouteProps) => {
  const { user } = useSelector((state: any) => state.auth);

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;
