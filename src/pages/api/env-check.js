// API route to check environment variables
export default function handler(req, res) {
  // Only check if variables exist, not their actual values for security
  const envStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV
  };

  res.status(200).json({ 
    status: 'Environment variables check',
    variables: envStatus
  });
}
