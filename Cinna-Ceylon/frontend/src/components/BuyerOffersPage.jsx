import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAfterLogin from "./HeaderAfterLogin";
import Footer from "./Footer";

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

// Stock status badge
const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Out of Stock</span>;
  if (stock <= 5) return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">Low Stock</span>;
  return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">In Stock</span>;
};

// Countdown timer component
const Countdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(endDate).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return <span className="text-white bg-black/70 px-2 py-1 rounded-full text-xs">{timeLeft}</span>;
};

export default function BuyerOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/offers");
      if (!res.ok) throw new Error("Failed to fetch offers");
      const data = await res.json();

      // Fetch stock info per offer
      const offersWithStock = await Promise.all(data.map(async (offer) => {
        try {
          const productRes = await fetch(`http://localhost:5000/api/products/${offer.productId}`);
          const product = productRes.ok ? await productRes.json() : { availableStock: 0 };
          return { ...offer, availableStock: product.availableStock || 0 };
        } catch {
          return { ...offer, availableStock: 0 };
        }
      }));

      setOffers(offersWithStock);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center mt-20">Loading offers...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin />
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-center mb-6" style={{ color: COLORS.DARK_SLATE }}>
          Exclusive Cinnamon Offers
        </h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          Grab our limited-time cinnamon bundles with special discounts. Hurry, some offers may expire soon!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.length === 0 && (
            <p className="text-center col-span-full text-gray-600">No offers available at the moment.</p>
          )}

          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="relative">
                <img
                  src={`http://localhost:5000/uploads/${offer.image}`}
                  alt={offer.name}
                  className="w-full h-56 object-cover rounded-t-2xl"
                  onError={(e) => e.target.src = "https://via.placeholder.com/400x300/f5efe6/cc7722?text=No+Image"}
                />
                <div className="absolute top-2 left-2">
                  <Countdown endDate={offer.endDate} />
                </div>
                <div className="absolute top-2 right-2">
                  <StockBadge stock={offer.availableStock} />
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{offer.name}</h2>
                <p className="text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
                    LKR {offer.price?.toLocaleString() || "0"}
                  </span>
                  {offer.grade && <span className="text-sm text-gray-500">{offer.grade}</span>}
                </div>
                <Link
                  to={`/products/${offer.productId}`}
                  className="block text-center py-2 px-4 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: COLORS.RICH_GOLD }}
                >
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
