-- Enable Row Level Security on the fun_fair table
ALTER TABLE public.fun_fair ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous inserts (for public order submission)
CREATE POLICY "Enable insert for all users"
ON public.fun_fair
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create a policy that allows users to read their own orders
CREATE POLICY "Enable read access for authenticated users"
ON public.fun_fair
FOR SELECT
TO authenticated
USING (auth.uid() = auth.uid());

-- Create a policy that allows admins to read all orders
CREATE POLICY "Enable read access for admins"
ON public.fun_fair
FOR SELECT
TO service_role
USING (true);

-- Create a policy that allows admins to update all orders
CREATE POLICY "Enable update for admins"
ON public.fun_fair
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy that allows admins to delete all orders
CREATE POLICY "Enable delete for admins"
ON public.fun_fair
FOR DELETE
TO service_role
USING (true);
