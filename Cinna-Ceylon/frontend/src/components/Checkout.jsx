import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import HeaderAfterLogin from "./HeaderAfterLogin.jsx";
import Footer from "./Footer.jsx";
import { FaLock, FaCheckCircle } from "react-icons/fa";

const COLORS = { DEEP_CINNAMON: "#CC7722", DARK_SLATE: "#2d2d2d" };

const Checkout = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("payNow");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "",
    cardNumber: "", cardName: "", expiryDate: "", cvv: ""
  });

  const orderId = searchParams.get("orderId");
  const isBuyNow = searchParams.get("buyNow") === "true";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = isBuyNow ? `/api/orders/${orderId}` : `/api/cart/${userId || "default"}`;
        const res = await fetch(`http://localhost:5000${url}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setCart(isBuyNow ? { items: data.items, total: data.total } : data);
      } catch {
        navigate(isBuyNow ? "/" : "/cart");
      } finally { setLoading(false); }
    })();
  }, [userId, orderId, isBuyNow]);

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const required = ["firstName","lastName","email","phone","address","city","postalCode"];
    if (required.some(f => !formData[f])) return alert("Fill all fields");
    if (!validEmail.test(formData.email)) return alert("Invalid email");
    if (paymentMethod === "payNow" && (formData.cardNumber.length < 16 || formData.cvv.length < 3))
      return alert("Invalid card details");
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setProcessing(true);
    try {
      if (paymentMethod === "payNow") await new Promise(r => setTimeout(r, 1000));
      const data = {
        items: cart.items.map(i => ({ product: i.product._id || i.product, qty: i.qty, price: i.priceAtAdd || i.price })),
        total: cart.total,
        shippingAddress: formData,
        paymentMethod: paymentMethod === "payNow" ? "Credit Card" : "Pay at Delivery",
        status: paymentMethod === "payNow" ? "paid" : "pending"
      };
      const url = isBuyNow ? `/api/orders/${orderId}` : "/api/orders";
      const method = isBuyNow ? "PUT" : "POST";
      const res = await fetch(`http://localhost:5000${url}`, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Order failed");
      const newOrder = await res.json();
      setOrder(newOrder);
      if (!isBuyNow) await fetch(`http://localhost:5000/api/cart/${userId || "default"}`, { method: "DELETE" });
    } catch (err) { alert(err.message); }
    finally { setProcessing(false); }
  };

  if (loading) return <Screen><p>Loading checkout...</p></Screen>;
  if (!cart?.items?.length) return navigate("/cart");
  if (order) return <Success order={order} navigate={navigate} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin />
      <div className="container mx-auto px-8 max-w-6xl grid lg:grid-cols-2 gap-8">
        <Form formData={formData} onChange={handleInput} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        <Summary cart={cart} placeOrder={placeOrder} processing={processing} paymentMethod={paymentMethod} isBuyNow={isBuyNow} navigate={navigate} />
      </div>
      <Footer />
    </div>
  );
};

const Screen = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-100">
    <HeaderAfterLogin />
    <div className="flex flex-1 justify-center items-center">{children}</div>
    <Footer />
  </div>
);

const Success = ({ order, navigate }) => (
  <Screen>
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
      <FaCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
        {order.status === "paid" ? "Order Successful!" : "Order Placed!"}
      </h1>
      <p className="mb-6 text-gray-600">{order.status === "paid" ? "Thank you for your purchase" : "Pay at delivery."}</p>
      <p><b>Order ID:</b> {order._id}</p>
      <p><b>Total:</b> LKR {order.total}</p>
      <p><b>Status:</b> {order.status}</p>
      <button onClick={() => navigate("/")} className="mt-6 w-full py-3 rounded-lg text-white" style={{ backgroundColor: COLORS.DEEP_CINNAMON }}>Continue Shopping</button>
    </div>
  </Screen>
);

const Form = ({ formData, onChange, paymentMethod, setPaymentMethod }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
    <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>Shipping Info</h2>
    {Object.entries({ firstName:"First Name", lastName:"Last Name", email:"Email", phone:"Phone", address:"Address", city:"City", postalCode:"Postal Code" }).map(([name, label]) => (
      <input key={name} placeholder={label} name={name} value={formData[name]} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
    ))}

    <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>Payment</h2>
    {[{ value: "payNow", label: "Pay Now (Credit Card)" }, { value: "payAtDelivery", label: "Pay at Delivery" }].map(opt => (
      <label key={opt.value} className="flex items-center space-x-2">
        <input type="radio" name="paymentMethod" value={opt.value} checked={paymentMethod === opt.value} onChange={e => setPaymentMethod(e.target.value)} />
        <span>{opt.label}</span>
      </label>
    ))}

    {paymentMethod === "payNow" && (
      <div className="space-y-3">
        {["cardNumber","cardName","expiryDate","cvv"].map(f => (
          <input key={f} placeholder={f} name={f} value={formData[f]} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        ))}
        <div className="flex items-center text-sm text-gray-600"><FaLock className="mr-2" /> Your info is secure</div>
      </div>
    )}
  </div>
);

const Summary = ({ cart, placeOrder, processing, paymentMethod, isBuyNow, navigate }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 sticky top-8">
    <h2 className="text-xl font-semibold">Order Summary</h2>
    {cart.items.map((i, idx) => (
      <div key={idx} className="flex justify-between"><span>{i.product.name} x {i.qty}</span><span>LKR {i.qty * (i.priceAtAdd || i.price)}</span></div>
    ))}
    <div className="font-bold">Total: LKR {cart.total}</div>
    <button onClick={placeOrder} disabled={processing} className="w-full py-3 rounded-lg text-white" style={{ backgroundColor: COLORS.DEEP_CINNAMON }}>
      {processing ? "Processing..." : paymentMethod === "payNow" ? `Pay LKR ${cart.total}` : `Place Order - LKR ${cart.total}`}
    </button>
    <button onClick={() => navigate(isBuyNow ? "/" : "/cart")} className="text-sm text-gray-600">← Back</button>
  </div>
);

export default Checkout;
