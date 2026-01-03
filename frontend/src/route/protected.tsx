import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import { logout } from "../features/auth/authSlice";
import { RootState } from "../store";
import { isTokenExpired } from "../utlis/authUtils";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermissions?: string[];
}

const ProtectedRoute = ({
  children,
  requiredPermissions,
}: ProtectedRouteProps) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { user, token, permissions, expiresAt } = useSelector(
    (state: RootState) => state.auth
  );

  if (!user || !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (isTokenExpired(expiresAt)) {
    dispatch(logout());
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (
    requiredPermissions &&
    !requiredPermissions.every((p) => permissions.includes(p))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
