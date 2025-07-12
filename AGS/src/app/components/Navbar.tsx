'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, FileText, User, LogOut, Menu, X, Leaf,
  TestTube, History, Home, HelpCircle, ChevronDown,
  Settings, Bell, TrendingUp, Activity, Award, AlertTriangle,
  Calendar, Clock, Target, Zap, Star, Users, Database, Shield,
  Search, Plus, Download, Upload
} from 'lucide-react';
import { useAuth } from './AuthProvider';

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface UserStats {
  totalAnalyses: number;
  recentAnalyses: number;
  avgConfidence: number;
  successRate: number;
  alerts: number;
  ragDocuments: number;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Helper function to format relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return time.toLocaleDateString();
};

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userStats, setUserStats] = useState<UserStats>({
    totalAnalyses: 0,
    recentAnalyses: 0,
    avgConfidence: 0,
    successRate: 0,
    alerts: 0,
    ragDocuments: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const getUserFullName = () => {
    return user?.profile?.full_name || user?.email || 'User';
  };

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      const response = await fetch(`/api/analytics/dashboard-metrics?userId=${user.id}&timeframe=30d`);
      const data = await response.json();
      
      if (response.ok) {
        setUserStats({
          totalAnalyses: data.totalAnalyses || 0,
          recentAnalyses: data.recentAnalyses || 0,
          avgConfidence: data.avgConfidence || 0,
          successRate: data.userSatisfaction || 0,
          alerts: data.alerts || 0,
          ragDocuments: data.ragDocuments || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      // Simulate notifications based on user activity
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Analysis Complete',
          message: 'Your soil analysis for Block A is ready',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'warning',
          title: 'High Risk Detected',
          message: 'Nutrient deficiency found in Sector 3',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'info',
          title: 'New Document Available',
          message: 'Malaysian fertilizer guidelines updated',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotifications(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      badge: userStats.alerts > 0 ? userStats.alerts : null,
      badgeColor: 'bg-red-500'
    },
    { 
      path: '/analyze', 
      label: 'Analyze', 
      icon: TestTube,
      badge: null
    },
    { 
      path: '/documents', 
      label: 'Documents', 
      icon: FileText,
      badge: userStats.ragDocuments > 100 ? 'NEW' : null,
      badgeColor: 'bg-emerald-500'
    },
    { 
      path: '/history', 
      label: 'History', 
      icon: History,
      badge: userStats.recentAnalyses > 0 ? userStats.recentAnalyses : null,
      badgeColor: 'bg-blue-500'
    },
    { 
      path: '/help', 
      label: 'Help', 
      icon: HelpCircle,
      badge: null
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchNotifications();
      
      // Set up periodic refresh
      const interval = setInterval(() => {
        fetchUserStats();
        fetchNotifications();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [user, fetchUserStats, fetchNotifications]);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-gray-900">Oil Palm AGS</p>
                  <p className="text-xs text-gray-500">AI-Powered Agriculture</p>
                </div>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full text-white font-medium ${item.badgeColor || 'bg-gray-500'}`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavigation('/analyze')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="New Analysis"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigation('/documents')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Upload Document"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={toggleNotifications}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Notifications</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? 'bg-blue-50/50' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    notification.type === 'success' ? 'bg-green-500' :
                                    notification.type === 'warning' ? 'bg-yellow-500' :
                                    notification.type === 'error' ? 'bg-red-500' :
                                    'bg-blue-500'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatRelativeTime(notification.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{getUserFullName()}</p>
                    <p className="text-xs text-gray-500">{user?.profile?.organization || 'Oil Palm Farmer'}</p>
                  </div>
                  {showProfileDropdown ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 transform rotate-180" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      {/* User Stats */}
                      <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                            <div className="text-lg font-bold">{userStats.totalAnalyses}</div>
                            <div className="text-xs text-emerald-100">Analyses</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                            <div className="text-lg font-bold">{userStats.avgConfidence}%</div>
                            <div className="text-xs text-emerald-100">Confidence</div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            handleNavigation('/settings');
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm font-medium">Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            handleNavigation('/profile');
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Profile</span>
                        </button>
                        <hr className="my-2" />
                        <button
                        onClick={() => {
                          handleSignOut();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center space-x-2"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Oil Palm AGS</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleNotifications}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={toggleProfileDropdown}
                className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center"
              >
                <User className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full text-white font-medium ${item.badgeColor || 'bg-gray-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Profile Dropdown */}
      <AnimatePresence>
        {showProfileDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowProfileDropdown(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{getUserFullName()}</p>
                    <p className="text-emerald-100 text-sm">{user?.profile?.organization || 'Oil Palm Farmer'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{userStats.totalAnalyses}</div>
                    <div className="text-xs text-emerald-100">Analyses</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{userStats.avgConfidence}%</div>
                    <div className="text-xs text-emerald-100">Confidence</div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    handleNavigation('/settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Settings</span>
                </button>
                <button
                  onClick={() => {
                    handleNavigation('/profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Profile</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 