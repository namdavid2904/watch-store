import React, { useState, useEffect } from 'react';
import './OrderTracker.css';

const OrderTracker = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderStatuses = [
    { id: 'confirmed', label: 'Order Confirmed', icon: '✅' },
    { id: 'processing', label: 'Processing', icon: '🔄' },
    { id: 'shipped', label: 'Shipped', icon: '📦' },
    { id: 'delivery', label: 'Out for Delivery', icon: '🚚' },
    { id: 'delivered', label: 'Delivered', icon: '🏠' }
  ];

  useEffect(() => {
    // Mock order data
    const mockOrder = {
      id: orderId,
      orderNumber: 'WS-2024-001234',
      status: 'shipped',
      placedDate: '2024-01-15T10:30:00Z',
      estimatedDelivery: '2024-01-20T18:00:00Z',
      items: [
        {
          id: '1',
          name: 'Rolex Submariner',
          image: '/watch1.jpg',
          price: 8500,
          quantity: 1
        }
      ],
      shipping: {
        address: '123 Main Street, New York, NY 10001',
        method: 'Express Shipping',
        carrier: 'FedEx',
        trackingNumber: '1234567890123456'
      },
      timeline: [
        {
          status: 'confirmed',
          date: '2024-01-15T10:30:00Z',
          description: 'Order confirmed and payment processed'
        },
        {
          status: 'processing',
          date: '2024-01-15T14:20:00Z',
          description: 'Order is being prepared'
        },
        {
          status: 'shipped',
          date: '2024-01-16T09:15:00Z',
          description: 'Package shipped via FedEx Express',
          location: 'New York Distribution Center'
        }
      ]
    };

    setTimeout(() => {
      setOrderDetails(mockOrder);
      setTrackingData(mockOrder.timeline);
      setLoading(false);
    }, 1000);
  }, [orderId]);

  const getCurrentStatusIndex = () => {
    if (!orderDetails) return 0;
    return orderStatuses.findIndex(status => status.id === orderDetails.status);
  };

  const handleTrackWithCarrier = () => {
    if (orderDetails?.shipping?.trackingNumber) {
      window.open(`https://www.fedex.com/apps/fedextrack/?tracknumbers=${orderDetails.shipping.trackingNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="order-tracker-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-not-found">
        <h3>Order not found</h3>
        <p>Please check your order number and try again.</p>
      </div>
    );
  }

  return (
    <div className="order-tracker">
      <div className="order-header">
        <h2>Order #{orderDetails.orderNumber}</h2>
        <div className="order-meta">
          <span>Placed on {new Date(orderDetails.placedDate).toLocaleDateString()}</span>
          <span className={`status-badge ${orderDetails.status}`}>
            {orderStatuses.find(s => s.id === orderDetails.status)?.label}
          </span>
        </div>
      </div>

      <div className="tracking-progress">
        <div className="progress-bar">
          {orderStatuses.map((status, index) => (
            <div 
              key={status.id}
              className={`progress-step ${index <= getCurrentStatusIndex() ? 'completed' : ''} ${index === getCurrentStatusIndex() ? 'current' : ''}`}
            >
              <div className="step-icon">{status.icon}</div>
              <div className="step-label">{status.label}</div>
              {index < orderStatuses.length - 1 && (
                <div className={`step-connector ${index < getCurrentStatusIndex() ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tracking-details">
        <div className="details-grid">
          <div className="detail-card">
            <h3>Estimated Delivery</h3>
            <div className="delivery-date">
              {new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="delivery-time">
              by {new Date(orderDetails.estimatedDelivery).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          <div className="detail-card">
            <h3>Shipping Details</h3>
            <div className="shipping-info">
              <p><strong>Method:</strong> {orderDetails.shipping.method}</p>
              <p><strong>Carrier:</strong> {orderDetails.shipping.carrier}</p>
              <p><strong>Tracking #:</strong> {orderDetails.shipping.trackingNumber}</p>
              <button onClick={handleTrackWithCarrier} className="track-carrier-btn">
                Track with {orderDetails.shipping.carrier}
              </button>
            </div>
          </div>

          <div className="detail-card">
            <h3>Delivery Address</h3>
            <div className="address">
              {orderDetails.shipping.address}
            </div>
          </div>
        </div>
      </div>

      <div className="order-timeline">
        <h3>Order Timeline</h3>
        <div className="timeline">
          {trackingData.map((event, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-date">
                  {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                </div>
                <div className="timeline-description">{event.description}</div>
                {event.location && (
                  <div className="timeline-location">📍 {event.location}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-items">
        <h3>Items in this order</h3>
        <div className="items-list">
          {orderDetails.items.map(item => (
            <div key={item.id} className="order-item">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;