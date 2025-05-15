import React, { useState } from 'react'
import { 
  Calendar,
  Upload,
  X, 
  Save,
  DollarSign,
  Users,
  Home,
  Clock,
  Loader,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'  

export const VisitationPlanner = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  // Form state with validation
  const [visitationData, setVisitationData] = useState({
    homeName: '',
    visitDate: '',
    numberOfChildren: 0,
    budget: {
      transportation: 0,
      food: 0,
      supplies: 0,
      gifts: 0,
      other: 0
    },
    notes: '',
    status: 'planned', 
  })
  
  const [validation, setValidation] = useState({
    homeName: true,
    visitDate: true,
    numberOfChildren: true
  })
  
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  
  const validateField = (name, value) => {
    switch (name) {
      case 'homeName':
        return value.trim() !== ''
      case 'visitDate':
        return value !== ''
      case 'numberOfChildren':
        return parseInt(value) >= 0
      default:
        return true
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setVisitationData({
      ...visitationData,
      [name]: value
    })
    
    setValidation({
      ...validation,
      [name]: validateField(name, value)
    })
  }
  
  const handleBudgetChange = (e) => {
    const { name, value } = e.target
    setVisitationData({
      ...visitationData,
      budget: {
        ...visitationData.budget,
        [name]: parseFloat(value) || 0
      }
    })
  }
  
  const getTotalBudget = () => {
    return Object.values(visitationData.budget).reduce((sum, value) => sum + value, 0)
  }
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      // Limit to 5 files max
      const remainingSlots = 5 - files.length
      if (remainingSlots <= 0) {
        toast.warning('Maximum 5 images allowed')
        return
      }
      
      const selectedFiles = Array.from(e.target.files).slice(0, remainingSlots)
      
      // Validate file size and type
      const validFiles = selectedFiles.filter(file => {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`${file.name} exceeds 5MB limit`)
          return false
        }
        
        // Check file type
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
          toast.warning(`${file.name} is not a supported image format`)
          return false
        }
        
        return true
      })
      
      setFiles([...files, ...validFiles])
      
      // Create preview URLs for images
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrls(prevUrls => [...prevUrls, e.target.result])
        }
        reader.readAsDataURL(file)
      })
    }
  }
  
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }
  
  const validateForm = () => {
    const newValidation = {
      homeName: validateField('homeName', visitationData.homeName),
      visitDate: validateField('visitDate', visitationData.visitDate),
      numberOfChildren: validateField('numberOfChildren', visitationData.numberOfChildren)
    }
    
    setValidation(newValidation)
    return Object.values(newValidation).every(isValid => isValid)
  }
  
  
