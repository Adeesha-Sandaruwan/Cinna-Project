import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const COLORS = { 
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Using environment variable for API URL
        const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
        const res = await fetch(`${baseUrl}/api/products`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched products:", data); // Debug log

        // Filter out private products unless user is admin
        const isAdmin = false; // TODO: Replace with actual admin check
        const filteredProducts = isAdmin
          ? data
          : data.filter((product) => product.visibility === "public");

        setProducts(filteredProducts);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError(`Error loading products: ${err.message}`);
        console.log(
          "Backend URL:",
          process.env.REACT_APP_API_URL || "http://localhost:5001"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      
      <div className="p-10">
        <h1
          className="text-3xl font-bold text-center mb-8"
          style={{ color: COLORS.DARK_SLATE }}
        >
          🌿 Our Products
        </h1>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              {/* Image container (keeps square ratio) */}
              <div className="w-full aspect-square bg-white flex items-center justify-center">
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    console.error(`Failed to load image: ${product.image}`);
                    e.target.src =
                      "https://via.placeholder.com/400x400/f5efe6/cc7722?text=Cinnamon+Product";
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">
                  {product.name}
                </h2>
                <p
                  className="text-md font-bold mb-4 text-center"
                  style={{ color: COLORS.DEEP_CINNAMON }}
                >
                  LKR {product.price.toLocaleString()}
                </p>

                {/* Button */}
                <div className="mt-auto">
                  <Link
                    to={`/products/${product._id}`}
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

        {loading && (
          <p className="text-center mt-6 text-gray-500">Loading products...</p>
        )}

        {error && <p className="text-center mt-6 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default ProductList;
