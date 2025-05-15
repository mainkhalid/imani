import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Home,
  Heart,
  ChevronRight,
  Eye,
  Loader,
  AlertCircle,
  RefreshCw,
  Clock,
  Image as ImageIcon,
  User,
  StickyNote,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Authentication utility functions
const getAuthToken = () => {
  return localStorage.getItem('token'); // Make sure this matches your token storage key
};

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // For JWT tokens, you can check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired on error
  }
};

// Image Gallery Modal Component
const ImageGallery = ({ images, isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  if (!isOpen) return null;
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };
  
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Image Gallery ({activeIndex + 1}/{images.length})</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 min-h-0 relative">
          {images.length > 0 ? (
            <>
              <div className="h-full flex items-center justify-center p-4">
                {/* eslint-disable-next-line */}
                <img 
                  src={images[activeIndex].url || images[activeIndex]} 
                  alt={`Gallery image ${activeIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6 transform rotate-180" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-4 border-t flex space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-16 flex-shrink-0 border-2 rounded overflow-hidden ${
                  index === activeIndex ? 'border-orange-500' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line */}
                <img 
                  src={image.url || image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// VisitationCard Component
const VisitationCard = ({ visitation, formattedDate, daysUntil }) => {
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);
  
  // Calculate total budget - now with better null/undefined handling
  const totalBudget = visitation.budget ? 
    Object.values(visitation.budget).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : 0;
  
  // Format creation date
  const formattedCreationDate = new Date(visitation.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format budget items for display
  const budgetItems = visitation.budget ? Object.entries(visitation.budget).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value: parseFloat(value) || 0
  })) : [];
  
  const getStatusStyles = (status) => {
    switch(status) {
      case 'planned':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'planned':
        return 'Planned Visit';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  };
  
  const handleViewDetails = () => {
    navigate(`/visitation-details/${visitation._id}`);
  };
  
  const handleMakePledge = () => {
    navigate(`/pledge/${visitation._id}`);
  };
  
  // Ensure visitation has all required fields before rendering
  if (!visitation.homeName || !visitation.visitDate) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-6">
        <div className="flex items-center justify-center text-red-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>Invalid visitation data</p>
        </div>
      </div>
    );
  }
  
  // Handle image display
  const hasImages = Array.isArray(visitation.images) && visitation.images.length > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Status Banner */}
      <div className={`p-2 text-center text-white font-medium ${getStatusStyles(visitation.status)}`}>
        {getStatusText(visitation.status)}
      </div>
      
      {/* Preview Image - Show if available */}
      {hasImages && (
        <div 
          className="relative h-48 bg-gray-100 cursor-pointer" 
          onClick={() => setShowGallery(true)}
        >
          {/* eslint-disable-next-line */}
          <img 
            src={visitation.images[0].url || visitation.images[0]} 
            alt={`${visitation.homeName} preview`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white px-3 py-1 text-sm rounded-tl-md">
            <div className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-1" />
              {visitation.images.length}
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {/* Home Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
          <Home className="h-5 w-5 mr-2 text-orange-500" />
          {visitation.homeName}
        </h3>
        
        {/* Visit Date */}
        <div className="flex items-start mb-4">
          <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-600">{formattedDate}</p>
            <p className="text-sm font-medium text-orange-500">{daysUntil}</p>
          </div>
        </div>
        
        {/* Children Count */}
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
          <p className="text-gray-600">
            {visitation.numberOfChildren} {visitation.numberOfChildren === 1 ? 'child' : 'children'}
          </p>
        </div>
        
        {/* Budget */}
        <div className="mb-5">
          <div className="flex items-center mb-2">
            <DollarSign className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
            <p className="text-gray-600 font-medium">Total Budget: ${totalBudget.toFixed(2)}</p>
          </div>
          
          {budgetItems.length > 0 && (
            <div className="ml-7 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
              {budgetItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}:</span>
                  <span className="font-medium">${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Creation Info */}
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Created {formattedCreationDate}</span>
        </div>
        
        {/* Notes */}
        {visitation.notes && (
          <div className="mb-5">
            <div className="flex items-center mb-2">
              <StickyNote className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
              <p className="text-gray-600 font-medium">Notes</p>
            </div>
            <div className="ml-7 bg-gray-50 rounded p-3 text-sm text-gray-700">
              {visitation.notes}
            </div>
          </div>
        )}
        
        {/* Images */}
        {hasImages && (
          <div className="mb-5">
            <div className="flex items-center mb-2">
              <ImageIcon className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
              <p className="text-gray-600 font-medium">Images ({visitation.images.length})</p>
            </div>
            <div className="ml-7 flex space-x-2">
              {visitation.images.slice(0, 1).map((image, index) => (
                <div 
                  key={index}
                  className="w-20 h-20 bg-gray-100 rounded overflow-hidden cursor-pointer"
                  onClick={() => setShowGallery(true)}
                >
                  {/* eslint-disable-next-line */}
                  <img 
                    src={image.url || image} 
                    alt={`${visitation.homeName} image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex mt-6 space-x-3">
          <button 
            onClick={handleViewDetails}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </button>
          {(visitation.status === 'planned' || visitation.status === 'in-progress') && (
            <button
              onClick={handleMakePledge}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              <Heart className="h-4 w-4 mr-2" />
              Make Pledge
            </button>
          )}
        </div>
      </div>
      
      {/* Image Gallery Modal */}
      <ImageGallery 
        images={visitation.images || []}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </div>
  );
};

// Error State Component
const ErrorState = ({ error, onRetry, onLogin }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
    <div className="flex items-start">
      <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
      <div>
        <h3 className="font-medium mb-2">Error loading visitations</h3>
        <p className="text-sm mb-4">{error}</p>
        <div className="flex space-x-3">
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors text-sm font-medium flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try again
          </button>
          {(error.includes('Authentication') || error.includes('Forbidden') || error.includes('session')) && (
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-sm font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Main Visitations Component - FIXED VERSION
const VisitationsContainer = () => {
  const navigate = useNavigate();
  const [visitations, setVisitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Enhanced fetchVisitations function with proper error handling and data structure alignment
  const fetchVisitations = async () => {
    const MAX_RETRIES = 2;
    let retryCount = 0;
    
    const attemptFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get auth token
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required. Please login to view visitations.');
        }
        
        // Check token expiration
        if (isTokenExpired(token)) {
          localStorage.removeItem('token'); // Clear expired token
          throw new Error('Your session has expired. Please login again.');
        }
        
        // Use consistent API URL
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        console.log('Fetching visitations from:', `${BASE_URL}/api/visitations`);
        
        const response = await fetch(`${BASE_URL}/api/visitations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include' // If using cookies
        });
        
        // Handle specific HTTP status codes
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        
        if (response.status === 403) {
          throw new Error('You do not have permission to view visitations.');
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.error('Response was not valid JSON:', errorText);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
          
          throw new Error(errorData.message || `Failed to load data (status ${response.status})`);
        }
        
        // Get response as text first for debugging
        const responseText = await response.text();
        console.log('Raw API response:', responseText.substring(0, 200) + '...');
        
        // Then parse it as JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed response structure:', Object.keys(data));
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          throw new Error('Invalid data format received from server. The server response was not valid JSON.');
        }
        
        // FIXED: Extract visitations from response based on controller response format
        // Looking at visitation.controller.js, the response is: { success: true, count: X, data: [...] }
        let visitationsArray = [];
        
        if (data.success && Array.isArray(data.data)) {
          // This matches our controller's exact response format
          visitationsArray = data.data;
          console.log(`Found ${visitationsArray.length} visitations in data.data array`);
        } else if (Array.isArray(data)) {
          // In case API is returning array directly
          visitationsArray = data;
          console.log(`Found ${visitationsArray.length} visitations in direct array`);
        } else {
          // Try common response formats
          const possibleArrayKeys = ['visitations', 'data', 'items', 'results'];
          
          for (const key of possibleArrayKeys) {
            if (data[key] && Array.isArray(data[key])) {
              visitationsArray = data[key];
              console.log(`Found ${visitationsArray.length} visitations in ${key} property`);
              break;
            }
          }
          
          if (visitationsArray.length === 0) {
            console.error('Could not locate visitations array in response:', data);
            throw new Error('Invalid data format: No visitations array found in response');
          }
        }
        
        // Filter out invalid visitations
        const validVisitations = visitationsArray.filter(visitation => {
          const isValid = visitation && 
                        typeof visitation === 'object' && 
                        visitation._id && 
                        visitation.homeName && 
                        visitation.visitDate;
          
          if (!isValid) {
            console.warn('Found invalid visitation entry:', visitation);
          }
          
          return isValid;
        });
        
        // Log filtering results
        if (validVisitations.length < visitationsArray.length) {
          console.warn(`Filtered out ${visitationsArray.length - validVisitations.length} invalid visitations`);
        }
        
        // Sort by date (nearest first)
        const sortedVisitations = validVisitations.sort((a, b) => 
          new Date(a.visitDate) - new Date(b.visitDate)
        );
        
        setVisitations(sortedVisitations);
        
      } catch (err) {
        console.error('Fetch error:', err);
        
        // Don't retry for auth errors
        if (err.message.includes('Authentication') || 
            err.message.includes('session') || 
            err.message.includes('permission')) {
          setError(err.message);
          return;
        }
        
        // Retry for network/timeout errors
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          retryCount++;
          toast.info(`Retrying in ${delay/1000} seconds...`);
          setTimeout(attemptFetch, delay);
        } else {
          setError(err.message || 'Network error. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    await attemptFetch();
  };
  
  // Load visitations on component mount
  useEffect(() => {
    fetchVisitations();
  }, []);
  
  // Navigate to login
  const handleLogin = () => {
    navigate('/login', { state: { from: window.location.pathname } });
  };
  
  // Format date to be user friendly
  const formatDate = (dateString) => {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Calculate days until the visit
  const calculateDaysUntil = (dateString) => {
    try {
      const visitDate = new Date(dateString);
      const today = new Date();
      
      // Set both dates to midnight for accurate day calculation
      visitDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const differenceInTime = visitDate.getTime() - today.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      
      if (differenceInDays < 0) return 'Past visit';
      if (differenceInDays === 0) return 'Today!';
      if (differenceInDays === 1) return 'Tomorrow!';
      return `In ${differenceInDays} days`;
    } catch (error) {
      console.error('Error calculating days until:', error);
      return 'Date unknown';
    }
  };
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Upcoming Visitations</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join us in making a difference! Check out our upcoming visits to children's homes 
          and find out how you can contribute.
        </p>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-12 w-12 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading visitations...</p>
        </div>
      )}
      
      {/* Error State */}
      {!loading && error && (
        <ErrorState 
          error={error} 
          onRetry={fetchVisitations} 
          onLogin={handleLogin}
        />
      )}
      
      {/* Empty State */}
      {!loading && !error && (!visitations || visitations.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl mx-auto">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No upcoming visitations found</h3>
          <p className="text-gray-500 mb-6">
            There are no upcoming visitations scheduled at the moment.
          </p>
        </div>
      )}
      
      {/* Results */}
      {!loading && !error && visitations && visitations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visitations.map(visitation => (
            <VisitationCard 
              key={visitation._id}
              visitation={visitation}
              formattedDate={formatDate(visitation.visitDate)}
              daysUntil={calculateDaysUntil(visitation.visitDate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitationsContainer;