import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BeakerIcon, GlobeAltIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Carousel from './Carousel';
import AnimatedSection from './AnimatedSection';
import Header from './Header';
import Footer from './Footer';

/* ----- Color tokens (kept simple and readable) ----- */
const COLORS = {
  RICH_GOLD: '#c5a35a',
  DEEP_CINNAMON: '#CC7722',
  WARM_BEIGE: '#F5EFE6',
  DARK_SLATE: '#2d2d2d',
  SOFT_WHITE: '#FCFBF8',
};

/* ----- Images and demo product data (you can replace later) ----- */
const carouselImages = [
  { src: 'https://images.unsplash.com/photo-1652209804572-91b24a2bbb97?auto=format&fit=crop&w=1400&q=80', alt: 'Cinnamon quills bundled' },
  { src: 'https://ideogram.ai/assets/image/lossless/response/jLe9QF0hRLuuZj_DTEXDlA', alt: 'Aromatic spices in bowls' },
  { src: 'https://ideogram.ai/assets/image/lossless/response/_oV9SELRTsG6t1ZTMd1uTQ', alt: 'Ground cinnamon powder' },
];

// Remove static featuredProducts - will be fetched from database

/* ---------------- Simple Carousel component ----------------
   - Easy to read, autoplay + manual controls
   - Pauses on hover
   - Simple CSS (Tailwind) so you can explain each class later.
*/

/* ------------------ Main HomePage ------------------ */
function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        // Get the first 4 products for featured section
        const featured = data.slice(0, 4);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to empty array if fetch fails
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="antialiased">
    

      <main className="text-gray-800">
        {/* ---------- HERO with Carousel ---------- */}
        <section className="relative h-[70vh] md:h-[80vh] w-full">
          <div className="absolute inset-0">
            <Carousel images={carouselImages} />
          </div>

          {/* Hero content */}
          <div className="relative z-10 flex h-full items-center">
            <div className="max-w-3xl px-6 md:px-8 w-full md:ml-12">
              <div className="max-w-3xl">
                <h1
                  className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.SOFT_WHITE }}
                >
                  CinnaCeylon — The Soul of Ceylon Spices
                </h1>
                <p className="mt-4 text-sm md:text-lg" style={{ color: COLORS.WARM_BEIGE }}>
                  At Cinna Ceylon, we responsibly source raw cinnamon from reputable family farmers in Sri Lanka and carefully
                  transform it into high-quality, value-added products.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/products"
                    className="inline-block px-6 py-3 rounded-full font-semibold shadow-lg transition transform hover:scale-[1.02]"
                    style={{ backgroundColor: COLORS.RICH_GOLD, color: '#111' }}
                  >
                    Explore Collection
                  </a>

                  <Link
                    to="/about"
                    className="inline-block px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
                  >
                    Our Story
                  </Link>
                </div>

                {/* quick trust badges */}
                <div className="mt-6 flex gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm" style={{ color: COLORS.SOFT_WHITE }}>
                    <SparklesIcon className="w-5 h-5" /> Authentic Ceylon
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm" style={{ color: COLORS.SOFT_WHITE }}>
                    <GlobeAltIcon className="w-5 h-5" /> Direct from farms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- About / Business details (detailed but simple) ---------- */}
        <AnimatedSection className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
            
              <p className="mt-4 text-gray-700 leading-relaxed">
              Cinna Ceylon is a supply chain management system designed to support Sri Lanka’s authentic Ceylon cinnamon
              </p>

              <ul className="mt-6 space-y-3 text-gray-700">
                <li>
                  <strong>Provenance:</strong>Single-origin traceability from smallholder farms in the central highlands — ensuring authenticity and transparency at every stage.
                </li>
                <li>
                  <strong>Processing:</strong> Digital tracking of cinnamon harvesting, peeling, and drying practices to maintain quality standards and preserve natural value.
                </li>
                <li>
                  <strong>Quality:</strong> Data-driven monitoring and batch verification to prevent cassia mixing, ensuring product integrity, aroma, and flavor.
                </li>
                <li>
                  <strong>Community:</strong> Empowering farmers through fair trade, transparent records, and tools that promote sustainable agricultural practices.
                </li>
              </ul>

              <Link
                to="/about"
                className="mt-6 inline-block px-6 py-3 rounded-full text-white font-medium"
                style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
              >
                Learn more about our process
              </Link>
            </div>

            {/* Visual + quick facts */}
            <div className="space-y-6">
              <img
                src="https://cinoceylon.wordpress.com/wp-content/uploads/2017/03/newly-planted-cinnamon.jpg"
                alt="Cinnamon plantation"
                className="rounded-lg shadow-xl w-full object-cover h-64"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <h4 className="text-sm font-semibold" style={{ color: COLORS.DEEP_CINNAMON }}>Small batch harvests</h4>
                  <p className="text-xs text-gray-600 mt-2">Hand-processed for consistency and aroma.</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <h4 className="text-sm font-semibold" style={{ color: COLORS.DEEP_CINNAMON }}>Certified partners</h4>
                  <p className="text-xs text-gray-600 mt-2">Working with local certifiers and quality auditors.</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- Why choose us (features) ---------- */}
        <AnimatedSection className="py-12" >
          <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
            <h3 className="text-xl font-semibold" style={{ color: COLORS.RICH_GOLD }}>Why choose CinnaCeylon?</h3>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-lg shadow text-left">
                <GlobeAltIcon className="w-6 h-6" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h4 className="mt-3 font-semibold">Traceable Sourcing</h4>
                <p className="mt-2 text-sm text-gray-600">Know the farm & batch behind your spice.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow text-left">
                <SparklesIcon className="w-6 h-6" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h4 className="mt-3 font-semibold">Premium Flavor</h4>
                <p className="mt-2 text-sm text-gray-600">Delicate, floral notes unique to Ceylon cinnamon.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow text-left">
                <BeakerIcon className="w-6 h-6" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h4 className="mt-3 font-semibold">Quality Testing</h4>
                <p className="mt-2 text-sm text-gray-600">Batch testing for moisture and purity.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow text-left">
                <LockClosedIcon className="w-6 h-6" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h4 className="mt-3 font-semibold">Ethical Practices</h4>
                <p className="mt-2 text-sm text-gray-600">Fair prices, sustainable farming support.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- Featured Products ---------- */}
        <AnimatedSection className="py-16" >
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}>
                Elevated Flavor, Expertly Sourced
              </h2>
              <p className="mt-3 text-gray-600">A small selection of our best sellers — selected for aroma, flavor and consistency.</p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded mt-4"></div>
                    </div>
                  </div>
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                    <img 
                      src={`http://localhost:5000/uploads/${product.image}`} 
                      alt={product.name} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/f5efe6/cc7722?text=Cinnamon+Product';
                      }}
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800">{product.name}</h4>
                      <p className="mt-2 font-bold" style={{ color: COLORS.RICH_GOLD }}>
                        LKR {product.price?.toLocaleString()}
                      </p>
                      <Link
                        to={`/products/${product._id}`}
                        className="mt-4 w-full px-3 py-2 rounded-full text-white font-medium block text-center"
                        style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                // No products available
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No products available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- Newsletter (simple & clear) ---------- */}
        <section className="py-16 bg-gradient-to-r from-white to-white">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-2xl font-bold" style={{ color: COLORS.DARK_SLATE }}>Join the Spice Route</h3>
            <p className="mt-2 text-gray-600">Sign up for special offers, recipes and behind-the-scenes stories from our growers.</p>

            <form className="mt-6 flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-yellow-300 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full font-semibold"
                style={{ backgroundColor: COLORS.RICH_GOLD }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
