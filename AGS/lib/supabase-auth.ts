import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  full_name: string;
  organization?: string;
  role: 'admin' | 'user';
  location?: string;
  preferred_language: 'en' | 'ms';
  default_plantation_type: 'tenera' | 'dura' | 'pisifera';
  default_soil_type: 'mineral' | 'peat' | 'coastal';
  default_focus: 'sustainability' | 'cost' | 'yield' | 'balanced';
  total_land_size?: number;
  experience_years?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  profile?: UserProfile;
}

export class SupabaseAuth {
  private supabase = supabase;

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, profile: Partial<UserProfile>) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: profile.role || 'user',
          full_name: profile.full_name,
          organization: profile.organization,
          location: profile.location,
          preferred_language: profile.preferred_language || 'en',
          default_plantation_type: profile.default_plantation_type || 'tenera',
          default_soil_type: profile.default_soil_type || 'mineral',
          default_focus: profile.default_focus || 'balanced',
          total_land_size: profile.total_land_size,
          experience_years: profile.experience_years
        }
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    
    if (error || !user) return null;

    // Get user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      role: (user.user_metadata?.role as 'admin' | 'user') || 'user',
      profile: profile || undefined
    };
  }

  /**
   * Get user session
   */
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create user profile (called after signup)
   */
  async createUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: profile.full_name || '',
        organization: profile.organization,
        role: profile.role || 'user',
        location: profile.location,
        preferred_language: profile.preferred_language || 'en',
        default_plantation_type: profile.default_plantation_type || 'tenera',
        default_soil_type: profile.default_soil_type || 'mineral',
        default_focus: profile.default_focus || 'balanced',
        total_land_size: profile.total_land_size,
        experience_years: profile.experience_years
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) return false;
    return data?.role === 'admin';
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }
}

// Export singleton instance
export const supabaseAuth = new SupabaseAuth();

// Auth state hook for React components
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    supabaseAuth.getSession().then(async (session) => {
      if (!isMounted) return;
      
      if (session?.user) {
        const currentUser = await supabaseAuth.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (session?.user) {
          const currentUser = await supabaseAuth.getCurrentUser();
          if (isMounted) {
            setUser(currentUser);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, supabaseAuth };
}; 