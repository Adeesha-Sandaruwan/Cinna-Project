import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import HeaderAfterLogin from './HeaderAfterLogin.jsx';
import Footer from './Footer.jsx';
import { FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
import { generateReceiptPDF } from './ReceiptPDF';

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  DARK_SLATE: "#2d2d2d",
};

const Checkout = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowOrder, setBuyNowOrder] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "",
    cardNumber: "", cardName: "", expiryDate: "", cvv: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("payNow");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const buyNow = searchParams.get("buyNow");

    if (orderId && buyNow === "true") {
      setIsBuyNow(true);
      loadBuyNowOrder(orderId);
    } else {
      loadCart();
    }
  }, [userId, searchParams]);

  const loadBuyNowOrder = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const order = await res.json();

      setBuyNowOrder(order);
      setCart({
        items: order.items.map(i => ({ product: i.product, qty: i.qty, priceAtAdd: i.price })),
        total: order.total,
        subtotal: order.total,
      });
    } catch {
      alert("Error loading order");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/cart/${userId || "default"}`);
      if (!res.ok) throw new Error("Cart not found");
      const cartData = await res.json();
      
      // Calculate total with discounts
      const productSubtotal = cartData.items ? cartData.items.reduce((sum, item) => sum + (item.priceAtAdd || item.product.price) * item.qty, 0) : 0;
      const offerSubtotal = cartData.offerItems ? cartData.offerItems.reduce((sum, item) => sum + (item.discountedPrice || item.offer.discountedPrice) * item.qty, 0) : 0;
      const total = productSubtotal + offerSubtotal;
      
      setCart({
        ...cartData,
        total: total,
        subtotal: total
      });
    } catch {
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode"];
    for (let f of required) if (!formData[f]) return alert(`Please enter ${f}`), false;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return alert("Invalid email"), false;

    if (paymentMethod === "payNow") {
      if (formData.cardNumber.length < 16) return alert("Invalid card number"), false;
      if (formData.cvv.length < 3) return alert("Invalid CVV"), false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    setProcessing(true);

    try {
      if (paymentMethod === "payNow") await new Promise(r => setTimeout(r, 2000));

      if (isBuyNow && buyNowOrder) {
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
        // Prepare items for order - both products and offers
        const productItems = cart.items ? cart.items.map(i => ({
          product: i.product._id,
          qty: i.qty,
          price: i.priceAtAdd || i.product.price,
          type: 'product'
        })) : [];
        
        const offerItems = cart.offerItems ? cart.offerItems.map(i => ({
          product: i.offer._id,
          qty: i.qty,
          price: i.discountedPrice || i.offer.discountedPrice,
          type: 'offer',
          originalPrice: i.originalPrice || i.offer.products.reduce((sum, product) => sum + product.price, 0)
        })) : [];
        
        const allItems = [...productItems, ...offerItems];
        
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userId || "default",
            items: allItems,
            total: cart.total,
            shippingAddress: formData,
            paymentMethod: paymentMethod === "payNow" ? "Credit Card" : "Pay at Delivery",
          }),
        });
        
        if (!res.ok) throw new Error("Failed to create order");
        const newOrder = await res.json();
        setOrderDetails(newOrder);

        // Clear the cart after placing order
        await fetch(`http://localhost:5000/api/cart/${userId || "default"}`, { method: "DELETE" });
        window.dispatchEvent(new Event("cartUpdated"));
      }
      
      setOrderComplete(true);
    } catch (err) {
      alert("Checkout failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p className="text-center p-10">Loading checkout...</p>;
  if (!cart?.items?.length && !cart?.offerItems?.length) return navigate("/cart");

  if (orderComplete && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderAfterLogin />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderAfterLogin />
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 p-6">
        
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-semibold text-xl mb-4 border-b pb-2">📦 Shipping Information</h2>
            {["firstName","lastName","email","phone","address","city","postalCode"].map(f => (
              <input key={f} name={f} value={formData[f]} onChange={handleChange}
                placeholder={f.charAt(0).toUpperCase()+f.slice(1)} 
                className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-orange-400" />
            ))}
          </div>

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

            {paymentMethod==="payNow" && (
              <div className="mt-4 space-y-3">
                <input name="cardNumber" placeholder="Card Number" maxLength="16" value={formData.cardNumber} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                <input name="cardName" placeholder="Cardholder Name" value={formData.cardName} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                <div className="flex gap-3">
                  <input name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleChange} className="w-1/2 p-3 border rounded-lg" />
                  <input name="cvv" placeholder="CVV" maxLength="4" value={formData.cvv} onChange={handleChange} className="w-1/2 p-3 border rounded-lg" />
                </div>
                <p className="text-sm text-gray-600 flex items-center"><FaLock className="mr-2"/> Secure Payment</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
          <h2 className="font-semibold text-xl mb-4 border-b pb-2">🧾 Order Summary</h2>
          <div className="space-y-3">
            {cart.items && cart.items.map((i, idx) => (
              <div key={`product-${idx}`} className="flex justify-between text-gray-700">
                <span>{i.product.name} <span className="text-sm text-gray-500">x{i.qty}</span></span>
                <span className="font-medium">LKR {(i.qty * (i.priceAtAdd || i.product.price)).toLocaleString()}</span>
              </div>
            ))}
            
            {cart.offerItems && cart.offerItems.map((i, idx) => {
              const discountedPrice = i.discountedPrice || i.offer.discountedPrice;
              return (
                <div key={`offer-${idx}`} className="flex justify-between text-gray-700">
                  <span>
                    {i.offer.name} (Bundle) 
                    <span className="text-sm text-gray-500"> x{i.qty}</span>
                    <div className="text-xs text-green-600">
                      Save LKR {((i.originalPrice || i.offer.products.reduce((sum, p) => sum + p.price, 0)) - discountedPrice).toLocaleString()}
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
      <Footer />
    </div>
  );
};

export default Checkout;