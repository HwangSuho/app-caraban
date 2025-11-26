import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center text-slate-300 py-10">Loading session...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
