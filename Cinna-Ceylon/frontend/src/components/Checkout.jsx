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
const InputField = ({ label, name, type = "text", value, onChange, placeholder, maxLength }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnamon"
    />
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

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    for (let f of required) {
      if (!formData[f].trim()) {
        alert(`Please fill in ${f}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Invalid email');
      return false;
    }
    if (paymentMethod === 'payNow' && (formData.cardNumber.length < 16 || formData.cvv.length < 3)) {
      alert('Invalid card details');
      return false;
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
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span style={{ color: COLORS.DEEP_CINNAMON }}>LKR {cart.total?.toLocaleString()}</span>
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
