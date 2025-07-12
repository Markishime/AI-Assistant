'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

// Initialize Supabase client with fallback
let supabase: any = null;
let initializationAttempted = false;

const initializeSupabase = () => {
  if (initializationAttempted && supabase) {
    return supabase;
  }

  initializationAttempted = true;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback to localStorage for development
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('SUPABASE_URL');
    const storedKey = localStorage.getItem('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl && storedUrl) {
      console.log('Using Supabase URL from localStorage');
    }
    
    if (!supabaseAnonKey && storedKey) {
      console.log('Using Supabase key from localStorage');
    }
  }

  const finalUrl = supabaseUrl || (typeof window !== 'undefined' ? localStorage.getItem('SUPABASE_URL') : null);
  const finalKey = supabaseAnonKey || (typeof window !== 'undefined' ? localStorage.getItem('SUPABASE_ANON_KEY') : null);

  if (finalUrl && finalKey) {
    supabase = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: true,
        storageKey: 'ags-auth-token',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log('✅ Supabase client initialized successfully');
    return supabase;
  } else {
    console.error('❌ Failed to initialize Supabase client - missing configuration');
    return null;
  }
};

// Export a function to get the client, with retry logic
export const getSupabaseClient = () => {
  if (!supabase) {
    console.log('🔄 Retrying Supabase initialization...');
    return initializeSupabase();
  }
  return supabase;
};

export { supabase };

// Extended user type with role
export interface ExtendedUser extends User {
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

// Auth context type
interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  isAdmin: boolean;
  isManager: boolean;
  refreshUser: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch user profile with role and preferences
  const fetchUserProfile = useCallback(async (authUser: User) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.error('❌ Supabase client not available for profile fetch');
        setUser(authUser as ExtendedUser);
        return;
      }

      console.log('🔍 Fetching profile for user:', authUser.id);
      
      const { data: profile, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log('📋 Profile fetch result:', { profile, error });

      if (error) {
        console.log('Profile fetch error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          // No profile found, create a default one
          console.log('No user profile found, creating default profile');
          const { error: insertError } = await client
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email,
              role: 'user',
              agricultural_preference: 'oil_palm'
            });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }
        } else {
          console.error('Error fetching user profile:', error);
        }
      }

      const extendedUser: ExtendedUser = {
        ...authUser,
        role: profile?.role as 'admin' | 'user' | 'manager' || 'user',
        agricultural_preference: profile?.default_focus || 'balanced',
        profile: profile || undefined
      };

      setUser(extendedUser);
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      setUser(authUser as ExtendedUser);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (session?.user) {
      await fetchUserProfile(session.user);
    }
  }, [session?.user, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const client = getSupabaseClient();
        if (!client) {
          console.error('❌ Supabase client not available for auth initialization');
          setLoading(false);
          setInitialized(true);
          return;
        }

        console.log('🔄 Initializing auth state...');

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await client.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting initial session:', sessionError);
        }

        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await fetchUserProfile(initialSession.user);
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (event: string, newSession: Session | null) => {
            console.log('🔄 Auth state change:', event, newSession?.user?.id);
            
            if (mounted) {
              setSession(newSession);
              if (newSession?.user) {
                await fetchUserProfile(newSession.user);
              } else {
                setUser(null);
              }
            }
          }
        );

        if (mounted) {
          setLoading(false);
          setInitialized(true);
          console.log('✅ Auth initialization complete');
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [fetchUserProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client not available');
      }
      
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { data: null, error };
      }

      console.log('✅ Sign in successful for:', email);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { data: null, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
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

      if (error) {
        console.error('❌ Sign up error:', error);
        return { error };
      }

      console.log('✅ Sign up successful for:', email);
      return { error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: any) => {
    try {
      const client = getSupabaseClient();
      if (!client || !user) {
        throw new Error('Client or user not available');
      }

      const { error } = await client
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        return { error };
      }

      // Refresh user data
      await refreshUser();
      return { error: null };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return { error };
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
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 