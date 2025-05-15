import React from 'react'
import { Login } from './auth/Login'
import { AdminLayout } from '../layouts/AdminLayout'
import { useAuth } from '../context/AuthContext'
export const Admin = () => {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-100">
      {user ? <AdminLayout /> : <Login />}
    </div>
  )
}
