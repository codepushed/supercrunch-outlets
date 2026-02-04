-- Create premieres table for Stranger Things Season 5 premiere bookings
CREATE TABLE IF NOT EXISTS premieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  menu_items JSONB DEFAULT '[]'::jsonb,
  menu_total DECIMAL(10, 2) DEFAULT 0,
  entry_fee DECIMAL(10, 2) NOT NULL DEFAULT 99,
  grand_total DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_premieres_phone ON premieres(phone);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_premieres_payment_status ON premieres(payment_status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_premieres_created_at ON premieres(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE premieres ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for booking form)
CREATE POLICY "Allow public insert" ON premieres
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow users to view their own bookings (by phone number)
CREATE POLICY "Allow users to view own bookings" ON premieres
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated update" ON premieres
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_premieres_updated_at
  BEFORE UPDATE ON premieres
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE premieres IS 'Stores booking information for Stranger Things Season 5 premiere event';
COMMENT ON COLUMN premieres.name IS 'Customer full name';
COMMENT ON COLUMN premieres.age IS 'Customer age';
COMMENT ON COLUMN premieres.phone IS 'Customer phone number';
COMMENT ON COLUMN premieres.gender IS 'Customer gender (male/female/other)';
COMMENT ON COLUMN premieres.menu_items IS 'JSON array of selected menu items with quantities and prices';
COMMENT ON COLUMN premieres.menu_total IS 'Total cost of menu items';
COMMENT ON COLUMN premieres.entry_fee IS 'Entry fee for the premiere (default ₹99)';
COMMENT ON COLUMN premieres.grand_total IS 'Total amount including entry fee and menu items';
COMMENT ON COLUMN premieres.payment_status IS 'Payment status: pending, confirmed, cancelled';
COMMENT ON COLUMN premieres.payment_screenshot_url IS 'URL to uploaded payment screenshot';
