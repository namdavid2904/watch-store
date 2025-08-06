import React, { useState, useRef, useEffect } from 'react';
import './Product360Viewer.css';

const Product360Viewer = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      const newIndex = (currentImageIndex + direction + images.length) % images.length;
      setCurrentImageIndex(newIndex);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging, currentImageIndex, startX]);

  return (
    <div className="product-360-viewer" ref={containerRef}>
      <div className="viewer-container">
        <img
          src={images[currentImageIndex]}
          alt={`${productName} - View ${currentImageIndex + 1}`}
          className="product-360-image"
          onMouseDown={handleMouseDown}
          draggable={false}
        />
        <div className="viewer-controls">
          <button className="rotate-btn" onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}>
            🔄 Rotate
          </button>
          <div className="view-indicator">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>
      <div className="viewer-thumbnails">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`View ${index + 1}`}
            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Product360Viewer;