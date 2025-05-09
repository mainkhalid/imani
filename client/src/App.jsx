import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'
import { AdminLayout } from './layouts/AdminLayout'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Admin } from './pages/AdminPage'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Admin />
              </AdminLayout>
            </ProtectedRoute>
          } />

        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  )
}