import React from 'react'
import { LogOutIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export const AdminHeader = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="bg-orange-600 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Imani Foundation Admin</h1>
          {currentUser?.role && (
            <span className="bg-orange-700 text-xs px-2 py-1 rounded">
              {currentUser.role}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Welcome, {currentUser?.username || currentUser?.name || 'User'}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-orange-700 hover:bg-orange-800 px-3 py-1 rounded transition-colors"
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}