import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CreateFlint from "./pages/CreateFlint";
import FlintDetail from "./pages/FlintDetail";
import Profile from "./pages/Profile";
import LetsTalk from "./pages/LetsTalk";
import Clash from "./pages/Clash";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/flint" element={<ProtectedRoute><CreateFlint /></ProtectedRoute>} />
    <Route path="/flint/:id" element={<ProtectedRoute><FlintDetail /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/talk" element={<ProtectedRoute><LetsTalk /></ProtectedRoute>} />
    <Route path="/clash/:flintId" element={<ProtectedRoute><Clash /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-center" theme="dark" />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
