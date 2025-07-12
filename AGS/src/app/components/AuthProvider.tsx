'use client';

import { ReactNode, createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../../lib/supabase-config';
import AuthLoading from './AuthLoading';

// Initialize Supabase client with fallback
let supabase: any = null;

const initializeSupabase = () => {
  const config = getSupabaseConfig();
  
  if (config) {
    supabase = createClient(config.url, config.anonKey);
    console.log('✅ Supabase client initialized successfully');
    return true;
  } else {
    console.error('❌ Failed to initialize Supabase client - missing configuration');
    return false;
  }
};

// Try to initialize immediately
initializeSupabase();

// Export a function to get the client, with retry logic
export const getSupabaseClient = () => {
  if (!supabase) {
    console.log('🔄 Retrying Supabase initialization...');
    initializeSupabase();
  }
  return supabase;
};

export { supabase };

interface ExtendedUser extends User {
  role?: 'admin' | 'user' | 'manager';
  agricultural_preference?: string;
  profile?: {
    id: string;
    full_name: string | null;
    organization: string | null;
    role: string | null;
    location: string | null;
    preferred_language: 'en' | 'ms';
    default_plantation_type: 'tenera' | 'dura' | 'pisifera';
    default_soil_type: 'mineral' | 'peat' | 'coastal';
    default_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
    total_land_size: number | null;
    experience_years: number | null;
    created_at: string;
    updated_at: string;
  };
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<any>;
  isAdmin: boolean;
  isManager: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to show loading state
  const [initialized, setInitialized] = useState(false);
  const profileFetched = useRef<Set<string>>(new Set()); // Track which users we've already fetched profiles for
  const isInitializing = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (isInitializing.current) return; // Prevent multiple initializations
      isInitializing.current = true;
      
      try {
        // Ensure Supabase is initialized
        const client = getSupabaseClient();
        if (!client) {
          console.error('❌ Cannot initialize auth - Supabase client not available');
          setLoading(false);
          return;
        }

        console.log('🔍 Initializing authentication...');
        
        // Get initial session
        const { data: { session }, error } = await client.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else {
          console.log('✅ Initial session loaded:', session?.user?.id || 'no user');
        }
        
        setSession(session);
        if (session?.user) {
          // Only fetch if we haven't already fetched this user's profile
          if (!profileFetched.current.has(session.user.id)) {
            await fetchUserProfile(session.user, true); // Force fetch on initial load
          } else {
            // Use cached user data if available
            if (user && user.id === session.user.id) {
              // User is already set, no need to refetch
            } else {
              await fetchUserProfile(session.user, false);
            }
          }
        }
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setLoading(false);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeAuth();

    // Listen for auth changes
    const setupAuthListener = () => {
      const client = getSupabaseClient();
      if (!client) return null;

      return client.auth.onAuthStateChange(
        async (event: string, session: Session | null) => {
          if (!mounted) return;
          
          console.log('🔄 Auth state change:', event, session?.user?.id);
          
          setSession(session);
          if (session?.user) {
            // Only fetch profile if we haven't already or if it's a sign in event
            const shouldFetchProfile = event === 'SIGNED_IN' || !profileFetched.current.has(session.user.id);
            if (shouldFetchProfile) {
              await fetchUserProfile(session.user, true);
            } else {
              // Use cached user data if available
              if (user && user.id === session.user.id) {
                // User is already set and it's the same user, no need to refetch
                return;
              }
              // Only fetch if we don't have the user data yet
              if (!user || user.id !== session.user.id) {
                await fetchUserProfile(session.user, false);
              }
            }
          } else {
            setUser(null);
            profileFetched.current.clear(); // Clear cache on sign out
          }
        }
      );
    };

    const subscription = setupAuthListener();

    return () => {
      mounted = false;
      if (subscription?.data?.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch user profile with role and preferences
  const fetchUserProfile = async (authUser: User, forceRefetch: boolean = false) => {
    // Skip if we've already fetched this user's profile and it's not a forced refetch
    if (!forceRefetch && profileFetched.current.has(authUser.id)) {
      // If we already have the user data, just return
      if (user && user.id === authUser.id) {
        return;
      }
    }

    try {
      // Get Supabase client with retry logic
      const client = getSupabaseClient();
      if (!client || !client.auth) {
        console.error('❌ Supabase client not properly initialized');
        setUser(authUser as ExtendedUser);
        return;
      }

      // Only log on first fetch or forced refetch
      if (forceRefetch || !profileFetched.current.has(authUser.id)) {
        console.log('🔍 Fetching profile for user:', authUser.id);
      }
      
      const { data: profile, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // Only log detailed errors on forced refetch or first fetch
        if (forceRefetch || !profileFetched.current.has(authUser.id)) {
          console.log('Profile fetch error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        }
        
        if (error.code === 'PGRST116') {
          // No profile found, create a default one
          if (forceRefetch || !profileFetched.current.has(authUser.id)) {
            console.log('No user profile found, creating default profile');
          }
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email,
              role: 'user',
              agricultural_preference: 'oil_palm'
            });
          
          if (insertError) {
            if (forceRefetch || !profileFetched.current.has(authUser.id)) {
              console.error('Error creating user profile:', insertError);
            }
          }
        } else {
          // Check if error is empty object
          if (error && Object.keys(error).length === 0) {
            if (forceRefetch || !profileFetched.current.has(authUser.id)) {
              console.error('Supabase returned an empty error object. This may indicate a network, client, or table schema issue.', {
                userId: authUser.id,
                userEmail: authUser.email,
                timestamp: new Date().toISOString()
              });
            }
          } else {
            // Only log detailed errors on forced refetch or first fetch
            if (forceRefetch || !profileFetched.current.has(authUser.id)) {
              console.error('Error fetching user profile:', {
                error: error,
                errorCode: error?.code,
                errorMessage: error?.message,
                errorDetails: error?.details,
                errorHint: error?.hint,
                userId: authUser.id,
                userEmail: authUser.email,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } else if (!profile) {
        // Handle case where error is empty but no profile returned
        if (forceRefetch || !profileFetched.current.has(authUser.id)) {
          console.log('No profile returned and no error - this might indicate a connection issue');
          console.log('Creating default profile as fallback');
        }
        
        try {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email,
              role: 'user',
              agricultural_preference: 'oil_palm'
            });
          
          if (insertError) {
            if (forceRefetch || !profileFetched.current.has(authUser.id)) {
              console.error('Error creating fallback user profile:', {
                error: insertError,
                errorCode: insertError?.code,
                errorMessage: insertError?.message,
                userId: authUser.id
              });
            }
          } else {
            if (forceRefetch || !profileFetched.current.has(authUser.id)) {
              console.log('Successfully created fallback user profile');
            }
          }
        } catch (fallbackErr) {
          if (forceRefetch || !profileFetched.current.has(authUser.id)) {
            console.error('Fallback profile creation failed:', {
              error: fallbackErr,
              userId: authUser.id
            });
          }
        }
      }

      const extendedUser: ExtendedUser = {
        ...authUser,
        role: profile?.role || 'user',
        agricultural_preference: profile?.default_focus || 'balanced',
        profile: profile || undefined
      };

      setUser(extendedUser);
      profileFetched.current.add(authUser.id); // Mark this user as fetched
    } catch (error) {
      // Only log detailed errors on forced refetch or first fetch
      if (forceRefetch || !profileFetched.current.has(authUser.id)) {
        console.error('Error in fetchUserProfile:', {
          error: error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          userId: authUser.id,
          userEmail: authUser.email
        });
      }
      // Fallback to basic user profile
      setUser(authUser as ExtendedUser);
      profileFetched.current.add(authUser.id); // Mark as fetched even if failed to prevent repeated attempts
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Attempting sign in for:', email);
      
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client not available');
      }
      
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('✅ AuthProvider: Sign in result:', { 
        success: !error, 
        userId: data?.user?.id,
        error: error?.message 
      });
      
      return { data, error };
    } catch (err) {
      console.error('❌ AuthProvider: Sign in error:', err);
      return { data: null, error: err };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('📝 AuthProvider: Attempting sign up for:', email);
      
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client not available');
      }
      
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      console.log('✅ AuthProvider: Sign up result:', { 
        success: !error, 
        userId: data?.user?.id,
        error: error?.message 
      });
      
      return { data, error };
    } catch (err) {
      console.error('❌ AuthProvider: Sign up error:', err);
      return { data: null, error: err };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
        profileFetched.current.clear(); // Clear profile cache on sign out
        console.log('✅ User signed out successfully');
      }
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const client = getSupabaseClient();
      if (!client) {
        return { error: new Error('Supabase client not available') };
      }

      const { error } = await client
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        await fetchUserProfile(user, true); // Force refetch after update
      }

      return { error };
    } catch (err) {
      console.error('❌ Update profile error:', err);
      return { error: err };
    }
  };

  // Check if user is admin or manager
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  // Refresh user data
  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user, true); // Force refetch
    }
  };

  const value = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isManager,
    refreshUser
  };

  // Show loading screen while initializing
  if (loading) {
    return <AuthLoading />;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
