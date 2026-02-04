import { createClient } from '@supabase/supabase-js';
import supabase from '../../lib/supabaseClient';

// Create a Supabase client with the service role key (bypasses RLS) - only for admin operations
const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, admin operations will fail');
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey
  );
};

// Helper function to clean dish data before saving
const cleanDishData = (dish) => {
  const cleanedDish = {
    name: dish.name,
    price: parseFloat(dish.price),
    description: dish.description,
    image_url: dish.image_url || '',
    is_visible: dish.is_visible !== undefined ? dish.is_visible : true,
    category: dish.category || 'Snacks'
  };
  
  // Only add tags if they exist and are not empty
  if (dish.tags && Array.isArray(dish.tags) && dish.tags.length > 0) {
    // Store tags as a simple string joined by commas
    cleanedDish.tags = dish.tags.join(',');
  }
  
  return cleanedDish;
};

// Helper function to process dish data for client
const processDishForClient = (dish) => {
  if (!dish) return dish;
  
  const processedDish = {...dish};
  
  // Convert tags string back to array if it exists
  if (dish.tags && typeof dish.tags === 'string') {
    processedDish.tags = dish.tags.split(',').filter(tag => tag.trim() !== '');
  } else {
    processedDish.tags = [];
  }
  
  return processedDish;
};

export default async function handler(req, res) {
  const { method, body } = req;
  
  // For GET requests, we allow public access for the home page
  // For other methods, require authentication and admin client
  let supabaseAdmin = null;

  if (method !== 'GET') {
    supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server configuration error - admin operations unavailable' });
    }

    try {
      // For all other methods, require authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No valid token provided' });
      }

      const token = authHeader.split(' ')[1];

      // Verify the token
      const { data, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !data || !data.user) {
        console.error('Auth error:', authError);
        return res.status(401).json({ error: 'Unauthorized - Invalid token', details: authError ? authError.message : 'No user found' });
      }
    } catch (authError) {
      console.error('Auth exception:', authError);
      return res.status(401).json({ error: 'Authentication error', details: authError.message });
    }
  }
  
  // Handle different HTTP methods
  switch (method) {
    case 'GET':
      try {
        // Use public client for GET requests
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .order('category')
          .order('name');

        if (error) throw error;

        // Process dishes for client
        const processedData = (data || []).map(processDishForClient);

        return res.status(200).json(processedData);
      } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: error.message, details: error.toString() });
      }
      
    case 'POST':
      try {
        console.log('POST Request - Received dish data:', body);
        
        // Clean dish data before saving
        const cleanedDish = cleanDishData(body);
        console.log('Cleaned dish data to insert:', cleanedDish);
        
        const { data, error } = await supabaseAdmin
          .from('dishes')
          .insert([cleanedDish]);
          
        if (error) {
          console.error('Supabase error on insert:', error);
          throw error;
        }
        
        // Process the returned dish for the client
        const processedData = data ? data.map(processDishForClient) : [];
        
        return res.status(201).json(processedData);
      } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: error.message, details: error.toString() });
      }
      
    case 'PUT':
      try {
        const { id } = body;
        console.log('PUT Request - Received dish data:', body);
        
        if (!id) {
          throw new Error('Dish ID is required for updates');
        }
        
        // Clean dish data before saving
        const cleanedDish = cleanDishData(body);
        console.log('Cleaned dish data to update:', cleanedDish);
        
        const { data, error } = await supabaseAdmin
          .from('dishes')
          .update(cleanedDish)
          .eq('id', id);
          
        if (error) {
          console.error('Supabase error on update:', error);
          throw error;
        }
        
        // Process the returned dish for the client
        const processedData = data ? data.map(processDishForClient) : [];
        
        return res.status(200).json(processedData);
      } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: error.message, details: error.toString() });
      }
      
    case 'DELETE':
      try {
        const { id } = body;
        
        const { error } = await supabaseAdmin
          .from('dishes')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return res.status(200).json({ message: 'Dish deleted successfully' });
      } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: error.message, details: error.toString() });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
