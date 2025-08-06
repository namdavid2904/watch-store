import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCatalog/ProductCard';
import './UserWishlist.css';

const UserWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  // Mock wishlist data
  useEffect(() => {
    const mockWishlist = [
      {
        _id: '1',
        name: 'Rolex Submariner',
        brand: 'Rolex',
        price: 8500,
        image: ['/watch1.jpg', '/watch1-alt.jpg'],
        color: 'Black',
        dateAdded: '2024-01-15'
      },
      {
        _id: '2',
        name: 'Omega Speedmaster',
        brand: 'Omega',
        price: 4200,
        image: ['/watch2.jpg', '/watch2-alt.jpg'],
        color: 'Steel',
        dateAdded: '2024-01-10'
      }
    ];

    setTimeout(() => {
      setWishlistItems(mockWishlist);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
  };

  const handleMoveToCart = (productId) => {
    console.log('Moving to cart:', productId);
    // Implement move to cart logic
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Wishlist link copied to clipboard!');
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'oldest':
        return new Date(a.dateAdded) - new Date(b.dateAdded);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'brand':
        return a.brand.localeCompare(b.brand);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="user-wishlist">
      <div className="wishlist-header">
        <div className="header-content">
          <h2>My Wishlist</h2>
          <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleShare} className="share-btn">
            🔗 Share Wishlist
          </button>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="brand">Brand A-Z</option>
          </select>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">♥</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love by clicking the heart icon</p>
          <a href="/products" className="browse-btn">Browse Products</a>
        </div>
      ) : (
        <div className="wishlist-grid">
          {sortedItems.map(item => (
            <div key={item._id} className="wishlist-item">
              <ProductCard 
                product={item}
                onWishlistToggle={handleRemoveFromWishlist}
                onQuickView={() => {}}
              />
              <div className="wishlist-actions">
                <button 
                  onClick={() => handleMoveToCart(item._id)}
                  className="move-to-cart-btn"
                >
                  🛒 Move to Cart
                </button>
                <button 
                  onClick={() => handleRemoveFromWishlist(item._id)}
                  className="remove-btn"
                >
                  🗑 Remove
                </button>
              </div>
              <div className="date-added">
                Added {new Date(item.dateAdded).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserWishlist;