import { createClient } from '@supabase/supabase-js';
import { sendOrderEmail } from '../../lib/emailService';

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getOrders(req, res);
      case 'POST':
        return await createOrder(req, res);
      case 'PUT':
        return await updateOrder(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET: Fetch all orders (for admin)
async function getOrders(req, res) {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by status if provided
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// POST: Create new order
async function createOrder(req, res) {
  const {
    customer_name,
    customer_phone,
    customer_address,
    items,
    subtotal,
    discount = 0,
    total,
    coupon_code,
    delivery_instructions,
    cooking_instructions
  } = req.body;

  // Validate required fields
  if (!customer_name || !customer_phone || !customer_address || !items || !total) {
    return res.status(400).json({ 
      error: 'Missing required fields: customer_name, customer_phone, customer_address, items, total' 
    });
  }

  // Validate items is an array
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items must be a non-empty array' });
  }

  // Generate unique order number
  const orderNumber = generateOrderNumber();

  // Create order object
  const orderData = {
    order_number: orderNumber,
    customer_name,
    customer_phone,
    customer_address,
    items,
    subtotal: parseFloat(subtotal || total),
    discount: parseFloat(discount || 0),
    total: parseFloat(total),
    coupon_code: coupon_code || null,
    delivery_instructions: delivery_instructions || null,
    cooking_instructions: cooking_instructions || null,
    status: 'pending'
  };

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: error.message });
  }

  // Send email notification (don't wait for it, run async)
  sendOrderEmail(data).catch(err => {
    console.error('Failed to send order email:', err);
    // Don't fail the order if email fails
  });

  return res.status(201).json({
    success: true,
    order: data,
    message: 'Order placed successfully'
  });
}

// PUT: Update order status (for admin)
async function updateOrder(req, res) {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Missing required fields: id, status' });
  }

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    success: true,
    order: data,
    message: 'Order updated successfully'
  });
}
