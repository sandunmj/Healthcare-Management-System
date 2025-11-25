import { useState, lazy, Suspense } from "react";
import LoginPage from "./components/LoginPage";
import { Toaster } from "./components/ui/sonner";

// Lazy load dashboards to reduce memory usage
const PatientDashboard = lazy(
  () => import("./components/PatientDashboard"),
);
const DoctorDashboard = lazy(
  () => import("./components/DoctorDashboard"),
);
const AdminDashboard = lazy(
  () => import("./components/AdminDashboard"),
);

export type UserRole = "patient" | "doctor" | "admin" | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="size-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-muted-foreground">
                Loading dashboard...
              </p>
            </div>
          </div>
        }
      >
        {currentUser.role === "patient" && (
          <PatientDashboard
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
        {currentUser.role === "doctor" && (
          <DoctorDashboard
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
        {currentUser.role === "admin" && (
          <AdminDashboard
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
      </Suspense>
      <Toaster />
    </div>
  );
}