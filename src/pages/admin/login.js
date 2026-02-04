import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/Admin.module.css';
import supabase from '../../lib/supabaseClient';
import { Luckiest_Guy, Poppins, Kaushan_Script } from 'next/font/google';

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luckiest-guy",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const kaushanScript = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kaushan-script",
});


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();


  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is already logged in, redirect to dashboard
          router.replace('/admin/dashboard');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For debugging - log if env vars are available (not their values)
      console.log('Login attempt - env vars available:', { 
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL, 
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      });

      // Use a test user for development if needed
      // For production, you would use the actual form values
      const loginEmail = email;
      const loginPassword = password;
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        console.error('Supabase auth error details:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.message.includes('API key')) {
          throw new Error(
            'Authentication service configuration error. Please ensure your .env.local file contains valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY values.'
          );
        } else {
          throw error;
        }
      }
      
      // Successfully logged in
      setLoading(true); // Keep loading state active during redirect
      router.replace('/admin/dashboard');
    } catch (error) {
      setError(error.message || 'An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${luckiestGuy.variable} ${poppins.variable} ${kaushanScript.variable}`}>
      <Head>
        <title>Admin Login | Super Crunch</title>
        <meta name="description" content="Super Crunch Admin Login" />
      </Head>

      <main className={styles.main}>
        {checkingAuth ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Checking authentication...</p>
          </div>
        ) : (
          <div className={styles.loginContainer}>
          <header className={styles.header} style={{ backgroundColor: 'transparent' }}>
            <div className={styles.headerTitleContainer}>
              <h1 className={styles.brandTitle}>SUPER CRUNCH</h1>
              <h2 className={styles.headerTitle} style={{color: '#000'}}>Admin Login</h2>
            </div>
          </header>
            
            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.button}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
