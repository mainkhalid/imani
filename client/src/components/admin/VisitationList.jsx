import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  PlusCircle, 
  Calendar, 
  Home, 
  Users, 
  DollarSign, 
  Filter, 
  ChevronDown, 
  Search,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'

export const VisitationList = () => {
  const { currentUser } = useAuth()
  const [visitations, setVisitations] = useState([])
  const [filteredVisitations, setFilteredVisitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('asc') // asc or desc
  const [sortField, setSortField] = useState('visitDate')
  const [editingStatus, setEditingStatus] = useState(null)
  const location = useLocation()

  // Fetch visitations from API
  const fetchVisitations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visitations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch visitations')
      }
      
      const responseData = await response.json()
      
      // Extract visitations from the response
      const visitationsArray = responseData.data || responseData
      
      // Ensure it's an array
      const processedVisitations = Array.isArray(visitationsArray) 
        ? visitationsArray 
        : []
      
      setVisitations(processedVisitations)
      applyFilters(processedVisitations, searchQuery, statusFilter)
      
      // Check if redirected from visitation planner
      if (location.state?.refreshVisitations) {
        toast.success('New visitation plan added successfully!')
        // Clear the state to prevent repeated toasts
        window.history.replaceState({}, document.title)
      }
    } catch (err) {
      console.error('Error fetching visitations:', err)
      setError(err.message)
      
      // Add toast for error
      toast.error(err.message || 'Unable to load visitation plans')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchVisitations()
  }, [location.state])

  // Apply filters based on search and status
  const applyFilters = (visitationsData, search, status) => {
    let filtered = [...visitationsData]
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(visit => 
        visit.homeName.toLowerCase().includes(search.toLowerCase()) ||
        visit.notes?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(visit => visit.status === status)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortField === 'visitDate') {
        comparison = new Date(a.visitDate) - new Date(b.visitDate)
      } else if (sortField === 'homeName') {
        comparison = a.homeName.localeCompare(b.homeName)
      } else if (sortField === 'budget') {
        const totalA = Object.values(a.budget).reduce((sum, val) => sum + val, 0)
        const totalB = Object.values(b.budget).reduce((sum, val) => sum + val, 0)
        comparison = totalA - totalB
      } else if (sortField === 'numberOfChildren') {
        comparison = a.numberOfChildren - b.numberOfChildren
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    setFilteredVisitations(filtered)
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    applyFilters(visitations, e.target.value, statusFilter)
  }

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    applyFilters(visitations, searchQuery, status)
    setIsFilterOpen(false)
  }

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortOrder('asc')
    }
    
    applyFilters(visitations, searchQuery, statusFilter)
  }

  // Handle status change
  const handleStatusChange = async (visitationId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visitations/${visitationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update status')
      }
      
      // Update local data to reflect change
      setVisitations(prev => prev.map(visit => {
        if ((visit._id || visit.id) === visitationId) {
          return { ...visit, status: newStatus }
        }
        return visit
      }))
      
      // Update filtered visitations too
      setFilteredVisitations(prev => prev.map(visit => {
        if ((visit._id || visit.id) === visitationId) {
          return { ...visit, status: newStatus }
        }
        return visit
      }))
      
      toast.success(`Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`)
      setEditingStatus(null)
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error(err.message || 'Unable to update status')
    }
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to calculate total budget
  const calculateTotalBudget = (budget) => {
    return Object.values(budget).reduce((sum, val) => sum + val, 0).toFixed(2)
  }

  // Calculate statistics for visitations
  const visitationStats = {
    total: visitations.length,
    planned: visitations.filter(v => v.status === 'planned').length,
    inProgress: visitations.filter(v => v.status === 'in-progress').length,
    completed: visitations.filter(v => v.status === 'completed').length,
    cancelled: visitations.filter(v => v.status === 'cancelled').length,
    totalBudget: visitations.reduce((sum, visit) => sum + Object.values(visit.budget).reduce((s, val) => s + val, 0), 0).toFixed(2)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Visitation Plans</h2>
        <Link 
          to="/admin/visitation-planner" 
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Visitation</span>
        </Link>
      </div>
      
      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Visitations</p>
              <p className="text-2xl font-bold">{visitationStats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Planned</p>
              <p className="text-2xl font-bold">{visitationStats.planned}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{visitationStats.inProgress}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-full">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{visitationStats.completed}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <Home className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold">${visitationStats.totalBudget}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex mb-4 md:mb-0 w-full md:w-1/2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Search by home name or notes..."
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 border border-gray-300 rounded-md p-2 focus:outline-none hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 text-gray-500" />
              <span>Filter by status</span>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleStatusFilterChange('all')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
                      ${statusFilter === 'all' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange('planned')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                      ${statusFilter === 'planned' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                  >
                    Planned
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange('in-progress')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                      ${statusFilter === 'in-progress' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange('completed')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                      ${statusFilter === 'completed' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange('cancelled')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                      ${statusFilter === 'cancelled' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={fetchVisitations}
            className="flex items-center space-x-2 bg-orange-100 text-orange-700 rounded-md p-2 hover:bg-orange-200"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>
      
      {loading && <p className="text-center py-8 text-gray-500">Loading visitations...</p>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {!loading && !error && visitations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No visitations planned yet</h3>
          <p className="text-gray-500 mb-6">Create your first visitation plan to get started</p>
          <Link 
            to="/admin/visitation-planner" 
            className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create New Visitation</span>
          </Link>
        </div>
      )}
      
      {!loading && !error && visitations.length > 0 && filteredVisitations.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
      
      {!loading && !error && filteredVisitations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('homeName')}
                  >
                    <div className="flex items-center">
                      <span>Children's Home</span>
                      {sortField === 'homeName' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('visitDate')}
                  >
                    <div className="flex items-center">
                      <span>Visit Date</span>
                      {sortField === 'visitDate' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('numberOfChildren')}
                  >
                    <div className="flex items-center">
                      <span>Children</span>
                      {sortField === 'numberOfChildren' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('budget')}
                  >
                    <div className="flex items-center">
                      <span>Budget</span>
                      {sortField === 'budget' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisitations.map((visit) => {
                  const visitId = visit._id || visit.id
                  
                  return (
                    <tr key={visitId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Home className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{visit.homeName}</div>
                        </div>
                        {visit.notes && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {visit.notes.substring(0, 60)}{visit.notes.length > 60 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">{formatDate(visit.visitDate)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">{visit.numberOfChildren}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">
                            ${calculateTotalBudget(visit.budget)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {visit.budget.transportation > 0 && (
                            <span className="mr-2">Transport: ${visit.budget.transportation.toFixed(2)}</span>
                          )}
                          {visit.budget.food > 0 && (
                            <span>Food: ${visit.budget.food.toFixed(2)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStatus === visitId ? (
                          <select 
                            value={visit.status}
                            onChange={(e) => handleStatusChange(visitId, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                            onBlur={() => setEditingStatus(null)}
                          >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <div className="flex items-center">
                            <span 
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(visit.status)}`}
                            >
                              {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                            </span>
                            <button 
                              onClick={() => setEditingStatus(visitId)}
                              className="ml-2 text-gray-400 hover:text-gray-700"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link 
                            to={`/admin/visitations/${visitId}`} 
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <Link 
                            to={`/admin/visitations/${visitId}/edit`} 
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredVisitations.length} of {visitations.length} visitation{visitations.length !== 1 ? 's' : ''}
              </div>
              
              {statusFilter !== 'all' && (
                <button 
                  onClick={() => handleStatusFilterChange('all')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}