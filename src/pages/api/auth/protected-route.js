import supabase from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session exists, return unauthorized
  if (!session) {
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated'
    });
  }

  // If session exists, return the user
  return res.status(200).json({
    user: session.user
  });
}
