import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/admin/login');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#fff'
    }}>
      <Head>
        <title>Admin | Super Crunch</title>
      </Head>
      <div style={{ textAlign: 'center' }}>
        <h2>Redirecting to admin login...</h2>
        <div style={{ 
          border: '4px solid #FFBE0B', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          margin: '20px auto',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
