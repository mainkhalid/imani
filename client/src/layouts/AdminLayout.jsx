import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { DashboardHome } from '../components/admin/DashboardHome'
import { AdminDonations } from '../components/AdminDonations'
import { VisitationPlanner } from '../components/admin/VisitationPlanner'
import {VisitationList} from '../components/admin/VisitationList'
import { Settings } from '../components/admin/Settings'
import {UserManagement} from '../components/admin/UserManagement'


export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1 bg-white p-6 rounded-lg shadow">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/donations" element={<AdminDonations />} />
              <Route path="/visitation-planner" element={<VisitationPlanner />} />
              <Route path="/visitation-list" element={<VisitationList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/user-management" element={<UserManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}