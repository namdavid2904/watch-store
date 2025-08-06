import React, { useState } from 'react';
import './ARTryOn.css';

const ARTryOn = ({ productId, productName }) => {
  const [isARActive, setIsARActive] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const startARSession = async () => {
    try {
      if ('xr' in navigator) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (isSupported) {
          setIsARActive(true);
          // Initialize AR session
          console.log('Starting AR session for product:', productId);
        } else {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    } catch (error) {
      console.error('AR not supported:', error);
      setIsSupported(false);
    }
  };

  const stopARSession = () => {
    setIsARActive(false);
    console.log('Stopping AR session');
  };

  if (!isSupported) {
    return (
      <div className="ar-try-on ar-not-supported">
        <div className="ar-fallback">
          <h4>AR Try-On</h4>
          <p>AR is not supported on this device. Try using a mobile device with AR capabilities.</p>
          <button className="ar-btn disabled" disabled>
            📱 AR Not Available
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-try-on">
      <div className="ar-header">
        <h4>Try On in AR</h4>
        <p>See how {productName} looks on your wrist</p>
      </div>
      
      {!isARActive ? (
        <button className="ar-btn start-ar" onClick={startARSession}>
          🥽 Try On with AR
        </button>
      ) : (
        <div className="ar-session-active">
          <div className="ar-controls">
            <button className="ar-btn stop-ar" onClick={stopARSession}>
              ❌ Stop AR
            </button>
            <button className="ar-btn capture">
              📸 Capture
            </button>
          </div>
          <div className="ar-instructions">
            <p>Point your camera at your wrist and move slowly</p>
          </div>
        </div>
      )}
      
      <div className="ar-features">
        <div className="feature">
          <span className="feature-icon">📏</span>
          <span>Size Preview</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🎨</span>
          <span>Color Options</span>
        </div>
        <div className="feature">
          <span className="feature-icon">💾</span>
          <span>Save & Share</span>
        </div>
      </div>
    </div>
  );
};

export default ARTryOn;