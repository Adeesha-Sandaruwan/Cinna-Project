import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import HeaderAfterLogin from './HeaderAfterLogin.jsx';
import Footer from './Footer.jsx';
import { FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
import { generateReceiptPDF } from './ReceiptPDF';


const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

// Reusable input field
const InputField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  maxLength,
  pattern,
  onBlur,
  error
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => {
        // For card number, only allow numbers and enforce 16 digits max
        if (name === 'cardNumber') {
          const numbersOnly = e.target.value.replace(/\D/g, '');
          e.target.value = numbersOnly.substring(0, 16);
        }
        // Format expiry date
        if (name === 'expiryDate') {
          const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
          e.target.value = formatted.substring(0, 5);
        }
        // Postal code - only allow 5 digits
        if (name === 'postalCode') {
          const numbers = e.target.value.replace(/[^\d]/g, '');
          e.target.value = numbers.substring(0, 5);
        }
        // Phone number - allow +94 prefix
        if (name === 'phone') {
          let value = e.target.value;
          
          // Allow typing '+'
          if (value === '+') {
            e.target.value = '+';
            return;
          }
          
          // Handle +94 format
          if (value.startsWith('+')) {
            // Keep the '+' and only numbers after it
            const numbers = value.substring(1).replace(/[^\d]/g, '');
            if (numbers.length <= 11) { // +94 plus 9 digits
              e.target.value = '+' + numbers;
            }
          } else {
            // No + prefix, just allow numbers up to 10 digits
            const numbers = value.replace(/[^\d]/g, '');
            e.target.value = numbers.substring(0, 10);
          }
        }
        onChange(e);
      }}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      pattern={pattern}
      required
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnamon ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Checkout = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [buyNowOrder, setBuyNowOrder] = useState(null);
  const [isBuyNow, setIsBuyNow] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '',
    cardNumber: '', cardName: '', expiryDate: '', cvv: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('payNow');

  const apiCall = async (url, options = {}) => {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  };

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const buyNow = searchParams.get('buyNow') === 'true';
    setIsBuyNow(buyNow);

    const load = async () => {
      try {
        if (orderId && buyNow) {
          const order = await apiCall(`http://localhost:5000/api/orders/${orderId}`);
          setBuyNowOrder(order);
          setCart({ items: order.items.map(i => ({ product: i.product, qty: i.qty, priceAtAdd: i.price })), total: order.total, subtotal: order.total });
        } else {
          const c = await apiCall(`http://localhost:5000/api/cart/${userId || 'default'}`);
          setCart(c);
        }
      } catch (err) {
        alert(err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, searchParams, navigate]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  // Validation helper functions
  const validateName = (name) => {
    return /^[A-Za-z\s]{2,50}$/.test(name.trim());
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const validatePhone = (phone) => {
    // Allow either +94 followed by 9 digits, or just 10 digits
    return /^(\+94\d{9}|\d{10})$/.test(phone);
  };

  const validatePostalCode = (code) => {
    // Exactly 5 digits
    return /^\d{5}$/.test(code);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 10 && address.trim().length <= 200;
  };

  const validateCity = (city) => {
    return city.trim().length >= 2 && city.trim().length <= 50;
  };

  const validateCardNumber = (number) => {
    // Luhn algorithm for card number validation
    const digits = number.replace(/\s/g, '').split('').map(Number);
    const checkDigit = digits.pop();
    const sum = digits.reverse()
      .map((digit, i) => i % 2 === 0 ? digit * 2 : digit)
      .map(digit => digit > 9 ? digit - 9 : digit)
      .reduce((acc, digit) => acc + digit, 0);
    return (sum + checkDigit) % 10 === 0;
  };

  const validateCardExpiry = (expiry) => {
    // Check basic format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      throw new Error('Expiry date must be in MM/YY format');
    }

    const [month, year] = expiry.split('/').map(part => parseInt(part.trim()));
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    // Validate month
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 01 and 12');
    }

    // Validate year
    if (year < currentYear) {
      throw new Error('Card has expired');
    }

    // If it's current year, check if month has passed
    if (year === currentYear && month < currentMonth) {
      throw new Error('Card has expired');
    }

    // Check if date is too far in the future (optional, most cards are valid for 5 years)
    if (year > currentYear + 5) {
      throw new Error('Invalid expiry date - too far in the future');
    }
    
    return true;
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv.trim());
  };

  const validateForm = () => {
    // Name validations
    if (!validateName(formData.firstName)) {
      alert('First name should only contain letters and be between 2-50 characters');
      return false;
    }
    if (!validateName(formData.lastName)) {
      alert('Last name should only contain letters and be between 2-50 characters');
      return false;
    }

    // Contact validations
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return false;
    }
    if (!validatePhone(formData.phone)) {
      alert('Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)');
      return false;
    }

    // Address validations
    if (!validateAddress(formData.address)) {
      alert('Please enter a complete address (10-200 characters)');
      return false;
    }
    if (!validateCity(formData.city)) {
      alert('Please enter a valid city name (2-50 characters)');
      return false;
    }
    if (!validatePostalCode(formData.postalCode)) {
      alert('Please enter a valid 5-digit postal code');
      return false;
    }

    // Payment validations for credit card
    if (paymentMethod === 'payNow') {
      if (!validateCardNumber(formData.cardNumber)) {
        alert('Please enter a valid credit card number');
        return false;
      }
      if (!validateName(formData.cardName)) {
        alert('Please enter the cardholder name as it appears on the card');
        return false;
      }
      if (!validateCardExpiry(formData.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!validateCVV(formData.cvv)) {
        alert('Please enter a valid CVV (3-4 digits)');
        return false;
      }
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;
    setProcessing(true);
    try {
      if (paymentMethod === 'payNow') await new Promise(r => setTimeout(r, 2000));
      const shipping = (({ firstName, lastName, email, phone, address, city, postalCode }) =>
        ({ firstName, lastName, email, phone, address, city, postalCode }))(formData);

      if (isBuyNow && buyNowOrder) {
        const updated = await apiCall(`http://localhost:5000/api/orders/${buyNowOrder._id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shippingAddress: shipping, paymentMethod: paymentMethod === 'payNow' ? 'Credit Card' : 'Pay at Delivery', status: paymentMethod === 'payNow' ? 'paid' : 'pending' })
        });
        setOrderDetails(updated);
      } else {
        const order = await apiCall('http://localhost:5000/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userId || 'default',
            items: cart.items.map(i => ({ product: i.product._id, qty: i.qty, price: i.priceAtAdd })),
            total: cart.total || 0, shippingAddress: shipping,
            paymentMethod: paymentMethod === 'payNow' ? 'Credit Card' : 'Pay at Delivery'
          })
        });
        setOrderDetails(order);
        try { await fetch(`http://localhost:5000/api/cart/${userId || 'default'}`, { method: 'DELETE' }); } catch {}
        window.dispatchEvent(new Event('cartUpdated'));
      }
      setOrderComplete(true);
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading checkout...</div>;
  if (!cart?.items?.length) {
    navigate('/cart');
    return null;
  }

  if (orderComplete && orderDetails)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{orderDetails.status === 'paid' ? 'Order Successful!' : 'Order Placed!'}</h1>
          <p className="mb-6">{orderDetails.status === 'paid' ? 'Thank you for your purchase' : 'Pay at delivery'}</p>
          <p><strong>Order ID:</strong> {orderDetails._id}</p>
          <p><strong>Total:</strong> LKR {orderDetails.total.toLocaleString()}</p>
          <button 
            onClick={() => generateReceiptPDF(orderDetails, cart)}
            className="mt-4 w-full py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700"
          >
            Download Receipt
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 w-full py-3 rounded-lg text-white font-semibold" 
            style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin />
      <div className="container mx-auto px-8 grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            {['payNow', 'payAtDelivery'].map(opt => (
              <label key={opt} className="flex items-center space-x-3 mb-3 cursor-pointer">
                <input type="radio" value={opt} checked={paymentMethod === opt} onChange={e => setPaymentMethod(e.target.value)} />
                <span>{opt === 'payNow' ? 'Pay Now (Credit Card)' : 'Pay at Delivery'}</span>
              </label>
            ))}
            {paymentMethod === 'payNow' && (
              <>
                <InputField label="Card Number" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" maxLength="16" />
                <InputField label="Cardholder Name" name="cardName" value={formData.cardName} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" />
                  <InputField label="CVV" name="cvv" value={formData.cvv} onChange={handleChange} maxLength="4" placeholder="123" />
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center"><FaLock className="mr-2" /> Secure & encrypted</div>
              </>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.items.map((i, idx) => (
            <div key={idx} className="flex justify-between mb-3">
              <span>{i.product.name} (x{i.qty})</span>
              <span>LKR {(i.qty * i.priceAtAdd).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-3">
            <div className="flex justify-between mb-2">
              <span>Delivery Cost</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span style={{ color: COLORS.DEEP_CINNAMON }}>LKR {cart.total?.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={processPayment} disabled={processing} className="w-full py-3 mt-4 rounded-lg text-white font-semibold" style={{ backgroundColor: COLORS.DEEP_CINNAMON }}>
            {processing ? 'Processing...' : paymentMethod === 'payNow' ? `Pay LKR ${cart.total}` : `Place Order - Pay at Delivery`}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
