import React, { useState } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ onComplete, initialData, total }) => {
  const [paymentData, setPaymentData] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'apple-pay', name: 'Apple Pay', icon: '🍎' },
    { id: 'google-pay', name: 'Google Pay', icon: '🔵' }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateCard = () => {
    const newErrors = {};

    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentData.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Please enter the name on card';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentData.method === 'card') {
      const validationErrors = validateCard();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(paymentData);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-section">
        <h3>Payment Method</h3>
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <label key={method.id} className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentData.method === method.id}
                onChange={(e) => handleInputChange('method', e.target.value)}
              />
              <div className="method-content">
                <span className="method-icon">{method.icon}</span>
                <span className="method-name">{method.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {paymentData.method === 'card' && (
        <div className="form-section">
          <h3>Card Information</h3>
          <div className="card-preview">
            <div className="card">
              <div className="card-number">
                {paymentData.cardNumber || '**** **** **** ****'}
              </div>
              <div className="card-details">
                <div className="card-name">
                  {paymentData.nameOnCard || 'CARDHOLDER NAME'}
                </div>
                <div className="card-expiry">
                  {paymentData.expiryDate || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Card Number</label>
              <input
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={errors.cardNumber ? 'error' : ''}
              />
              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                  }
                  handleInputChange('expiryDate', value);
                }}
                placeholder="MM/YY"
                maxLength="5"
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength="4"
                className={errors.cvv ? 'error' : ''}
              />
              {errors.cvv && <span className="error-text">{errors.cvv}</span>}
            </div>

            <div className="form-group full-width">
              <label>Name on Card</label>
              <input
                type="text"
                value={paymentData.nameOnCard}
                onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                placeholder="John Doe"
                className={errors.nameOnCard ? 'error' : ''}
              />
              {errors.nameOnCard && <span className="error-text">{errors.nameOnCard}</span>}
            </div>
          </div>
        </div>
      )}

      {paymentData.method === 'paypal' && (
        <div className="form-section">
          <div className="alternative-payment">
            <p>You will be redirected to PayPal to complete your payment securely.</p>
            <div className="paypal-info">
              <span className="amount">Total: ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          className="continue-btn"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            'Continue to Review'
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;