import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ErrorToast } from "../components/Toast/Toasters";

export function ProtectedRoute({ children }) {
  const { authUser, checkAuth } = useAuthStore();
  if (authUser) return children;
  try {
    checkAuth();
  } catch (error) {
    ErrorToast(error.response?.data?.error || "Failed to check authentication");
  }
  return <Navigate to="/login" replace />;
}

export function ProtectedAuthRoute({ children }) {
  const { authUser } = useAuthStore();

  if (!authUser) return children;

  return <Navigate to="/" replace />;
}

export function ProtectedVerifyRoute({ children }) {
  const { authUser } = useAuthStore();

  if (!authUser) return;
  if (authUser.user.codeAuthentication) return { children };

  return <Navigate to="/" replace />;
}
