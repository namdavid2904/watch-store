import React, { useState } from 'react';
import PaymentForm from './PaymentForm';
import ShippingForm from './ShippingForm';
import OrderSummary from './OrderSummary';
import './CheckoutForm.css';

const CheckoutForm = ({ cartItems, onOrderComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    shipping: {},
    payment: {},
    billing: {}
  });

  const steps = [
    { id: 1, title: 'Shipping', icon: '📦' },
    { id: 2, title: 'Payment', icon: '💳' },
    { id: 3, title: 'Review', icon: '📋' }
  ];

  const handleStepComplete = (stepData) => {
    const stepKey = steps[currentStep - 1].title.toLowerCase();
    setOrderData(prev => ({
      ...prev,
      [stepKey]: stepData
    }));
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const order = {
        ...orderData,
        items: cartItems,
        total: calculateTotal(),
        orderDate: new Date().toISOString()
      };
      
      await onOrderComplete(order);
    } catch (error) {
      console.error('Order failed:', error);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 500 ? 0 : 25;
    return subtotal + tax + shipping;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShippingForm 
            onComplete={handleStepComplete}
            initialData={orderData.shipping}
          />
        );
      case 2:
        return (
          <PaymentForm 
            onComplete={handleStepComplete}
            initialData={orderData.payment}
            total={calculateTotal()}
          />
        );
      case 3:
        return (
          <OrderSummary 
            orderData={orderData}
            cartItems={cartItems}
            total={calculateTotal()}
            onPlaceOrder={handlePlaceOrder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="checkout-form">
      <div className="checkout-header">
        <h2>Secure Checkout</h2>
        <div className="security-badges">
          <span className="badge">🔒 SSL Secured</span>
          <span className="badge">✅ Verified Merchant</span>
        </div>
      </div>

      <div className="checkout-progress">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-title">{step.title}</div>
            {index < steps.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {renderStepContent()}
        </div>
        
        <div className="checkout-sidebar">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.price} × {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Tax:</span>
                <span>${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Shipping:</span>
                <span>{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 500 ? 'FREE' : '$25.00'}</span>
              </div>
              <div className="total-line grand-total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;