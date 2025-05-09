import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Save, RefreshCcw, AlertCircle, Settings as SettingsIcon, Mail, MessageSquare, CreditCard } from 'lucide-react'

// Create API client with base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios with default base URL
axios.defaults.baseURL = API_URL;

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="flex border-b overflow-x-auto">
          <TabButton 
            icon={<SettingsIcon className="h-4 w-4 mr-2" />}
            label="General" 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
          />
          <TabButton 
            icon={<CreditCard className="h-4 w-4 mr-2" />}
            label="M-Pesa" 
            active={activeTab === 'mpesa'} 
            onClick={() => setActiveTab('mpesa')} 
          />
          <TabButton 
            icon={<Mail className="h-4 w-4 mr-2" />}
            label="Email" 
            active={activeTab === 'email'} 
            onClick={() => setActiveTab('email')} 
          />
          <TabButton 
            icon={<MessageSquare className="h-4 w-4 mr-2" />}
            label="SMS" 
            active={activeTab === 'sms'} 
            onClick={() => setActiveTab('sms')} 
          />
        </div>
      </div>
      
      <div className="space-y-6">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'mpesa' && <MpesaConfiguration />}
        {activeTab === 'email' && <EmailSettings />}
        {activeTab === 'sms' && <SmsSettings />}
      </div>
    </div>
  )
}

