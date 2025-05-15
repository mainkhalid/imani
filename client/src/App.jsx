import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HeroPage } from "./pages/user/HeroPage";
import { About } from "./pages/user/About";
import { Program } from "./pages/user/Program";
import { ImpactPage } from "./pages/user/ImpactPage";
import { DonationPage } from "./pages/user/DonationPage";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { AdminLayout } from "./layouts/AdminLayout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Admin } from "./pages/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HeroPage />} />
            <Route path="about" element={<About />} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="donate" element={<DonationPage />} />
            <Route path="programs" element={<Program />} />
          </Route>

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}
