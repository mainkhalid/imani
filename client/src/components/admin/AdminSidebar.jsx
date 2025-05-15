import React from 'react'
import { Link } from 'react-router-dom'
import { 
  UsersIcon,
  CreditCardIcon,
  HomeIcon,
  SettingsIcon,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const AdminSidebar = () => {
  const { currentUser } = useAuth()
  
  return (
    <aside className="md:w-64 bg-white p-4 rounded-lg shadow">
      <nav className="space-y-1">
        <Link
          to="/admin/dashboard"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/admin/donations"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <CreditCardIcon className="h-5 w-5" />
          <span>Donations</span>
        </Link>
        {currentUser?.role === 'admin' && (
          <>
            <Link
              to="/admin/visitation-planner"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <UsersIcon className="h-5 w-5" />
              <span>Visitation</span>
            </Link>
            <Link
              to="/admin/visitation-list"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <UsersIcon className="h-5 w-5" />
              <span>Visitation List</span>
            </Link>
            <Link
              to="/admin/user-management"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </Link>
          </>
        )}
        <Link
          to="/admin/settings"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <SettingsIcon className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Visit Website</span>
        </Link>
      </nav>
    </aside>
  )
}