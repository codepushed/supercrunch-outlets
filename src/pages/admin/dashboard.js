import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Luckiest_Guy, Poppins, Kaushan_Script } from "next/font/google";
import imageCompression from 'browser-image-compression';
import styles from '../../styles/Admin.module.css';
import supabase from '../../lib/supabaseClient';

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

export default function Dashboard() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDish, setCurrentDish] = useState({ name: '', price: '', description: '', tags: [], image_url: '', is_visible: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        setAuthChecking(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to login page without showing dashboard content first
          router.replace('/admin/login');
        } else {
          // Set authenticated to true to show dashboard content
          setAuthenticated(true);
          // Load dishes if authenticated
          fetchDishes();
          // Fetch restaurant status
          fetchRestaurantStatus();
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.replace('/admin/login');
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkSession();
  }, [router]);
  
  // Fetch restaurant status
  const fetchRestaurantStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/api/restaurant/status');
      
      // Even if there's an error, the API will return a default value
      const data = await response.json();
      
      // Set the restaurant status from the API response
      setIsRestaurantOpen(data.is_open);
    } catch (error) {
      console.error('Error fetching restaurant status:', error);
      // Default to open if there's an error
      setIsRestaurantOpen(true);
    } finally {
      setStatusLoading(false);
    }
  };
  
  // State for status error message
  const [statusError, setStatusError] = useState('');

  // Toggle restaurant open/closed status
  const toggleRestaurantStatus = async () => {
    try {
      setStatusLoading(true);
      setStatusError('');
      
      const newStatus = !isRestaurantOpen;
      
      // Update the status via API
      const response = await fetch('/api/restaurant/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_open: newStatus })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error && data.error.includes('does not exist')) {
          setStatusError('Table not found in Supabase. Please create the restaurant_status table.');
        } else {
          setStatusError(data.error || 'Failed to update restaurant status');
        }
        throw new Error(data.error || 'Failed to update restaurant status');
      }
      
      // Update local state
      setIsRestaurantOpen(newStatus);
      console.log(`Restaurant status updated to: ${newStatus ? 'Open' : 'Closed'}`);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      // Revert back to the previous status
      fetchRestaurantStatus();
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch dishes from API
  const fetchDishes = async () => {
    try {
      setLoading(true);
      
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Call our API with the session token
      const response = await fetch('/api/dishes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dishes');
      }
      
      const data = await response.json();
      setDishes(data || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Open modal for adding a new dish

  const CATEGORIES = [
    'New Arrivals',
    'Crunch Corner',
    'Sip & Chill',
    'Bowl Stories',
    'Pasta Special',
    'Desserts'
  ];

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDish({ name: '', price: '', description: '', tags: [], image_url: '', is_visible: true, category: 'Snacks' });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing dish
  const openEditModal = (dish) => {
    setIsEditing(true);
    // Ensure tags is always an array, even if null/undefined in the database
    setCurrentDish({
      ...dish,
      tags: dish.tags || [],
      is_visible: dish.is_visible !== undefined ? dish.is_visible : true,
      category: dish.category || 'Snacks'
    });
    setImageFile(null);
    setImagePreview(dish.image_url || null);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDish({ ...currentDish, [name]: value });
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault(); // Prevent form submission
      const newTag = e.target.value.trim();
      // Ensure tags array exists before trying to check includes
      const currentTags = currentDish.tags || [];
      if (!currentTags.includes(newTag)) {
        setCurrentDish({
          ...currentDish,
          tags: [...currentTags, newTag]
        });
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    // Ensure tags array exists before filtering
    const currentTags = currentDish.tags || [];
    setCurrentDish({
      ...currentDish,
      tags: currentTags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle image file selection and compression
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Compression options
      const options = {
        maxSizeMB: 0.5, // Max file size 500KB
        maxWidthOrHeight: 1024, // Max dimension
        useWebWorker: true,
        fileType: file.type, // Preserve original format (PNG, JPEG, etc.)
        preserveExif: true, // Preserve image metadata
        initialQuality: 0.9 // High quality compression
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
      
      setImageFile(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToSupabase = async (file) => {
    try {
      // Get file extension from the file type
      const fileExt = file.type.split('/')[1] || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `dish-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dishes')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dishes')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Save dish (add or update)
  const saveDish = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const token = session.access_token;
      
      // Upload image if a new one was selected
      let imageUrl = currentDish.image_url || '';
      if (imageFile) {
        try {
          imageUrl = await uploadImageToSupabase(imageFile);
        } catch (error) {
          alert('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Create a clean dish data object without any undefined values
      const dishData = {
        name: currentDish.name,
        price: currentDish.price,
        description: currentDish.description,
        image_url: imageUrl,
        is_visible: currentDish.is_visible !== undefined ? currentDish.is_visible : true,
        category: currentDish.category || 'Snacks'
      };
      
      // Only add tags if they exist and have items
      if (currentDish.tags && currentDish.tags.length > 0) {
        dishData.tags = currentDish.tags;
      }
      
      let response;
      
      if (isEditing) {
        // Update existing dish
        dishData.id = currentDish.id;
        
        response = await fetch('/api/dishes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dishData)
        });
      } else {
        // Add new dish
        response = await fetch('/api/dishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dishData)
        });
      }
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Server returned error:', errorData);
          throw new Error(errorData.error || 'Failed to save dish');
        } catch (jsonError) {
          console.error('Could not parse error response:', jsonError);
          throw new Error('Failed to save dish: Server returned an invalid response');
        }
      }
      
      // Refresh dishes list
      fetchDishes();
      closeModal();
    } catch (error) {
      console.error('Error saving dish:', error);
      console.error('Dish data being sent:', dishData);
      
      // Simple error alert with the error message
      alert(`Error saving dish: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete dish
  const deleteDish = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        setLoading(true);
        
        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('You must be logged in to perform this action');
        }
        
        // Call API to delete dish
        const response = await fetch('/api/dishes', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ id })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete dish');
        }
        
        fetchDishes();
      } catch (error) {
        console.error('Error deleting dish:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`${styles.container} ${luckiestGuy.variable} ${poppins.variable} ${kaushanScript.variable}`}>
      <Head>
        <title>Admin Dashboard | Super Crunch</title>
        <meta name="description" content="Super Crunch Admin Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {authChecking ? (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p>Verifying authentication...</p>
        </div>
      ) : authenticated ? (
        <>
          <header className={styles.header}>
            <div className={styles.headerTitleContainer}>
              <h1 className={styles.brandTitle}>SUPER CRUNCH</h1>
              <h2 className={styles.headerTitle}>Admin Dashboard</h2>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </header>

          <main className={styles.main}>
            <div className={styles.dashboardHeader}>
              <h2 className={styles.dashboardTitle}>Menu Management</h2>
              
              <div className={styles.dashboardControls}>
                <div className={styles.statusToggleContainer}>
                  <div className={styles.statusToggleWrapper}>
                    <p className={styles.statusTitle}>Restaurant Status:</p>
                    <label className={styles.toggleSwitch}>
                      <input 
                        type="checkbox" 
                        className={styles.toggleInput} 
                        checked={isRestaurantOpen} 
                        onChange={toggleRestaurantStatus}
                        disabled={statusLoading}
                      />
                      <span className={styles.toggleLabel}></span>
                    </label>
                    <span className={`${styles.statusLabel} ${isRestaurantOpen ? styles.statusOpen : styles.statusClosed}`}>
                      {isRestaurantOpen ? 'Open' : 'Closed'}
                    </span>
                    {statusLoading && <span className={styles.statusLoading}>Updating...</span>}
                  </div>
                  {statusError && <p className={styles.statusError}>{statusError}</p>}
                </div>
                
                <button onClick={openAddModal} className={styles.addButton}>
                  Add New Dish
                </button>
              </div>
            </div>

            {loading ? (
              <p>Loading dishes...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : dishes.length === 0 ? (
              <p>No dishes found. Add your first dish!</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Tags</th>
                    <th>Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dishes.map((dish) => (
                    <tr key={dish.id}>
                      <td>
                        {dish.image_url ? (
                          <img 
                            src={dish.image_url} 
                            alt={dish.name} 
                            className={styles.dishThumbnail}
                          />
                        ) : (
                          <div className={styles.noImage}>No Image</div>
                        )}
                      </td>
                      <td>{dish.name}</td>
                      <td>{dish.category}</td>
                      <td>₹{parseFloat(dish.price).toFixed(2)}</td>
                      <td>{dish.description.substring(0, 50)}...</td>
                      <td>
                        {dish.tags && dish.tags.length > 0 && (
                          <div className={styles.tagContainer}>
                            {dish.tags.map((tag, index) => (
                              <span key={index} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.visibilityBadge} ${dish.is_visible ? styles.visibleBadge : styles.hiddenBadge}`}>
                          {dish.is_visible ? '✓ Visible' : '✗ Hidden'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => openEditModal(dish)}
                          className={styles.actionButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDish(dish.id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Modal for adding/editing dishes */}
            {isModalOpen && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                      {isEditing ? 'Edit Dish' : 'Add New Dish'}
                    </h3>
                    <button onClick={closeModal} className={styles.closeButton}>
                      &times;
                    </button>
                  </div>

                  <form onSubmit={saveDish}>
                    <div className={styles.formGroup}>
                      <label htmlFor="image" className={styles.label}>
                        Dish Image
                      </label>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className={styles.input}
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                      />
                      {uploadingImage && <p className={styles.uploadingText}>Compressing image...</p>}
                      {imagePreview && (
                        <div className={styles.imagePreviewContainer}>
                          <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                        </div>
                      )}
                      <p className={styles.imageHelp}>Image will be compressed to max 500KB and 1024px</p>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.label}>
                        Dish Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={styles.input}
                        value={currentDish.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="price" className={styles.label}>
                        Price 
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className={styles.input}
                        value={currentDish.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="category" className={styles.label}>
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        className={styles.input}
                        value={currentDish.category || 'Snacks'}
                        onChange={handleInputChange}
                        required
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="description" className={styles.label}>
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className={styles.textarea}
                        value={currentDish.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="tags" className={styles.label}>
                        Tags (e.g., "out of stock", "hot seller", "limited quantity")
                      </label>
                      <div className={styles.tagInputContainer}>
                        <input
                          id="tagInput"
                          type="text"
                          className={styles.input}
                          placeholder="Type a tag and press Enter"
                          onKeyDown={handleTagInput}
                          // Add this to prevent form submission on Enter
                          onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                        />
                      </div>
                      <div className={styles.tagsPreview}>
                        {currentDish.tags && currentDish.tags.map((tag, index) => (
                          <div key={index} className={styles.tagItem}>
                            <span>{tag}</span>
                            <button 
                              type="button" 
                              className={styles.removeTagButton}
                              onClick={() => removeTag(tag)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className={styles.tagHelp}>Press Enter to add a tag. Click × to remove a tag.</p>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <div className={styles.visibilityToggleWrapper}>
                          <span>Show on Website Menu</span>
                          <label className={styles.toggleSwitch}>
                            <input 
                              type="checkbox" 
                              className={styles.toggleInput} 
                              checked={currentDish.is_visible}
                              onChange={(e) => setCurrentDish({ ...currentDish, is_visible: e.target.checked })}
                            />
                            <span className={styles.toggleLabel}></span>
                          </label>
                          <span className={`${styles.statusLabel} ${currentDish.is_visible ? styles.statusOpen : styles.statusClosed}`}>
                            {currentDish.is_visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </label>
                      <p className={styles.tagHelp}>Toggle this to show/hide the dish on the main website menu</p>
                    </div>

                    <div className={styles.buttonGroup}>
                      <button
                        type="button"
                        onClick={closeModal}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button type="submit" className={styles.saveButton}>
                        {isEditing ? 'Update Dish' : 'Add Dish'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </>
      ) : (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p>Redirecting to login...</p>
        </div>
      )}
    </div>
  );
}