const uploadImageToCloudinary = async (file) => {
  try {
    // Get auth token
    const token = localStorage.getItem('token');
    
    // Create form data for the file
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload through your backend API
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }
    
    // Parse the response from your backend
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    return {
      public_id: data.image.public_id,
      url: data.image.url
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly')
      return
    }
    
    setLoading(true)
    
    try {
      // Get auth token
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication required')
      }
      
      // First, upload all images directly to Cloudinary
      let uploadedImages = []
      
      if (files.length > 0) {
        const toastId = toast.loading(`Uploading images (0/${files.length})...`)
        
        try {
          // Upload images one by one and track progress
          for (let i = 0; i < files.length; i++) {
            toast.loading(`Uploading images (${i+1}/${files.length})...`, { id: toastId })
            const imageData = await uploadImageToCloudinary(files[i])
            uploadedImages.push(imageData)
          }
          
          toast.success(`Successfully uploaded ${files.length} images`, { id: toastId })
        } catch (error) {
          toast.error('Failed to upload one or more images', { id: toastId })
          throw error
        }
      }
      
      // Create proper JSON data structure that matches the schema
      const visitationPayload = {
        homeName: visitationData.homeName,
        visitDate: visitationData.visitDate,
        numberOfChildren: parseInt(visitationData.numberOfChildren),
        status: visitationData.status,
        notes: visitationData.notes,
        budget: {
          transportation: parseFloat(visitationData.budget.transportation) || 0,
          food: parseFloat(visitationData.budget.food) || 0,
          supplies: parseFloat(visitationData.budget.supplies) || 0,
          gifts: parseFloat(visitationData.budget.gifts) || 0,
          other: parseFloat(visitationData.budget.other) || 0
        },
        createdBy: currentUser._id,
        images: uploadedImages // Add the uploaded images data
      }
      
      // Show loading toast for API request
      const saveToastId = toast.loading('Saving visitation plan...')
      
      // Send data to API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitationPayload)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create visitation plan')
      }
      
      // Update toast on success
      toast.success('Visitation plan created successfully!', { id: saveToastId })
      
      // Redirect to visitation list
      navigate('/admin/visitation-list', {
        state: { refreshVisitations: true }
      })
      
    } catch (error) {
      console.error('Error creating visitation plan:', error)
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Plan New Visitation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="homeName">
              Children's Home Name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-500">
                <Home className="h-5 w-5" />
              </span>
              <input
                type="text"
                id="homeName"
                name="homeName"
                value={visitationData.homeName}
                onChange={handleInputChange}
                required
                className={`flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  !validation.homeName ? 'border-red-500' : ''
                }`}
                placeholder="Enter children's home name"
              />
            </div>
            {!validation.homeName && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Please enter a children's home name
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="visitDate">
              Planned Visit Date <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-500">
                <Calendar className="h-5 w-5" />
              </span>
              <input
                type="date"
                id="visitDate"
                name="visitDate"
                value={visitationData.visitDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                className={`flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  !validation.visitDate ? 'border-red-500' : ''
                }`}
              />
            </div>
            {!validation.visitDate && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Please select a future date
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="numberOfChildren">
              Number of Children <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-500">
                <Users className="h-5 w-5" />
              </span>
              <input
                type="number"
                id="numberOfChildren"
                name="numberOfChildren"
                value={visitationData.numberOfChildren}
                onChange={handleInputChange}
                required
                min="0"
                className={`flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  !validation.numberOfChildren ? 'border-red-500' : ''
                }`}
                placeholder="0"
              />
            </div>
            {!validation.numberOfChildren && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Please enter a valid number
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
              Status
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-500">
                <Clock className="h-5 w-5" />
              </span>
              <select
                id="status"
                name="status"
                value={visitationData.status}
                onChange={handleInputChange}
                className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Budget Allocation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1" htmlFor="transportation">
                Transportation
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-100 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  id="transportation"
                  name="transportation"
                  value={visitationData.budget.transportation}
                  onChange={handleBudgetChange}
                  min="0"
                  step="0.01"
                  className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm mb-1" htmlFor="food">
                Food & Drinks
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-100 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  id="food"
                  name="food"
                  value={visitationData.budget.food}
                  onChange={handleBudgetChange}
                  min="0"
                  step="0.01"
                  className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm mb-1" htmlFor="supplies">
                Supplies
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-100 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  id="supplies"
                  name="supplies"
                  value={visitationData.budget.supplies}
                  onChange={handleBudgetChange}
                  min="0"
                  step="0.01"
                  className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm mb-1" htmlFor="gifts">
                Gifts
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-100 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  id="gifts"
                  name="gifts"
                  value={visitationData.budget.gifts}
                  onChange={handleBudgetChange}
                  min="0"
                  step="0.01"
                  className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm mb-1" htmlFor="other">
                Other Expenses
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-100 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  id="other"
                  name="other"
                  value={visitationData.budget.other}
                  onChange={handleBudgetChange}
                  min="0"
                  step="0.01"
                  className="flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Total Budget
              </label>
              <div className="p-2 bg-orange-50 border border-orange-200 rounded-md font-medium text-orange-700">
                ${getTotalBudget().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
            Visit Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={visitationData.notes}
            onChange={handleInputChange}
            rows="4"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Add any additional notes or details about this visitation..."
          ></textarea>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Images (Max 5)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <input
              type="file"
              id="images"
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="images" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-700 mb-1">Drag & drop images here or click to browse</p>
                <p className="text-xs text-gray-500">JPG, PNG or GIF files up to 5MB each</p>
              </div>
            </label>
          </div>
          
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({previewUrls.length}/5)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="h-24 w-full object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Visitation Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}