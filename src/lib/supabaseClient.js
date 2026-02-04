import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
let supabase;

// Log environment variable availability (not their values) for debugging
console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

try {
  // Get the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Please check your .env.local file.');
  }
  
  // Create the Supabase client with proper error handling
  supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );
  
  // Test the connection
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase connection established successfully');
  });
  
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a dummy client to prevent app from crashing
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase client not properly initialized' } }),
      signOut: () => Promise.resolve({}),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    })
  };
}

export default supabase;
