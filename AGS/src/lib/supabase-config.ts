// Supabase configuration with proper environment variable handling
export const getSupabaseConfig = () => {
  // Try to get from environment variables
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If not available in process.env, try to read from localStorage (for development)
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('SUPABASE_URL');
    const storedKey = localStorage.getItem('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl && storedUrl) {
      supabaseUrl = storedUrl;
      console.log('Using Supabase URL from localStorage');
    }
    
    if (!supabaseAnonKey && storedKey) {
      supabaseAnonKey = storedKey;
      console.log('Using Supabase key from localStorage');
    }
  }

  // Final fallback for development (you can replace these with your actual values)
  if (!supabaseUrl) {
    console.warn('Supabase URL not found. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local');
    return null;
  }

  if (!supabaseAnonKey) {
    console.warn('Supabase anon key not found. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    return null;
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey
  };
};

// Store credentials in localStorage for development (run this in browser console)
export const storeSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('SUPABASE_URL', url);
    localStorage.setItem('SUPABASE_ANON_KEY', key);
    console.log('Supabase credentials stored in localStorage');
  }
}; 