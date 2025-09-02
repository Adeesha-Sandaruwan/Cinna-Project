// Import React and useful hooks
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import HeaderAfterLogin from "./HeaderAfterLogin.jsx";
import Footer from "./Footer.jsx";
import { FaCreditCard, FaLock, FaCheckCircle } from "react-icons/fa";
// Define some custom colors we will use for buttons and highlights
const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  DARK_SLATE: "#2d2d2d",
};
// Main checkout component
const Checkout = () => {
  // Get userId from URL if available
  const { userId } = useParams();
  // Allows us to programmatically go to another page
  const navigate = useNavigate();
  // To read query parameters from the URL (example: ?orderId=123)
  const [searchParams] = useSearchParams();

  // === STATE VARIABLES ===
  const [cart, setCart] = useState(null);           // Store shopping cart details
  const [loading, setLoading] = useState(true);     // Show loading text until data is ready
  const [processing, setProcessing] = useState(false); // Show "processing..." during payment
  const [orderComplete, setOrderComplete] = useState(false); // True when order is successfully placed
  const [orderDetails, setOrderDetails] = useState(null);    // Store final order details for receipt
  const [isBuyNow, setIsBuyNow] = useState(false);   // Flag if this is a "Buy Now" order
  const [buyNowOrder, setBuyNowOrder] = useState(null); // Store that "Buy Now" order if it exists

  // Save customer details from form
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "",
    cardNumber: "", cardName: "", expiryDate: "", cvv: ""
  });

  // Which payment method the customer chose
  const [paymentMethod, setPaymentMethod] = useState("payNow"); // "payNow" or "payAtDelivery"

  //LOAD CART OR ORDER WHEN PAGE OPENS
  useEffect(() => {
    // Check if URL has orderId and "buyNow=true"
    const orderId = searchParams.get("orderId");
    const buyNow = searchParams.get("buyNow");

    if (orderId && buyNow === "true") {
      // If yes → this is a Buy Now flow
      setIsBuyNow(true);
      loadBuyNowOrder(orderId);
    } else {
      // Otherwise → normal cart checkout
      loadCart();
    }
  }, [userId, searchParams]);

  // FUNCTION: Load Buy Now order as a fake cart
  const loadBuyNowOrder = async (id) => {
    try {
      setLoading(true); // Show loading
      const res = await fetch(`http://localhost:5000/api/orders/${id}`); // Get order details from API
      if (!res.ok) throw new Error("Failed to fetch order"); // Error if fetch fails
      const order = await res.json(); // Convert response to JSON

      // Set the order into cart format so UI can display it
      setBuyNowOrder(order);
      setCart({
        items: order.items.map(i => ({ product: i.product, qty: i.qty, priceAtAdd: i.price })),
        total: order.total,
        subtotal: order.total,
      });
    } catch {
      alert("Error loading order"); // Show alert if error
      navigate("/"); // Send back to homepage
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // FUNCTION: Load normal cart
  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/cart/${userId || "default"}`); // Get cart from API
      if (!res.ok) throw new Error("Cart not found");
      setCart(await res.json()); // Save cart data
    } catch {
      navigate("/cart"); // If failed → go back to cart page
    } finally {
      setLoading(false);
    }
  };

  // FUNCTION: Handle input changes in form 
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  //FUNCTION: Validate form before checkout
  const validateForm = () => {
    // Required fields list
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode"];
    for (let f of required) if (!formData[f]) return alert(`Please enter ${f}`), false;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return alert("Invalid email"), false;

    // Extra checks if user is paying now with card
    if (paymentMethod === "payNow") {
      if (formData.cardNumber.length < 16) return alert("Invalid card number"), false;
      if (formData.cvv.length < 3) return alert("Invalid CVV"), false;
    }
    return true;
  };

  // FUNCTION: Handle checkout (place order) 
  const handleCheckout = async () => {
    if (!validateForm()) return; // Stop if form is invalid
    setProcessing(true); // Show processing

    try {
      // Fake wait time if user pays now (simulate payment process)
      if (paymentMethod === "payNow") await new Promise(r => setTimeout(r, 2000));

      // If it's Buy Now flow → update the existing order
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
        setOrderDetails(await res.json()); // Save updated order
      }

      // Otherwise - create a new order from the cart
      else {
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userId || "default",
            items: cart.items.map(i => ({ product: i.product._id, qty: i.qty, price: i.priceAtAdd })),
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
        window.dispatchEvent(new Event("cartUpdated")); // Update cart icon in header
      }
      // Mark order as complete so we can show success page
      setOrderComplete(true);
    } catch (err) {
      alert("Checkout failed: " + err.message);
    } finally {
      setProcessing(false); // Stop processing
    }
  };

  //UI
  if (loading) return <p className="text-center p-10">Loading checkout...</p>; // Show loading text
  if (!cart?.items?.length) return navigate("/cart"); // If cart empty → go back to cart

  //ORDER RECEIPT PAGE
  if (orderComplete && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderAfterLogin />
        <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-lg text-center mt-10">
          {/* Green success tick */}
          <FaCheckCircle className="mx-auto text-green-600" size={70} />
          <h1 className="text-3xl font-bold mt-4 text-gray-800">
            {orderDetails.status === "paid" ? "🎉 Order Successful!" : "✅ Order Placed!"}
          </h1>
          <p className="text-gray-600 mt-2 mb-6">
            {orderDetails.status === "paid"
              ? "Thank you for your purchase. Your payment has been received."
              : "Your order is confirmed. Please pay at delivery."}
          </p>
          {/* Small receipt box */}
          <div className="bg-gray-100 p-4 rounded-xl text-left">
            <p><b>Order ID:</b> {orderDetails._id}</p>
            <p><b>Total:</b> LKR {orderDetails.total}</p>
            <p><b>Payment:</b> {orderDetails.paymentMethod}</p>
            <p><b>Status:</b> {orderDetails.status}</p>
          </div>
          {/* Continue shopping button */}
          <button onClick={() => navigate("/")} className="mt-6 px-6 py-3 rounded-xl text-white font-semibold shadow-md" style={{ background: COLORS.DEEP_CINNAMON }}>
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // MAIN CHECKOUT SCREEN (FORM + SUMMARY)
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderAfterLogin />
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 p-6">
        
        {/* LEFT SIDE: SHIPPING FORM + PAYMENT METHOD */}
        <div className="space-y-8">
          
          {/* Shipping info box */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-semibold text-xl mb-4 border-b pb-2">📦 Shipping Information</h2>
            {["firstName","lastName","email","phone","address","city","postalCode"].map(f => (
              <input key={f} name={f} value={formData[f]} onChange={handleChange}
                placeholder={f.charAt(0).toUpperCase()+f.slice(1)} 
                className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-orange-400" />
            ))}
          </div>

          {/* Payment method box */}
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

            {/* Show card details if Pay Now selected */}
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

        {/* RIGHT SIDE: ORDER SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
          <h2 className="font-semibold text-xl mb-4 border-b pb-2">🧾 Order Summary</h2>
          <div className="space-y-3">
            {cart.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>{i.product.name} <span className="text-sm text-gray-500">x{i.qty}</span></span>
                <span className="font-medium">LKR {(i.qty*i.priceAtAdd).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <hr className="my-4"/>
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>LKR {cart.total}</span>
          </div>
          {/* Checkout button */}
          <button onClick={handleCheckout} disabled={processing}
            className="w-full mt-6 p-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90"
            style={{ background: COLORS.DEEP_CINNAMON }}>
            {processing ? "Processing..." :
              paymentMethod==="payNow"
              ? `Pay LKR ${cart.total} Now`
              : `Place Order - Pay at Delivery`}
          </button>
          {/* Back button */}
          <button onClick={()=>navigate(isBuyNow?"/":"/cart")}
            className="mt-4 text-gray-600 text-sm hover:underline">← Back</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Checkout;
