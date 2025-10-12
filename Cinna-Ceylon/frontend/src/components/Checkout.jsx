import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
import { generateReceiptPDF } from './ReceiptPDF';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validatePostalCode,
  validateCardNumber,
  validateCardExpiry,
  validateCVV
} from '../utils/validations.jsx';
import {
  sanitizePhone,
  allowPhoneKey,
  handlePhonePaste,
  allowPostalCodeKey,
  handlePostalCodePaste,
  sanitizePostalCodeInput,
  allowCardNumberKey,
  handleCardNumberPaste,
  sanitizeCardNumber,
  allowExpiryKey,
  handleExpiryPaste,
  sanitizeExpiry,
  allowCVVKey,
  handleCVVPaste,
  sanitizeCVVInput
} from '../utils/validations.jsx';

// Theme colors used for buttons and highlights
const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  DARK_SLATE: "#2d2d2d",
};

const Checkout = () => {
  const { userId } = useParams(); // Get userId from URL params
  const navigate = useNavigate(); // Navigation hook
  const [searchParams] = useSearchParams(); // For query params (buyNow, orderId)

  // ----- State variables -----
  const [cart, setCart] = useState(null); // Stores cart items
  const [loading, setLoading] = useState(true); // Loading state for UI
  const [processing, setProcessing] = useState(false); // Checkout button processing state
  const [orderComplete, setOrderComplete] = useState(false); // Whether checkout completed
  const [orderDetails, setOrderDetails] = useState(null); // Stores order info after checkout
  const [isBuyNow, setIsBuyNow] = useState(false); // Flag for "Buy Now" flow
  const [buyNowOrder, setBuyNowOrder] = useState(null); // Stores single buyNow order

  // Controlled form data
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "",
    cardNumber: "", cardName: "", expiryDate: "", cvv: ""
  });

  const [errors, setErrors] = useState({}); // Field-specific validation errors
  const [paymentMethod, setPaymentMethod] = useState("payNow"); // Default payment method

  // ----- Initial Load -----
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const buyNow = searchParams.get("buyNow");

    if (orderId && buyNow === "true") {
      setIsBuyNow(true); // Enable buyNow mode
      loadBuyNowOrder(orderId); // Load a single order
    } else {
      loadCart(); // Load full cart
    }
  }, [userId, searchParams]);

  // ----- Fetch "Buy Now" order -----
  const loadBuyNowOrder = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const order = await res.json();

      // Set order details and simulate cart for UI
      setBuyNowOrder(order);
      setCart({
        items: order.items.map(i => ({
          product: i.product,
          qty: i.qty,
          priceAtAdd: i.price
        })),
        total: order.total,
        subtotal: order.total,
      });
    } catch {
      alert("Error loading order");
      navigate("/"); // Redirect home if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // ----- Fetch Cart -----
  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/cart/${userId || "default"}`);
      if (!res.ok) throw new Error("Cart not found");
      const cartData = await res.json();

      // Calculate total including offer items
      const productSubtotal = cartData.items ? cartData.items.reduce((sum, item) => sum + (item.priceAtAdd || item.product.price) * item.qty, 0) : 0;
      const offerSubtotal = cartData.offerItems ? cartData.offerItems.reduce((sum, item) => sum + (item.discountedPrice || item.offer.discountedPrice) * item.qty, 0) : 0;
      const total = productSubtotal + offerSubtotal;

      setCart({ ...cartData, total, subtotal: total });
    } catch {
      navigate("/cart"); // Redirect if cart not found
    } finally {
      setLoading(false);
    }
  };

  // ----- Handle Input Change -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextVal = value;

    // Sanitize phone input
    if (name === 'phone') {
      let sanitized = sanitizePhone(value);
      if (sanitized.startsWith('+')) {
        sanitized = sanitized.replace(/^(\+\d{0,11}).*/, '$1');
      } else {
        sanitized = sanitized.replace(/^(\d{0,10}).*/, '$1');
      }
      nextVal = sanitized;
    }

    // Update form data
    setFormData(prev => ({ ...prev, [name]: nextVal }));

    // Clear any existing error for the field
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // ----- Validate Form -----
  const validateForm = () => {
    const newErrors = {};

    // Shipping info validation
    try { validateName(formData.firstName); } catch (e) { newErrors.firstName = e.message; }
    try { validateName(formData.lastName); } catch (e) { newErrors.lastName = e.message; }
    try { validateEmail(formData.email); } catch (e) { newErrors.email = e.message; }
    try { validatePhone(formData.phone); } catch (e) { newErrors.phone = e.message; }
    try { validateAddress(formData.address); } catch (e) { newErrors.address = e.message; }
    if (!formData.city || formData.city.trim().length < 2) newErrors.city = 'City must be at least 2 characters long';
    try { validatePostalCode(formData.postalCode); } catch (e) { newErrors.postalCode = e.message; }

    // Payment info validation if paying now
    if (paymentMethod === 'payNow') {
      try { validateCardNumber(formData.cardNumber); } catch (e) { newErrors.cardNumber = e.message; }
      try { validateName(formData.cardName); } catch (e) { newErrors.cardName = e.message; }
      try { validateCardExpiry(formData.expiryDate); } catch (e) { newErrors.expiryDate = e.message; }
      try { validateCVV(formData.cvv); } catch (e) { newErrors.cvv = e.message; }
    }

    // If errors exist, show them and focus first invalid field
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstInvalid = Object.keys(newErrors)[0];
      const el = document.querySelector(`[name="${firstInvalid}"]`);
      if (el && typeof el.focus === 'function') el.focus();
      return false;
    }

    // Clear errors if form is valid
    setErrors({});
    return true;
  };

  // ----- Handle Checkout -----
  const handleCheckout = async () => {
    if (!validateForm()) return; // Stop if form invalid
    setProcessing(true);

    try {
      // Simulate payment processing delay
      if (paymentMethod === "payNow") await new Promise(r => setTimeout(r, 2000));

      if (isBuyNow && buyNowOrder) {
        // Update existing buyNow order
        const res = await fetch(`http://localhost:5000/api/orders/${buyNowOrder._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shippingAddress: formData,
            paymentMethod: paymentMethod === "payNow" ? "Credit Card" : "Pay at Delivery",
            status: paymentMethod === "payNow" ? "paid" : "pending",
          }),
        });
        if (!res.ok) throw new Error("Failed to update order");
        setOrderDetails(await res.json());
      } else {
        // Create new order from cart
        const productItems = cart.items ? cart.items.map(i => ({
          product: i.product._id,
          qty: i.qty,
          price: i.priceAtAdd || i.product.price,
          itemType: 'product'
        })) : [];
        const offerItems = cart.offerItems ? cart.offerItems.map(i => ({
          offer: i.offer._id,
          qty: i.qty,
          price: i.discountedPrice || i.offer.discountedPrice,
          itemType: 'offer',
          originalPrice: i.originalPrice || i.offer.products.reduce((sum, product) => sum + product.price, 0)
        })) : [];
        const allItems = [...productItems, ...offerItems];

        const orderData = {
          items: allItems,
          total: cart.total,
          shippingAddress: { ...formData },
          paymentMethod: paymentMethod === "payNow" ? "Credit Card" : "Pay at Delivery",
          status: paymentMethod === "payNow" ? "paid" : "pending"
        };

        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify(orderData),
        });
        if (!res.ok) throw new Error('Failed to create order');
        const newOrder = await res.json();
        setOrderDetails(newOrder);

        // Clear cart after successful checkout
        await fetch(`http://localhost:5000/api/cart/${userId || "default"}`, { method: "DELETE" });
        window.dispatchEvent(new Event("cartUpdated"));
      }

      setOrderComplete(true);
    } catch (err) {
      alert("Checkout failed: " + err.message);
      console.error("Checkout error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // ----- Loading or Empty Cart -----
  if (loading) return <p className="text-center p-10">Loading checkout...</p>;
  if (!cart?.items?.length && !cart?.offerItems?.length) return navigate("/cart");

  // ----- Order Completed UI -----
  if (orderComplete && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-lg text-center mt-10">
          <FaCheckCircle className="mx-auto text-green-600" size={70} />
          <h1 className="text-3xl font-bold mt-4 text-gray-800">
            {orderDetails.status === "paid" ? "🎉 Order Successful!" : "✅ Order Placed!"}
          </h1>
          <p className="text-gray-600 mt-2 mb-6">
            {orderDetails.status === "paid"
              ? "Thank you for your purchase. Your payment has been received."
              : "Your order is confirmed. Please pay at delivery."}
          </p>
          <div className="bg-gray-100 p-4 rounded-xl text-left">
            <p><b>Order ID:</b> {orderDetails._id}</p>
            <p><b>Total:</b> LKR {orderDetails.total.toLocaleString()}</p>
            <p><b>Payment:</b> {orderDetails.paymentMethod}</p>
            <p><b>Status:</b> {orderDetails.status}</p>
            <p><b>Items:</b> {orderDetails.items.length} total items</p>
          </div>
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
      </div>
    );
  }

  // ----- Checkout Form UI -----
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 p-6">
        {/* Shipping + Payment Form */}
        <div className="space-y-8">
          {/* Shipping Info */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-semibold text-xl mb-4 border-b pb-2">📦 Shipping Information</h2>
            {['firstName','lastName','email','phone','address','city','postalCode'].map(f => {
              const isPhone = f === 'phone';
              const isPostal = f === 'postalCode';
              return (
                <div key={f} className="mb-3">
                  <input
                    name={f}
                    value={formData[f]}
                    onChange={(e)=>{
                      if(isPostal){
                        const val = sanitizePostalCodeInput(e.target.value);
                        setFormData(prev=>({...prev, postalCode: val}));
                      }else{ handleChange(e); }
                    }}
                    onKeyDown={isPhone ? allowPhoneKey : isPostal ? (e)=>allowPostalCodeKey(e) : undefined}
                    onPaste={isPhone ? (e)=>handlePhonePaste(e, (val)=> setFormData(prev=>({...prev, phone: sanitizePhone(val)}))) : isPostal ? (e)=>handlePostalCodePaste(e, (val)=> setFormData(prev=>({...prev, postalCode: sanitizePostalCodeInput(val)}))) : undefined}
                    inputMode={isPhone ? 'tel' : isPostal ? 'numeric' : undefined}
                    maxLength={isPhone ? (formData.phone.startsWith('+') ? 13 : 11) : undefined}
                    title={isPhone ? 'Up to 11 digits, or + followed by up to 12 digits.' : undefined}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1')}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
                    required
                  />
                  {errors[f] && <p className="text-sm text-red-600 mt-1">{errors[f]}</p>}
                </div>
              );
            })}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-semibold text-xl mb-4 border-b pb-2">💳 Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="radio" value="payNow" checked={paymentMethod==="payNow"} onChange={e=>setPaymentMethod(e.target.value)} />
                <FaCreditCard /> Pay Now
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="payAtDelivery" checked={paymentMethod==="payAtDelivery"} onChange={e=>setPaymentMethod(e.target.value)} />
                🚚 Pay at Delivery
              </label>
            </div>

            {/* Card Info if paying now */}
            {paymentMethod==="payNow" && (
              <div className="mt-4 space-y-3">
                {/* Card Number */}
                <div>
                  <input
                    name="cardNumber"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={(e)=> setFormData(prev=>({...prev, cardNumber: sanitizeCardNumber(e.target.value)}))}
                    onKeyDown={allowCardNumberKey}
                    onPaste={(e)=>handleCardNumberPaste(e, (val)=> setFormData(prev=>({...prev, cardNumber: sanitizeCardNumber(val)})))}
                    inputMode="numeric"
                    maxLength={16}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                  {errors.cardNumber && <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>}
                </div>
                {/* Card Name */}
                <div>
                  <input name="cardName" placeholder="Cardholder Name" value={formData.cardName} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                  {errors.cardName && <p className="text-sm text-red-600 mt-1">{errors.cardName}</p>}
                </div>
                {/* Expiry + CVV */}
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <input
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e)=> setFormData(prev=>({...prev, expiryDate: sanitizeExpiry(e.target.value)}))}
                      onKeyDown={allowExpiryKey}
                      onPaste={(e)=>handleExpiryPaste(e, (val)=> setFormData(prev=>({...prev, expiryDate: sanitizeExpiry(val)})))}
                      inputMode="numeric"
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                    {errors.expiryDate && <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div className="w-1/2">
                    <input
                      name="cvv"
                      placeholder="CVV"
                      value={formData.cvv || ''}
                      onChange={(e)=> setFormData(prev=>({...prev, cvv: sanitizeCVVInput(e.target.value)}))}
                      onKeyDown={allowCVVKey}
                      onPaste={(e)=>handleCVVPaste(e, (val)=> setFormData(prev=>({...prev, cvv: sanitizeCVVInput(val)})))}
                      inputMode="numeric"
                      maxLength={4}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                    {errors.cvv && <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>}
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex items-center"><FaLock className="mr-2"/> Secure Payment</p>
              </div>
            )}
          </div>
        </div>

        {/* ----- Order Summary ----- */}
        <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
          <h2 className="font-semibold text-xl mb-4 border-b pb-2">🧾 Order Summary</h2>
          <div className="space-y-3">
            {/* Product Items */}
            {cart.items && cart.items.map((i, idx) => (
              <div key={`product-${idx}`} className="flex justify-between text-gray-700">
                <span>{i.product.name} <span className="text-sm text-gray-500">x{i.qty}</span></span>
                <span className="font-medium">LKR {(i.qty * (i.priceAtAdd || i.product.price)).toLocaleString()}</span>
              </div>
            ))}

            {/* Offer Items */}
            {cart.offerItems && cart.offerItems.map((i, idx) => {
              const discountedPrice = i.discountedPrice || i.offer.discountedPrice;
              const originalPrice = i.originalPrice || i.offer.products.reduce((sum, p) => sum + p.price, 0);
              return (
                <div key={`offer-${idx}`} className="flex justify-between text-gray-700">
                  <span>
                    {i.offer.name} (Bundle) 
                    <span className="text-sm text-gray-500"> x{i.qty}</span>
                    <div className="text-xs text-green-600">
                      Save LKR {(originalPrice - discountedPrice).toLocaleString()}
                    </div>
                  </span>
                  <span className="font-medium">LKR {(i.qty * discountedPrice).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <hr className="my-4"/>
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>LKR {cart.total.toLocaleString()}</span>
          </div>

          {/* Checkout Button */}
          <button onClick={handleCheckout} disabled={processing}
            className="w-full mt-6 p-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90"
            style={{ background: COLORS.DEEP_CINNAMON }}>
            {processing ? "Processing..." :
              paymentMethod==="payNow"
              ? `Pay LKR ${cart.total.toLocaleString()} Now`
              : `Place Order - Pay at Delivery`}
          </button>

          <button onClick={()=>navigate(isBuyNow?"/":"/cart")}
            className="mt-4 text-gray-600 text-sm hover:underline">← Back</button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
