import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useCart } from "../../contexts/CartContext";
import { Luckiest_Guy, Poppins, Kaushan_Script, Smooch_Sans } from "next/font/google";
import dynamic from 'next/dynamic';
import supabase from '../lib/supabaseClient';
import styles from "@/styles/Home.module.css";
import Cards from "@/Components/Cards";
import TummySection from "@/Components/Section/TummySection";
import FoodYouSection from "@/Components/Section/FoodYouSection";
import Footer from "@/Components/Section/Footer";
import DynamicIsland from "@/Components/Section/DynamicIsland";

// Import the loading component with no SSR
const Loading = dynamic(() => import('./loading'), { ssr: false });

// Helper function to format price
const formatPrice = (price) => {
  if (typeof price === 'string') {
    // If price already has ₹ symbol, return as is
    if (price.includes('₹')) return price;
    // Otherwise add the symbol
    return `₹${price}`;
  }
  // If price is a number, format it with ₹ symbol
  return `₹${price}`;
};

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

const smoochSans = Smooch_Sans({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-smooch-sans",
});

export default function Home() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, getItemQuantity, getTotalItems, isRestaurantOpen } = useCart();
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const headerImageRef = useRef(null);
  const todaysSpecialsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (imageLoaded) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [imageLoaded]);

  useEffect(() => {
    if (headerImageRef.current && headerImageRef.current.complete) {
      setImageLoaded(true);
      setTimeout(() => setPageReady(true), 300);
    }
  }, []);
  
  // Set status loading to false after a short delay
  // This is now handled by the CartContext
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatusLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch dishes from API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dishes');
        
        if (!response.ok) {
          console.error('Error fetching dishes:', await response.text());
          return;
        }
        
        const data = await response.json();
        if (data && Array.isArray(data)) {
          // Filter only visible dishes and map image_url to image
          const visibleDishes = data
            .filter(dish => dish.is_visible !== false)
            .map(dish => ({
              ...dish,
              image: dish.image_url || '/fallbackImag.png'
            }));
          setDishes(visibleDishes);
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDishes();
  }, []);


  const scrollToTodaysSpecials = () => {
    if (todaysSpecialsRef.current) {
      todaysSpecialsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };



  // Function to handle checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };

  console.log(dishes, "dishes")

  return (
    <>
      <Head>
        <title>Super Crunch - Late Night Food Delivery</title>
        <meta name="description" content="Super Crunch delivers your favorite late-night food cravings. Order now starting from ₹69 with no delivery charge!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/seo.png" type="image/png" />
        <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Smooch+Sans:wght@700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://supercrunch.in/" />
        <meta property="og:title" content="Super Crunch - Late Night Food Delivery" />
        <meta property="og:description" content="Order now starting from ₹69 with no delivery charge!" />
        <meta property="og:image" content="/seo.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://supercrunch.in/" />
        <meta property="twitter:title" content="Super Crunch - Late Night Food Delivery" />
        <meta property="twitter:description" content="Order now starting from ₹69 with no delivery charge!" />
        <meta property="twitter:image" content="/seo.png" />

        <meta name="keywords" content="food delivery, late night food, Super Crunch, fast delivery, online food ordering, midnight snacks, food near me" />
        <meta name="author" content="Super Crunch" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://supercrunch.in/" />
      </Head>

      {!pageReady && <Loading />}

      {/* Google Review Floating Button */}
      <a
        href="https://g.page/r/CQIRTYVZjWx0EBI/review"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.googleReviewButton}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className={styles.googleIcon} />
        <span>Review us on Google</span>
      </a>

      <div
        className={`${styles.container} ${luckiestGuy.variable} ${poppins.variable} ${kaushanScript.variable} ${smoochSans.variable}`}
        style={{ visibility: pageReady ? 'visible' : 'hidden' }}
      >
        <div className={styles.parallaxHero}>
          <div
            className={styles.parallaxImage}
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          >
            <img
              src="/ai.png"
              alt="Super Crunch"
              className={styles.fullWidthImage}
              ref={headerImageRef}
              onLoad={() => {
                setImageLoaded(true);
                setTimeout(() => setPageReady(true), 300);
              }}
            />
          </div>
        </div>

        <div className={styles.heroSection}>
          <div className={styles.heroTextContent}>
            <h2 className={styles.heroTitle}>Midnight Hunger Mood</h2>
            <p className={styles.heroSubtitle}>Let’s fix that. Fast.</p>
            <button className={styles.menuButton} onClick={scrollToTodaysSpecials}>Explore Menu</button>
          </div>
        </div>

    
        <main className={styles.main}>
          <section className={styles.menuSection} ref={todaysSpecialsRef}>
            <Cards 
              menuItems={dishes}
              loading={statusLoading}
            />
          </section>
        </main>

        <TummySection />
        <Footer />


        {/* Closed Restaurant Modal */}
        {showClosedModal && (
          <div className={styles.modalOverlay} onClick={() => setShowClosedModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalCloseButton} onClick={() => setShowClosedModal(false)}>
                  &times;
                </div>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalIcon}>
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className={styles.modalTitle}>We're currently closed</h3>
                <p className={styles.modalMessage}>
                  Sorry, we're not accepting orders at the moment. Please check back later!
                </p>
                <p className={styles.modalSubMessage}>
                  We'll be back soon with delicious food for your late-night cravings.
                </p>
                <button
                  className={styles.modalButton}
                  onClick={() => setShowClosedModal(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
