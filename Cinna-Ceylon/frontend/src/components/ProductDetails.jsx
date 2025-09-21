import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import HeaderAfterLogin from "./HeaderAfterLogin.jsx";
import Footer from "./Footer.jsx";

// Theme colors
const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [buyingNow, setBuyingNow] = useState(false);

  // Mock reviews data
  const reviews = { rating: 4.5, count: 24 };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      const res = await fetch("http://localhost:5000/api/products");
      if (res.ok) {
        const allProducts = await res.json();
        const related = allProducts
          .filter(
            (p) =>
              p._id !== id &&
              (p.type === product.type || p.grade === product.grade)
          )
          .slice(0, 3);
        setRelatedProducts(related);
      }
      setRelatedLoading(false);
    };
    fetchRelated();
  }, [product, id]);

  // Add to cart
  const addToCart = async () => {
    if (!product || product.availableStock === 0) return;

    setAddingToCart(true);
    setCartMessage("");

    const requestBody = {
      user: "default",
      productId: product._id,
      qty: quantity,
    };

    const response = await fetch("http://localhost:5000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      setCartMessage("✅ Added to cart successfully!");
      setTimeout(() => setCartMessage(""), 3000);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      const errorData = await response.json();
      setCartMessage(`❌ ${errorData.error || "Failed to add to cart"}`);
      setTimeout(() => setCartMessage(""), 3000);
    }

    setAddingToCart(false);
  };

  // Buy now
  const buyNow = async () => {
    if (!product || product.availableStock === 0) return;

    setBuyingNow(true);

    const orderData = {
      user: "default",
      items: [
        {
          product: product._id,
          qty: quantity,
          price: product.price,
          itemType: "product",
          name: product.name,
          type: product.type,
        },
      ],
      total: quantity * product.price,
      shippingAddress: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
      },
      paymentMethod: "Credit Card",
      status: "pending",
    };

    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const order = await response.json();
      navigate(`/checkout/default?orderId=${order._id}&buyNow=true`);
    } else {
      const errorData = await response.json();
      alert(`Failed to create order: ${errorData.error || "Unknown error"}`);
    }

    setBuyingNow(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-600">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin />

      <div className="container mx-auto px-4 py-8">
        {/* Product Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left - Image */}
            <div className="lg:col-span-1">
              <div className="relative flex items-center justify-center bg-white">
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/600x600/f5efe6/cc7722?text=Cinnamon+Product";
                  }}
                />
                {product.availableStock <= 5 && product.availableStock > 0 && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Low Stock
                  </span>
                )}
                {product.availableStock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Right - Details */}
            <div className="lg:col-span-1 p-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                {product.name}
              </h1>

              {/* Reviews */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(reviews.rating)
                          ? "fill-current"
                          : "fill-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {reviews.rating} ({reviews.count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold mb-4" style={{ color: COLORS.DEEP_CINNAMON }}>
                LKR {product.price.toLocaleString()}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-6">
                <p>SKU: <span className="font-semibold">{product.sku}</span></p>
                <p>Type: <span className="font-semibold capitalize">{product.type}</span></p>
                <p>Grade: <span className="font-semibold capitalize">{product.grade}</span></p>
                <p>
                  Available:{" "}
                  <span
                    className={`font-semibold ${
                      product.availableStock > 10
                        ? "text-green-600"
                        : product.availableStock > 0
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.availableStock > 0
                      ? `${product.availableStock} available`
                      : "Out of stock"}
                  </span>
                </p>
                <p>
                  Expiry Date:{" "}
                  <span className="font-semibold">
                    {new Date(product.expiryDate).toLocaleDateString()}
                  </span>
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-gray-600">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.availableStock || 0}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(
                        Math.max(1, Math.min(product.availableStock || 0, value))
                      );
                    }}
                    className="w-16 text-center border-x"
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(product.availableStock || 0, quantity + 1)
                      )
                    }
                    className="px-3 py-2"
                    disabled={quantity >= (product.availableStock || 0)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cart message */}
              {cartMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                    cartMessage.includes("✅")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {cartMessage}
                  {cartMessage.includes("✅") && (
                    <Link
                      to="/cart"
                      className="block mt-2 text-sm underline"
                      style={{ color: COLORS.DEEP_CINNAMON }}
                    >
                      View Cart →
                    </Link>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={product.availableStock === 0 || addingToCart}
                  className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-300"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={buyNow}
                  disabled={product.availableStock === 0 || buyingNow}
                  className="flex-1 py-3 px-6 rounded-lg text-white"
                  style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                >
                  {buyingNow ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8">
          <h2 className="text-2xl font-bold mb-6">Product Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
            <li>✅ Premium Quality</li>
            <li>✅ Fresh & Natural</li>
            <li>✅ Certified Organic</li>
          </ul>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          <div className="flex justify-center mb-2 text-yellow-400 text-2xl">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-8 h-8 ${
                  i < Math.floor(reviews.rating) ? "fill-current" : "fill-gray-300"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-xl font-bold">{reviews.rating} out of 5</p>
          <p className="text-gray-600">Based on {reviews.count} reviews</p>
        </div>

     {/* Related Products */}
<div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto p-8">
  <h2 className="text-2xl font-bold mb-6">Related Products</h2>
  {relatedLoading ? (
    <p className="text-center">Loading related products...</p>
  ) : relatedProducts.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {relatedProducts.map((relatedProduct) => (
        <div
          key={relatedProduct._id}
          className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition"
        >
          {/* Image container (keeps square ratio) */}
          <div className="w-full aspect-square bg-white flex items-center justify-center">
            <img
              src={`http://localhost:5000/uploads/${relatedProduct.image}`}
              alt={relatedProduct.name}
              className="max-h-full max-w-full object-contain p-4"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x400/f5efe6/cc7722?text=Cinnamon+Product";
              }}
            />
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">
              {relatedProduct.name}
            </h3>
            <p
              className="text-md font-bold mb-4 text-center"
              style={{ color: COLORS.DEEP_CINNAMON }}
            >
              LKR {relatedProduct.price.toLocaleString()}
            </p>

            {/* View Product Button */}
            <div className="mt-auto">
              <Link
                to={`/products/${relatedProduct._id}`}
                className="block text-center text-white py-2 rounded-lg hover:opacity-90 transition"
                style={{ backgroundColor: COLORS.RICH_GOLD }}
              >
                View Product
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-600">No related products found</p>
  )}
</div>


      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
