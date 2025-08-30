import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const COLORS = { 
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Header />
      <div className="p-10">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.DARK_SLATE }}>
          🌿 Our Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
                           <img
               src={`http://localhost:5000/uploads/${product.image}`}
               alt={product.name}
               className="h-48 w-full object-cover"
               onError={(e) => {
                 console.error(`Failed to load image: ${product.image}`);
                 e.target.src = 'https://via.placeholder.com/400x300/f5efe6/cc7722?text=Cinnamon+Product';
               }}
             />
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  {product.name}
                </h2>
                <p className="text-md font-bold mb-4" style={{ color: COLORS.DEEP_CINNAMON }}>
                  LKR {product.price.toLocaleString()}
                </p>
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
      </div>
      <Footer />
    </div>
  );
};

export default ProductList;
