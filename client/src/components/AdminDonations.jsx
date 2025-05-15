import React, { useState, useEffect } from 'react'
import { DownloadIcon, SearchIcon, FilterIcon } from 'lucide-react'
import axios from 'axios'

export const AdminDonations = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  })
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  // Fetch donations from API
  const fetchDonations = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      params.append('page', pagination.page)
      params.append('limit', 10)
      
      const response = await axios.get(`/api/donations?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      setDonations(response.data.data.donations)
      setPagination(response.data.data.pagination)
      setError(null)
    } catch (err) {
      console.error('Error fetching donations:', err)
      setError('Failed to load donations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Export donations as CSV
  const exportCSV = async () => {
    try {
      // Build query parameters to export all filtered data
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      params.append('export', 'csv')
      
      const response = await axios.get(`/api/donations?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'text/csv'
        },
        responseType: 'blob'
      })
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `donations-export-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error exporting donations:', err)
      setError('Failed to export donations. Please try again.')
    }
  }

  // Handle status change
  const handleStatusChange = (id, newStatus) => {
    const updateStatus = async () => {
      try {
        await axios.patch(`/api/donations/${id}/status`, 
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        // Refresh the donations list
        fetchDonations()
      } catch (err) {
        console.error('Error updating donation status:', err)
        setError('Failed to update donation status. Please try again.')
      }
    }
    
    updateStatus()
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  // Calculate total amount from current filtered donations
  const totalAmount = donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  )

  // Format date from ISO to readable format
  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A'
    return new Date(isoDate).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Load donations when component mounts or when filters change
  useEffect(() => {
    fetchDonations()
  }, [searchTerm, filterStatus, pagination.page, dateRange])

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    // Reset to first page when searching
    if (pagination.page !== 1) {
      setPagination({ ...pagination, page: 1 })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Donations</h2>
        <button 
          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          onClick={exportCSV}
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by donor, phone, or amount"
                className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FilterIcon className="text-gray-400 h-5 w-5" />
            <select 
              className="p-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setPagination({ ...pagination, page: 1 }) // Reset to page 1 when filter changes
              }}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        
        {/* Date range filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="flex-1 flex items-end">
            <button 
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-100 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-green-800">
            Total Donations ({pagination.total})
          </h3>
          <p className="text-2xl font-bold text-green-600">
            KES {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading donations...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-800">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Donor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount (KES)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {donation.donor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            donation.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : donation.status === 'refunded'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {donation.status.charAt(0).toUpperCase() +
                            donation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => window.location.href = `/admin/donations/${donation._id}`}
                          >
                            View
                          </button>
                          {donation.status === 'pending' && (
                            <select
                              className="text-sm border border-gray-300 rounded p-1"
                              onChange={(e) => handleStatusChange(donation._id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="" disabled>Update Status</option>
                              <option value="completed">Mark Completed</option>
                              <option value="failed">Mark Failed</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.page === i + 1
                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.pages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}