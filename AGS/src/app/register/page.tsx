'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth, getSupabaseClient } from '../components/AuthProvider';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Building,
  MapPin,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Brain,
  ArrowLeft,
  Loader2,
  Sparkles,
  Shield,
  Globe,
  Leaf,
  TreePine,
  Target,
  Clock
} from 'lucide-react';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organization: string;
  location: string;
  role: string;
  agriculturalPreference: string;
  preferredLanguage: string;
  defaultPlantationType: string;
  defaultSoilType: string;
  defaultFocus: string;
  totalLandSize: string;
  experienceYears: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, signUp, isAdmin } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    location: '',
    role: 'user',
    agriculturalPreference: 'oil_palm',
    preferredLanguage: 'en',
    defaultPlantationType: 'tenera',
    defaultSoilType: 'mineral',
    defaultFocus: 'balanced',
    totalLandSize: '',
    experienceYears: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // User is already logged in, redirect them
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign up...');
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('System configuration error. Please contact support.');
        return;
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Registration timeout. Please try again.')), 30000)
      );
      
      // First, create the auth user
      const signUpPromise = signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        organization: formData.organization,
        location: formData.location,
        role: formData.role,
        agricultural_preference: formData.agriculturalPreference
      });
      
      const { data: authData, error: signUpError } = await Promise.race([signUpPromise, timeoutPromise]) as any;

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try signing in instead.');
        } else if (signUpError.message.includes('Password should be at least')) {
          setError('Password is too weak. Please choose a stronger password.');
        } else if (signUpError.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // If auth user creation was successful, update the user profile with all details
      if (authData?.user) {
        // Try to update profile, but don't block registration if it fails
        const updateProfile = async () => {
          try {
            // Wait a moment for the trigger to create the basic profile
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const supabase = getSupabaseClient();
            if (!supabase) {
              console.error('Supabase client not initialized.');
              return;
            }

            const profileData = {
              id: authData.user.id,
              full_name: formData.fullName,
              organization: formData.organization || null,
              role: formData.role,
              location: formData.location || null,
              preferred_language: formData.preferredLanguage,
              default_plantation_type: formData.defaultPlantationType,
              default_soil_type: formData.defaultSoilType,
              default_focus: formData.defaultFocus,
              total_land_size: formData.totalLandSize ? parseFloat(formData.totalLandSize) : null,
              experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null
            };

            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert(profileData);

            if (profileError) {
              console.error('Profile update error:', profileError);
              console.warn('Profile update failed, but user account was created successfully');
            }
          } catch (profileErr) {
            console.error('Profile update failed:', profileErr);
          }
        };

        // Run profile update in background, don't wait for it
        updateProfile().catch(console.error);
      }

      setSuccess('Registration successful! Please check your email to confirm your account before signing in.');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        organization: '',
        location: '',
        role: 'user',
        agriculturalPreference: 'oil_palm',
        preferredLanguage: 'en',
        defaultPlantationType: 'tenera',
        defaultSoilType: 'mineral',
        defaultFocus: 'balanced',
        totalLandSize: '',
        experienceYears: ''
      });
      
      setLoading(false);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Navigation Header */}
      <nav className="relative z-50 px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Oil Palm AGS
              </h1>
              <p className="text-xs text-gray-600">AI Agricultural Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-bl from-cyan-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-teal-400/20 via-emerald-400/10 to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                <Brain className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
              
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                Join Oil Palm AGS
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-600"
              >
                Create your account to access AI-powered agricultural intelligence
              </motion.p>
            </div>
              
            {/* Alert Messages */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </motion.div>
            )}

            {/* Registration Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20"
            >
              {/* Basic Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="organization"
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Your organization (optional)"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Your location (optional)"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agricultural Preferences Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Agricultural Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Role Selection */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    >
                      <option value="user">Farmer/User</option>
                      <option value="manager">Manager</option>
                      {/* Admin option restricted to demo signup */}
                      {formData.email === 'admin@oilpalmags.com' && (
                        <option value="admin">Administrator</option>
                      )}
                    </select>
                  </div>

                  {/* Agricultural Preference */}
                  <div>
                    <label htmlFor="agriculturalPreference" className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Area
                    </label>
                    <select
                      id="agriculturalPreference"
                      name="agriculturalPreference"
                      value={formData.agriculturalPreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      disabled={loading}
                    >
                      <option value="oil_palm">Oil Palm</option>
                      <option value="general_agriculture">General Agriculture</option>
                      <option value="research">Research</option>
                    </select>
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Language
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="preferredLanguage"
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        disabled={loading}
                      >
                        <option value="en">English</option>
                        <option value="ms">Bahasa Malaysia</option>
                      </select>
                    </div>
                  </div>

                  {/* Default Plantation Type */}
                  <div>
                    <label htmlFor="defaultPlantationType" className="block text-sm font-medium text-gray-700 mb-2">
                      Default Plantation Type
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TreePine className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="defaultPlantationType"
                        name="defaultPlantationType"
                        value={formData.defaultPlantationType}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        disabled={loading}
                      >
                        <option value="tenera">Tenera</option>
                        <option value="dura">Dura</option>
                        <option value="pisifera">Pisifera</option>
                      </select>
                    </div>
                  </div>

                  {/* Default Soil Type */}
                  <div>
                    <label htmlFor="defaultSoilType" className="block text-sm font-medium text-gray-700 mb-2">
                      Default Soil Type
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TreePine className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="defaultSoilType"
                        name="defaultSoilType"
                        value={formData.defaultSoilType}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        disabled={loading}
                      >
                        <option value="mineral">Mineral</option>
                        <option value="peat">Peat</option>
                        <option value="coastal">Coastal</option>
                      </select>
                    </div>
                  </div>

                  {/* Default Focus */}
                  <div>
                    <label htmlFor="defaultFocus" className="block text-sm font-medium text-gray-700 mb-2">
                      Default Focus
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Target className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="defaultFocus"
                        name="defaultFocus"
                        value={formData.defaultFocus}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        disabled={loading}
                      >
                        <option value="balanced">Balanced</option>
                        <option value="sustainability">Sustainability</option>
                        <option value="cost">Cost Optimization</option>
                        <option value="yield">Yield Maximization</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Details Section */}
              <div className="border-b border-gray-200 pb-6">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Operational Details
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Total Land Size */}
                  <div>
                    <label htmlFor="totalLandSize" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Land Size (hectares)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Target className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="totalLandSize"
                        name="totalLandSize"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.totalLandSize}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., 50.5"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="experienceYears"
                        name="experienceYears"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., 5"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Confirm your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <p className="text-gray-600 mb-4">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                What You'll Get
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Secure account & data protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  <span>AI-powered analysis tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span>Agricultural insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span>Malaysian context optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Location-based recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-500" />
                  <span>Organization management</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}