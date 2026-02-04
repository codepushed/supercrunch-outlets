import supabase from '@/lib/supabaseClient';

export default async function handler(req, res) {
  console.log('Received order request:', {
    method: req.method,
    body: req.body ? JSON.stringify(req.body).substring(0, 200) + '...' : 'No body',
    headers: req.headers
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, items, total } = req.body;
    console.log('Parsed order data:', { name, phone, items: items?.length, total });

    // Validate required fields
    if (!name || !phone || !items || !Array.isArray(items) || items.length === 0) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!phone) missingFields.push('phone');
      if (!items || !Array.isArray(items) || items.length === 0) missingFields.push('items');
      
      console.error('Validation failed - missing fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields
      });
    }

    console.log('Attempting to insert order into Supabase...');
    const orderData = {
      name: name.trim(), 
      phone: phone.toString().trim(),
      items: items.map(item => ({
        name: item.name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0
      })),
      total: Number(total) || 0,
      created_at: new Date().toISOString()
    };

    // Insert the order without expecting a return value
    const { error: insertError } = await supabase
      .from('fun_fair')
      .insert([orderData])
      .select();

    if (insertError) {
      console.error('Supabase error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
      return res.status(500).json({ 
        error: 'Failed to create order',
        details: insertError.message
      });
    }

    console.log('Order created successfully');
    
    // Generate a client-side order ID since we can't get it from the insert
    const clientOrderId = `FF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Return success with client-generated order ID
    return res.status(200).json({ 
      success: true, 
      orderId: clientOrderId
    });
  } catch (error) {
    console.error('Unexpected server error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