const TabButton = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`flex items-center px-4 py-3 font-medium text-sm transition-colors duration-150 ${
        active 
          ? 'text-orange-600 border-b-2 border-orange-600' 
          : 'text-gray-600 hover:text-orange-600'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchGeneralSettings()
  }, [])

  const fetchGeneralSettings = async () => {
    setLoading(true)
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get('/api/settings/general', { headers })
      
      if (response.data) {
        setSettings(response.data)
      }
      setError(null)
    } catch (err) {
      console.error('Failed to fetch general settings:', err)
      setError('Failed to load general settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveGeneralSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/general', settings, { headers })
      toast.success('General settings saved successfully')
      setError(null)
    } catch (err) {
      console.error('Failed to save general settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.')
      toast.error('Failed to save general settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">General Settings</h3>
        <button
          type="button" 
          onClick={fetchGeneralSettings}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>
      
      {error && <ErrorAlert message={error} />}
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={saveGeneralSettings} className="space-y-5">
          <FormField
            label="Site Name"
            name="siteName"
            value={settings.siteName}
            onChange={handleInputChange}
            placeholder="Imani Foundation"
          />
          
          <FormField
            label="Site Description"
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleInputChange}
            placeholder="Empowering communities through charitable initiatives"
            textarea
          />
          
          <FormField
            label="Contact Email"
            name="contactEmail"
            value={settings.contactEmail}
            onChange={handleInputChange}
            placeholder="contact@imanifoundation.org"
            type="email"
          />
          
          <FormField
            label="Contact Phone"
            name="contactPhone"
            value={settings.contactPhone}
            onChange={handleInputChange}
            placeholder="+254700000000"
          />
          
          <SaveButton saving={saving} label="Save General Settings" />
        </form>
      )}
    </div>
  )
}

const MpesaConfiguration = () => {
  const [settings, setSettings] = useState({
    baseUrl: '',
    consumerKey: '',
    consumerSecret: '',
    passKey: '',
    shortcode: '',
    callbackUrl: '',
    initiatorName: '',
    securityCredential: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMpesaSettings()
  }, [])

  const fetchMpesaSettings = async () => {
    setLoading(true)
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get('/api/settings/mpesa', { headers })
      
      if (response.data) {
        setSettings(response.data)
      }
      setError(null)
    } catch (err) {
      console.error('Failed to fetch M-Pesa settings:', err)
      setError('Failed to load M-Pesa settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveMpesaSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/mpesa', settings, { headers })
      toast.success('M-Pesa settings saved successfully')
      setError(null)
    } catch (err) {
      console.error('Failed to save M-Pesa settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.')
      toast.error('Failed to save M-Pesa settings')
    } finally {
      setSaving(false)
    }
  }

  const registerC2BUrls = async () => {
    setRegistering(true)
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/mpesa/register-urls', {}, { headers })
      toast.success('M-Pesa callback URLs registered successfully')
    } catch (err) {
      console.error('Failed to register C2B URLs:', err)
      toast.error(err.response?.data?.message || 'Failed to register callback URLs')
    } finally {
      setRegistering(false)
    }
  }

  const testMpesaConnection = async () => {
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/mpesa/test-connection', {}, { headers })
      toast.success('M-Pesa connection test successful')
    } catch (err) {
      console.error('Failed to test M-Pesa connection:', err)
      toast.error(err.response?.data?.message || 'Failed to test M-Pesa connection')
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">M-Pesa Configuration</h3>
        <button
          type="button" 
          onClick={fetchMpesaSettings}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>
      
      {error && <ErrorAlert message={error} />}
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={saveMpesaSettings} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="API URL"
              name="baseUrl"
              value={settings.baseUrl}
              onChange={handleInputChange}
              placeholder="https://sandbox.safaricom.co.ke"
            />
            
            <FormField
              label="Business Short Code"
              name="shortcode"
              value={settings.shortcode}
              onChange={handleInputChange}
              placeholder="174379"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Consumer Key"
              name="consumerKey"
              value={settings.consumerKey}
              onChange={handleInputChange}
              placeholder="Your Consumer Key"
            />
            
            <FormField
              label="Consumer Secret"
              type="password"
              name="consumerSecret"
              value={settings.consumerSecret}
              onChange={handleInputChange}
              placeholder="Your Consumer Secret"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Pass Key"
              type="password"
              name="passKey"
              value={settings.passKey}
              onChange={handleInputChange}
              placeholder="Your Pass Key"
            />
            
            <FormField
              label="Callback URL"
              name="callbackUrl"
              value={settings.callbackUrl}
              onChange={handleInputChange}
              placeholder="https://yourdomain.com/api/mpesa/callback"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Initiator Name"
              name="initiatorName"
              value={settings.initiatorName}
              onChange={handleInputChange}
              placeholder="Your Initiator Name"
            />
            
            <FormField
              label="Security Credential"
              type="password"
              name="securityCredential"
              value={settings.securityCredential}
              onChange={handleInputChange}
              placeholder="Your Security Credential"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <SaveButton saving={saving} label="Save Changes" />
            
            <button
              type="button"
              onClick={registerC2BUrls}
              disabled={registering || saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {registering ? 'Registering...' : 'Register C2B URLs'}
            </button>
            
            <button
              type="button"
              onClick={testMpesaConnection}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Test Connection
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const EmailSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    emailHost: '',
    emailPort: '',
    emailUser: '',
    emailPass: '',
    emailFrom: ''
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    receiveDonationNotifications: true,
    receiveMonthlyReports: true
  })
  
  const [loading, setLoading] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEmailSettings()
  }, [])

  const fetchEmailSettings = async () => {
    setLoading(true)
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [generalResponse, notificationsResponse] = await Promise.all([
        axios.get('/api/settings/email', { headers }),
        axios.get('/api/settings/email-notifications', { headers })
      ])
      
      if (generalResponse.data) {
        setGeneralSettings(generalResponse.data)
      }
      
      if (notificationsResponse.data && notificationsResponse.data.customSettings) {
        setNotificationSettings(notificationsResponse.data.customSettings)
      }
      
      setError(null)
    } catch (err) {
      console.error('Failed to fetch email settings:', err)
      setError('Failed to load email settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings(prev => ({
      ...prev,
      [name]: name === 'emailPort' ? (value === '' ? '' : parseInt(value, 10)) : value
    }))
  }

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target
    setNotificationSettings(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  const saveEmailGeneralSettings = async (e) => {
    e.preventDefault()
    setSavingGeneral(true)
    
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/email', generalSettings, { headers })
      toast.success('Email server settings saved successfully')
      setError(null)
    } catch (err) {
      console.error('Failed to save email server settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.')
      toast.error('Failed to save email server settings')
    } finally {
      setSavingGeneral(false)
    }
  }

  const saveEmailPreferences = async (e) => {
    e.preventDefault()
    setSavingNotifications(true)
    
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/email-notifications', notificationSettings, { headers })
      toast.success('Email preferences saved successfully')
    } catch (err) {
      console.error('Failed to save email preferences:', err)
      toast.error('Failed to save email preferences')
    } finally {
      setSavingNotifications(false)
    }
  }

  const testEmailConnection = async () => {
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/email/test', {}, { headers })
      toast.success('Test email sent successfully')
    } catch (err) {
      console.error('Failed to send test email:', err)
      toast.error(err.response?.data?.message || 'Failed to send test email')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Email Server Configuration</h3>
          <button
            type="button" 
            onClick={fetchEmailSettings}
            disabled={loading}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
        
        {error && <ErrorAlert message={error} />}
        
        {loading ? (
          <LoadingIndicator />
        ) : (
          <form onSubmit={saveEmailGeneralSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                label="SMTP Host"
                name="emailHost"
                value={generalSettings.emailHost}
                onChange={handleGeneralInputChange}
                placeholder="smtp.example.com"
              />
              
              <FormField
                label="SMTP Port"
                name="emailPort"
                type="number"
                value={generalSettings.emailPort}
                onChange={handleGeneralInputChange}
                placeholder="587"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                label="SMTP Username"
                name="emailUser"
                value={generalSettings.emailUser}
                onChange={handleGeneralInputChange}
                placeholder="your-email@example.com"
              />
              
              <FormField
                label="SMTP Password"
                type="password"
                name="emailPass"
                value={generalSettings.emailPass}
                onChange={handleGeneralInputChange}
                placeholder="Your SMTP Password"
              />
            </div>
            
            <FormField
              label="From Email Address"
              name="emailFrom"
              value={generalSettings.emailFrom}
              onChange={handleGeneralInputChange}
              placeholder="no-reply@imanifoundation.org"
              type="email"
            />
            
            <div className="flex flex-wrap gap-4 pt-2">
              <SaveButton saving={savingGeneral} label="Save Email Settings" />
              
              <button
                type="button"
                onClick={testEmailConnection}
                disabled={savingGeneral}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Send Test Email
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Email Notifications</h3>
        <form onSubmit={saveEmailPreferences} className="space-y-5">
          <Checkbox
            id="receiveDonationNotifications"
            label="Receive email notifications for new donations"
            checked={notificationSettings.receiveDonationNotifications}
            onChange={handleCheckboxChange}
          />
          
          <Checkbox
            id="receiveMonthlyReports"
            label="Receive monthly donation reports"
            checked={notificationSettings.receiveMonthlyReports}
            onChange={handleCheckboxChange}
          />
          
          <SaveButton saving={savingNotifications} label="Save Preferences" />
        </form>
      </div>
    </div>
  )
}

const SmsSettings = () => {
  const [settings, setSettings] = useState({
    smsApiKey: '',
    smsApiUrl: '',
    smsSenderId: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSmsSettings()
  }, [])

  const fetchSmsSettings = async () => {
    setLoading(true)
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get('/api/settings/sms', { headers })
      
      if (response.data) {
        setSettings(response.data)
      }
      setError(null)
    } catch (err) {
      console.error('Failed to fetch SMS settings:', err)
      setError('Failed to load SMS settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveSmsSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/sms', settings, { headers })
      toast.success('SMS settings saved successfully')
      setError(null)
    } catch (err) {
      console.error('Failed to save SMS settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.')
      toast.error('Failed to save SMS settings')
    } finally {
      setSaving(false)
    }
  }

  const testSmsConnection = async () => {
    try {
      // Add authorization header if you have a token
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/settings/sms/test', {}, { headers })
      toast.success('Test SMS sent successfully')
    } catch (err) {
      console.error('Failed to send test SMS:', err)
      toast.error(err.response?.data?.message || 'Failed to send test SMS')
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">SMS Configuration</h3>
        <button
          type="button" 
          onClick={fetchSmsSettings}
          disabled={loading}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>
      
      {error && <ErrorAlert message={error} />}
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <form onSubmit={saveSmsSettings} className="space-y-5">
          <FormField
            label="SMS API URL"
            name="smsApiUrl"
            value={settings.smsApiUrl}
            onChange={handleInputChange}
            placeholder="https://api.africastalking.com/version1/messaging"
          />
          
          <FormField
            label="SMS API Key"
            name="smsApiKey"
            type="password"
            value={settings.smsApiKey}
            onChange={handleInputChange}
            placeholder="Your SMS API Key"
          />
          
          <FormField
            label="SMS Sender ID"
            name="smsSenderId"
            value={settings.smsSenderId}
            onChange={handleInputChange}
            placeholder="IMANI"
          />
          
          <div className="flex flex-wrap gap-4 pt-2">
            <SaveButton saving={saving} label="Save SMS Settings" />
            
            <button
              type="button"
              onClick={testSmsConnection}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Send Test SMS
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// Reusable components
const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
    <span>{message}</span>
  </div>
)

const LoadingIndicator = () => (
  <div className="py-4 text-center">
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
    <p className="mt-2 text-gray-600">Loading settings...</p>
  </div>
)

const SaveButton = ({ saving, label }) => (
  <button
    type="submit"
    disabled={saving}
    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center"
  >
    {saving ? 'Saving...' : (
      <>
        <Save className="h-4 w-4 mr-2" />
        {label}
      </>
    )}
  </button>
)

const FormField = ({ label, type = 'text', name, value, onChange, placeholder, textarea = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      )}
    </div>
  )
}

const Checkbox = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  )
}