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

  // State variables
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [buyingNow, setBuyingNow] = useState(false);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setError("Failed to fetch product");
        }
      } catch {
        setError("Error fetching product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
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
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [product, id]);

  // Add to cart
  const addToCart = async () => {
    if (!product || product.availableStock === 0) return;
    try {
      setAddingToCart(true);
      setCartMessage("");
      const body = { user: "default", productId: product._id, qty: quantity };
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setCartMessage("✅ Added to cart successfully!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        const err = await res.json();
        setCartMessage(`❌ ${err.error || "Failed to add to cart"}`);
      }
    } catch {
      setCartMessage("❌ Network error - please try again");
    } finally {
      setAddingToCart(false);
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  // Buy now
  const buyNow = async () => {
    if (!product || product.availableStock === 0) return;
    try {
      setBuyingNow(true);
      const orderData = {
        user: "default",
        items: [{ product: product._id, qty: quantity, price: product.price }],
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
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const order = await res.json();
        navigate(`/checkout/default?orderId=${order._id}&buyNow=true`);
      } else {
        const err = await res.json();
        alert(`Failed to create order: ${err.error || "Unknown error"}`);
      }
    } catch {
      alert("Network error - please try again");
    } finally {
      setBuyingNow(false);
    }
  };

  // Loading / error / not found
  if (loading || error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="flex justify-center items-center min-h-screen">
          {loading && <p className="text-lg">Loading product details...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && <p className="text-gray-600">Product not found</p>}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin />

      <div className="container mx-auto px-4 py-8">
        {/* Product Info Section */}
        <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative flex justify-center items-center p-6 bg-gray-50 rounded-2xl">
            {product.availableStock === 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">
                Out of Stock
              </span>
            )}
            <img
              src={`http://localhost:5000/uploads/${product.image}`}
              alt={product.name}
              className="w-full max-h-[600px] object-contain rounded-2xl shadow-md transition-transform duration-300 hover:scale-105"
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/600x600/f5efe6/cc7722?text=Cinnamon+Product")
              }
            />
          </div>

          {/* Product Details */}
          <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold" style={{ color: COLORS.DARK_SLATE }}>
              {product.name}
            </h1>
            <p className="text-3xl font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
              LKR {product.price.toLocaleString()}
            </p>

            <div className="space-y-2 text-gray-700">
              <p>SKU: <b>{product.sku}</b></p>
              <p>Type: <b>{product.type}</b></p>
              <p>Grade: <b>{product.grade}</b></p>
              <p>
                Stock:{" "}
                <b
                  className={
                    product.availableStock > 10
                      ? "text-green-600"
                      : product.availableStock > 0
                      ? "text-orange-600"
                      : "text-red-600"
                  }
                >
                  {product.availableStock > 0
                    ? `${product.availableStock} available`
                    : "Out of stock"}
                </b>
              </p>
              <p>Expiry: {new Date(product.expiryDate).toLocaleDateString()}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || product.availableStock === 0}
                className="px-3 py-2 border rounded-lg"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.availableStock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={product.availableStock === 0}
                className="w-16 text-center border rounded-lg"
              />
              <button
                onClick={() =>
                  setQuantity(Math.min(product.availableStock, quantity + 1))
                }
                disabled={quantity >= product.availableStock || product.availableStock === 0}
                className="px-3 py-2 border rounded-lg"
              >
                +
              </button>
            </div>

            {/* Buttons */}
            {cartMessage && <p>{cartMessage}</p>}
            <div className="flex space-x-4">
              <button
                onClick={addToCart}
                disabled={addingToCart || product.availableStock === 0}
                className="flex-1 py-3 px-6 rounded-lg border font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={buyNow}
                disabled={buyingNow || product.availableStock === 0}
                className="flex-1 py-3 px-6 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
              >
                {buyingNow ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.DARK_SLATE }}>
              Product Description
            </h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Related Products */}
        <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.DARK_SLATE }}>
            Related Products
          </h2>
          {relatedLoading ? (
            <p>Loading related products...</p>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-lg shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Image container with square ratio */}
                  <div className="w-full aspect-square bg-white flex items-center justify-center">
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/400x400/f5efe6/cc7722?text=Cinnamon+Product")
                      }
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow text-center">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p style={{ color: COLORS.DEEP_CINNAMON }}>
                      LKR {item.price.toLocaleString()}
                    </p>
                    <Link
                      to={`/products/${item._id}`}
                      className="block mt-2 text-center py-2 rounded-lg text-white"
                      style={{ backgroundColor: COLORS.RICH_GOLD }}
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No related products found</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
