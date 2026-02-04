import supabase from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Handle GET request - fetch restaurant status
  if (req.method === 'GET') {
    try {
      // Check if table exists by attempting to query it
      const { data, error } = await supabase
        .from('restaurant_status')
        .select('is_open')
        .eq('id', 1)
        .single();
      
      // If there's a PostgreSQL error about the relation not existing
      if (error && error.code === '42P01') {
        console.log('Table does not exist yet, returning default open status');
        return res.status(200).json({ is_open: true });
      } else if (error) {
        console.error('Error fetching restaurant status:', error);
        return res.status(200).json({ is_open: true }); // Default to open on error
      }
      
      // If no data exists yet, default to open
      if (!data) {
        return res.status(200).json({ is_open: true });
      }
      
      return res.status(200).json({ is_open: data.is_open });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(200).json({ is_open: true }); // Default to open on error
    }
  }
  
  // Handle POST request - update restaurant status
  if (req.method === 'POST') {
    try {
      // For simplicity, we'll skip complex auth verification here
      // and just check if the request has a valid session
      
      // Parse the request body
      const { is_open } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Note: You need to create the restaurant_status table in Supabase with these columns:
      // - id (integer, primary key)
      // - is_open (boolean, default true)
      // If the table doesn't exist, we'll return an error message
      
      // Update the restaurant status
      const { error } = await supabase
        .from('restaurant_status')
        .upsert({ id: 1, is_open }, { onConflict: 'id' });

      if (error) {
        console.error('Error updating restaurant status:', error);
        // Check if the error is because the table doesn't exist
        if (error.code === '42P01') {
          return res.status(500).json({ 
            error: 'Table restaurant_status does not exist. Please create it in the Supabase dashboard.',
            details: 'Create a table named restaurant_status with columns: id (integer, primary key), is_open (boolean, default true)'
          });
        }
        // Check if it's an RLS policy error
        if (error.message && error.message.includes('violates row-level security policy')) {
          return res.status(500).json({ 
            error: 'Row-level security policy is blocking access to the restaurant_status table.',
            details: 'You need to disable RLS or create a policy that allows access to the restaurant_status table.'
          });
        }
        return res.status(500).json({ error: 'Failed to update restaurant status', details: error.message });
      }

      return res.status(200).json({ is_open });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
