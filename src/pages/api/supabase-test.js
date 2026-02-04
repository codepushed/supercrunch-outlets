// API route to test Supabase connection
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if environment variables exist
    const envCheck = {
      supabaseUrlExists: !!supabaseUrl,
      supabaseAnonKeyExists: !!supabaseAnonKey,
      supabaseUrlFormat: supabaseUrl ? (supabaseUrl.startsWith('https://') ? 'valid' : 'invalid') : 'missing',
      supabaseAnonKeyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
    };
    
    // Create a test client
    let connectionTest = { success: false, message: 'Not attempted' };
    
    if (envCheck.supabaseUrlExists && envCheck.supabaseAnonKeyExists) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Try a simple query that doesn't require auth
        const { data, error } = await supabase.from('dishes').select('count').limit(1);
        
        if (error) {
          connectionTest = { 
            success: false, 
            message: 'Connection failed', 
            errorCode: error.code,
            errorMessage: error.message,
            hint: error.hint || 'No hint provided'
          };
        } else {
          connectionTest = { success: true, message: 'Connection successful' };
        }
      } catch (error) {
        connectionTest = { 
          success: false, 
          message: 'Exception during connection test',
          error: error.message
        };
      }
    }
    
    // Return results
    res.status(200).json({
      status: 'Supabase connection test',
      environmentCheck: envCheck,
      connectionTest,
      troubleshooting: {
        checkEnvFile: 'Ensure .env.local has the correct values',
        urlFormat: 'URL should be like: https://your-project-id.supabase.co',
        keyFormat: 'Anon key should be a long string starting with "eyJ..."',
        restartNeeded: 'After fixing .env.local, restart the Next.js server'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error running test',
      error: error.message
    });
  }
}
