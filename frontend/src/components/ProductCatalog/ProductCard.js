import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onWishlistToggle, onQuickView }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(product._id, !isWishlisted);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  const handleImageHover = () => {
    if (product.image && product.image.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image?.[currentImageIndex] || '/placeholder-watch.jpg'}
            alt={product.name}
            className="product-image"
            onMouseEnter={handleImageHover}
            onMouseLeave={handleImageLeave}
          />
        </Link>
        
        <div className="product-badges">
          {product.sold > 100 && <span className="badge popular">Popular</span>}
          {product.quantity < 5 && <span className="badge limited">Limited</span>}
        </div>

        <div className="product-overlay">
          <button 
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlistClick}
            title="Add to Wishlist"
          >
            ♥
          </button>
          <button 
            className="quick-view-btn"
            onClick={handleQuickView}
            title="Quick View"
          >
            👁
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <Link to={`/product/${product._id}`} className="product-name">
          {product.name}
        </Link>
        
        <div className="product-details">
          <div className="product-price">
            {formatPrice(product.price)}
          </div>
          
          <div className="product-variants">
            {product.color && (
              <div className="color-variant">
                <span 
                  className="color-dot" 
                  style={{ backgroundColor: product.color.toLowerCase() }}
                  title={product.color}
                />
              </div>
            )}
          </div>
        </div>

        <div className="product-actions">
          <button className="add-to-cart-btn">
            Add to Cart
          </button>
          <div className="product-rating">
            <div className="stars">
              ★★★★☆
            </div>
            <span className="rating-count">(24)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;