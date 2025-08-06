import React, { useState, useRef } from 'react';
import './ZoomViewer.css';

const ZoomViewer = ({ image, alt }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const lensRef = useRef(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current || !lensRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate lens position
    const lensSize = 100;
    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

    // Calculate zoom position
    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;

    setZoomPosition({ x: zoomX, y: zoomY });
    
    // Update lens position
    lensRef.current.style.left = `${lensX}px`;
    lensRef.current.style.top = `${lensY}px`;
  };

  return (
    <div className="zoom-viewer">
      <div 
        className="zoom-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imageRef}
          src={image}
          alt={alt}
          className="zoomable-image"
        />
        {isZoomed && (
          <div 
            ref={lensRef}
            className="zoom-lens"
          />
        )}
      </div>
      
      {isZoomed && (
        <div className="zoom-result">
          <div
            className="zoomed-image"
            style={{
              backgroundImage: `url(${image})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '300%'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ZoomViewer;