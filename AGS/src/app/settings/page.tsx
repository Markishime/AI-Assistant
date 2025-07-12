'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import AppLayout from '../components/AppLayout';
import { 
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Download,
  Trash2,
  Key,
  Globe,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Smartphone,
  Database,
  HardDrive,
  CreditCard,
  ChevronRight,
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react';

interface NotificationSettings {
  emailReports: boolean;
  analysisComplete: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
}

interface AnalysisSettings {
  autoAnalysis: boolean;
  confidenceThreshold: number;
  alertThreshold: string;
  preferredUnits: 'metric' | 'imperial';
  language: 'en' | 'ms';
  defaultSampleType: 'soil' | 'leaf';
  enableAdvancedFeatures: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
  passwordLastChanged: string;
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.profile?.full_name || '',
    organization: user?.profile?.organization || '',
    role: user?.profile?.role || '',
    location: user?.profile?.location || '',
    preferred_language: user?.profile?.preferred_language || 'en',
    default_plantation_type: user?.profile?.default_plantation_type || 'tenera',
    default_soil_type: user?.profile?.default_soil_type || 'mineral',
    default_focus: user?.profile?.default_focus || 'balanced',
    total_land_size: user?.profile?.total_land_size || 0,
    experience_years: user?.profile?.experience_years || 0
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailReports: true,
    analysisComplete: true,
    systemAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    weeklyDigest: true,
  });

  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    autoAnalysis: true,
    confidenceThreshold: 85,
    alertThreshold: 'medium',
    preferredUnits: 'metric',
    language: 'en',
    defaultSampleType: 'soil',
    enableAdvancedFeatures: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    passwordLastChanged: '2024-01-15',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: User,
      description: 'Manage your personal information and preferences'
    },
    { 
      id: 'analysis', 
      name: 'Analysis', 
      icon: BarChart3,
      description: 'Configure analysis settings and preferences'
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: Bell,
      description: 'Control your notification preferences'
    },
    { 
      id: 'security', 
      name: 'Security', 
      icon: Shield,
      description: 'Manage account security and privacy'
    },
  ];

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        full_name: user.profile.full_name || '',
        organization: user.profile.organization || '',
        role: user.profile.role || '',
        location: user.profile.location || '',
        preferred_language: user.profile.preferred_language || 'en',
        default_plantation_type: user.profile.default_plantation_type || 'tenera',
        default_soil_type: user.profile.default_soil_type || 'mineral',
        default_focus: user.profile.default_focus || 'balanced',
        total_land_size: user.profile.total_land_size || 0,
        experience_years: user.profile.experience_years || 0
      });
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Update profile data
      if (activeTab === 'profile') {
        await updateProfile(profileData);
      }
      
      // Simulate API call for other settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      // You can replace this with a proper toast notification
      console.log('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // Implement password change logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      console.log('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTabIcon = (icon: any) => {
    const IconComponent = icon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <AppLayout>
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and application settings</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.id ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        {getTabIcon(tab.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-xs text-gray-500 hidden lg:block">{tab.description}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        activeTab === tab.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Account Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pro Plan</h3>
                    <p className="text-sm text-gray-500">Active subscription</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Analyses Used</span>
                    <span className="text-sm font-medium text-gray-900">147/500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '29%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-sm font-medium text-gray-900">2.1GB/10GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '21%' }}></div>
                  </div>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors duration-200">
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                      <p className="text-gray-500">Update your personal and professional information</p>
                    </div>
                  </div>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={profileData.organization}
                          onChange={(e) => setProfileData(prev => ({ ...prev, organization: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter your organization"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select 
                          value={profileData.role}
                          onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Select your role</option>
                          <option value="farmer">Farmer</option>
                          <option value="agronomist">Agronomist</option>
                          <option value="researcher">Researcher</option>
                          <option value="consultant">Consultant</option>
                          <option value="manager">Farm Manager</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Language
                        </label>
                        <select 
                          value={profileData.preferred_language}
                          onChange={(e) => setProfileData(prev => ({ ...prev, preferred_language: e.target.value as 'en' | 'ms' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="en">English</option>
                          <option value="ms">Bahasa Malaysia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plantation Type
                        </label>
                        <select 
                          value={profileData.default_plantation_type}
                          onChange={(e) => setProfileData(prev => ({ ...prev, default_plantation_type: e.target.value as any }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="tenera">Tenera</option>
                          <option value="dura">Dura</option>
                          <option value="pisifera">Pisifera</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Soil Type
                        </label>
                        <select 
                          value={profileData.default_soil_type}
                          onChange={(e) => setProfileData(prev => ({ ...prev, default_soil_type: e.target.value as any }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="mineral">Mineral</option>
                          <option value="peat">Peat</option>
                          <option value="coastal">Coastal</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Land Size (hectares)
                        </label>
                        <input
                          type="number"
                          value={profileData.total_land_size}
                          onChange={(e) => setProfileData(prev => ({ ...prev, total_land_size: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter land size"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={profileData.experience_years}
                          onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter years of experience"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Analysis Preferences</h3>
                      <p className="text-gray-500">Configure how your analyses are processed and displayed</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Auto-Analysis</h4>
                        <p className="text-sm text-gray-500">Automatically analyze uploaded files</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={analysisSettings.autoAnalysis}
                          onChange={(e) => setAnalysisSettings(prev => ({ ...prev, autoAnalysis: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Confidence Threshold: {analysisSettings.confidenceThreshold}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={analysisSettings.confidenceThreshold}
                        onChange={(e) => setAnalysisSettings(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alert Threshold
                        </label>
                        <select
                          value={analysisSettings.alertThreshold}
                          onChange={(e) => setAnalysisSettings(prev => ({ ...prev, alertThreshold: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="low">Low - Alert on significant issues</option>
                          <option value="medium">Medium - Alert on moderate issues</option>
                          <option value="high">High - Alert on all issues</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Sample Type
                        </label>
                        <select
                          value={analysisSettings.defaultSampleType}
                          onChange={(e) => setAnalysisSettings(prev => ({ ...prev, defaultSampleType: e.target.value as 'soil' | 'leaf' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        >
                          <option value="soil">Soil Analysis</option>
                          <option value="leaf">Leaf Analysis</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Preferred Units
                      </label>
                      <div className="flex space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="metric"
                            checked={analysisSettings.preferredUnits === 'metric'}
                            onChange={(e) => setAnalysisSettings(prev => ({ ...prev, preferredUnits: e.target.value as 'metric' | 'imperial' }))}
                            className="mr-3 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-medium">Metric</div>
                            <div className="text-sm text-gray-500">kg, ha, °C</div>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="imperial"
                            checked={analysisSettings.preferredUnits === 'imperial'}
                            onChange={(e) => setAnalysisSettings(prev => ({ ...prev, preferredUnits: e.target.value as 'metric' | 'imperial' }))}
                            className="mr-3 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-medium">Imperial</div>
                            <div className="text-sm text-gray-500">lbs, acres, °F</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Advanced Features</h4>
                        <p className="text-sm text-gray-500">Enable advanced analysis capabilities</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={analysisSettings.enableAdvancedFeatures}
                          onChange={(e) => setAnalysisSettings(prev => ({ ...prev, enableAdvancedFeatures: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
                      <p className="text-gray-500">Control how and when you receive notifications</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { key: 'emailReports', label: 'Weekly Email Reports', description: 'Receive weekly summaries of your analysis activity', icon: Mail },
                      { key: 'analysisComplete', label: 'Analysis Completion', description: 'Get notified when file analysis is complete', icon: CheckCircle },
                      { key: 'systemAlerts', label: 'System Alerts', description: 'Important system updates and maintenance notifications', icon: AlertTriangle },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Real-time notifications in your browser', icon: Bell },
                      { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of all activities and insights', icon: BarChart3 },
                      { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and feature announcements', icon: Mail },
                    ].map(({ key, label, description, icon }) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {React.createElement(icon, { className: "w-5 h-5 text-gray-600" })}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                            <p className="text-sm text-gray-500">{description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[key as keyof NotificationSettings]}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Security Settings</h3>
                      <p className="text-gray-500">Manage your account security and privacy</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Password Change */}
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handlePasswordChange}
                          disabled={isLoading}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          {securitySettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                      </div>
                    </div>

                    {/* Session Management */}
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Session Management</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Session</p>
                            <p className="text-xs text-gray-500">Windows • Chrome • Last active now</p>
                          </div>
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Mobile Session</p>
                            <p className="text-xs text-gray-500">iPhone • Safari • Last active 2 hours ago</p>
                          </div>
                          <button className="text-xs text-red-600 hover:text-red-700 font-medium">Revoke</button>
                        </div>
                      </div>
                    </div>

                    {/* Security Log */}
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Security Activity</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-600">Password changed successfully</span>
                          <span className="text-gray-400">2 days ago</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-600">Login from new device</span>
                          <span className="text-gray-400">1 week ago</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-600">Account created</span>
                          <span className="text-gray-400">1 month ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
