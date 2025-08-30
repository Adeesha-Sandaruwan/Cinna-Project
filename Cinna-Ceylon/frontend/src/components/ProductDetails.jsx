import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState({ rating: 4.8, count: 156, sold: 500 });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        console.log('Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Product data received:', data);
          setProduct(data);
        } else {
          console.error('Failed to fetch product, status:', res.status);
          setError('Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error fetching product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Only depend on id, not product

  // Fetch related products after the main product is loaded
  useEffect(() => {
    if (product) {
      const fetchRelatedProducts = async () => {
        try {
          setRelatedLoading(true);
          const res = await fetch(`http://localhost:5000/api/products`);
          if (res.ok) {
            const allProducts = await res.json();
            
            // Filter related products (same type or grade, excluding current product)
            const related = allProducts
              .filter(p => p._id !== id && (p.type === product.type || p.grade === product.grade))
              .slice(0, 3); // Get only 3 related products
            
            setRelatedProducts(related);
          }
        } catch (err) {
          console.error("❌ Failed to fetch related products:", err);
        } finally {
          setRelatedLoading(false);
        }
      };

      fetchRelatedProducts();
    }
  }, [product, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinnamon mx-auto mb-4"></div>
            <p className="text-lg">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.DARK_SLATE }}>
              Error Loading Product
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.DARK_SLATE }}>
              Product Not Found
            </h2>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Product Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left Side - Product Images */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                                     src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                  className="w-full h-96 lg:h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image: ${product.image}`);
                    e.target.src = 'https://via.placeholder.com/600x600/f5efe6/cc7722?text=Cinnamon+Product';
                  }}
                />
                {/* Product Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Premium Quality
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="lg:col-span-1 p-8">
              <div className="space-y-6">
                {/* Product Title */}
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                    {product.name}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < Math.floor(reviews.rating) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{reviews.rating} ({reviews.count} reviews)</span>
                    </div>
                    <span className="text-sm text-gray-500">• {reviews.sold}+ sold</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
                      LKR {product.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      LKR {(product.price * 1.2).toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      Save 20%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Free shipping over LKR 2,000 • Tax included
                  </p>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-semibold">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold capitalize">{product.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-semibold capitalize">{product.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 10 ? `${product.stock} available` : `Low stock (${product.stock})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-semibold">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(product.stock, value)));
                      }}
                      className="w-16 px-2 py-2 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-cinnamon focus:border-transparent"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max {product.stock} available
                  </span>
                </div>

                {/* Stock Warning */}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Only {product.stock} items left in stock!
                    </p>
                  </div>
                )}
                
                {product.stock === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">
                      ❌ This product is currently out of stock
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    className="flex-1 py-3 px-6 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: COLORS.DARK_SLATE }}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                    disabled={product.stock === 0}
                  >
                    Buy Now
                  </button>
                </div>

                {/* Policies */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-6 text-sm">
                    <a href="#" className="text-blue-600 hover:underline">Return & Refund Policy</a>
                    <a href="#" className="text-blue-600 hover:underline">Security & Privacy</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto mb-8">
            <div className="p-8">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold" style={{ color: COLORS.DARK_SLATE }}>
                  Product Description
                </h2>
                <p className="text-gray-600 mt-2">Learn more about this premium cinnamon product</p>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed space-y-4">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-base leading-7">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Features Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto mb-8">
          <div className="p-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.DARK_SLATE }}>
                Product Features
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Quality</h3>
                  <p className="text-sm text-gray-600">Handpicked and carefully selected for the best quality</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Fresh & Natural</h3>
                  <p className="text-sm text-gray-600">100% natural ingredients with no artificial additives</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Certified Organic</h3>
                  <p className="text-sm text-gray-600">Certified organic and sustainably sourced</p>
                </div>
              </div>
            </div>
          </div>
        </div>

                 {/* Customer Reviews Section */}
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto mb-8">
           <div className="p-8">
             <div className="border-b border-gray-200 pb-4 mb-6">
               <h2 className="text-2xl font-bold" style={{ color: COLORS.DARK_SLATE }}>
                 Customer Reviews
               </h2>
               <p className="text-gray-600 mt-2">What our customers say about this product</p>
             </div>
             
             <div className="text-center py-8">
               <div className="flex justify-center items-center mb-4">
                 <div className="flex text-yellow-400 text-2xl">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} className={`w-8 h-8 ${i < Math.floor(reviews.rating) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                       <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                     </svg>
                   ))}
                 </div>
               </div>
               <p className="text-2xl font-bold text-gray-900">{reviews.rating} out of 5</p>
               <p className="text-gray-600">Based on {reviews.count} reviews</p>
               <p className="text-sm text-gray-500 mt-2">{reviews.sold}+ customers have purchased this product</p>
             </div>
           </div>
         </div>

         {/* Related Products Section */}
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto">
           <div className="p-8">
             <div className="border-b border-gray-200 pb-4 mb-6">
               <h2 className="text-2xl font-bold" style={{ color: COLORS.DARK_SLATE }}>
                 Related Products
               </h2>
               <p className="text-gray-600 mt-2">You might also like these products</p>
             </div>
             
             {relatedLoading ? (
               <div className="flex justify-center items-center py-12">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cinnamon"></div>
                 <span className="ml-3 text-gray-600">Loading related products...</span>
               </div>
             ) : relatedProducts.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {relatedProducts.map((relatedProduct) => (
                   <div
                     key={relatedProduct._id}
                     className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                   >
                     <div className="relative">
                       <img
                         src={`http://localhost:5000/uploads/${relatedProduct.image}`}
                         alt={relatedProduct.name}
                         className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                         onError={(e) => {
                           console.error(`Failed to load image: ${relatedProduct.image}`);
                           e.target.src = 'https://via.placeholder.com/400x300/f5efe6/cc7722?text=Cinnamon+Product';
                         }}
                       />
                       {relatedProduct.stock <= 5 && relatedProduct.stock > 0 && (
                         <div className="absolute top-2 right-2">
                           <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                             Low Stock
                           </span>
                         </div>
                       )}
                       {relatedProduct.stock === 0 && (
                         <div className="absolute top-2 right-2">
                           <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                             Out of Stock
                           </span>
                         </div>
                       )}
                     </div>
                     
                     <div className="p-4">
                       <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-cinnamon transition-colors">
                         {relatedProduct.name}
                       </h3>
                       
                       <div className="flex items-center justify-between mb-3">
                         <span className="text-lg font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
                           LKR {relatedProduct.price.toLocaleString()}
                         </span>
                         <span className="text-sm text-gray-500 capitalize">
                           {relatedProduct.type}
                         </span>
                       </div>
                       
                       <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                         <span className="capitalize">Grade: {relatedProduct.grade}</span>
                         <span className={relatedProduct.stock > 10 ? 'text-green-600' : 'text-red-600'}>
                           {relatedProduct.stock > 10 ? `${relatedProduct.stock} in stock` : `Only ${relatedProduct.stock} left`}
                         </span>
                       </div>
                       
                       <a
                         href={`/products/${relatedProduct._id}`}
                         className="block w-full text-center py-2 px-4 rounded-lg font-semibold text-white transition-colors"
                         style={{ backgroundColor: COLORS.RICH_GOLD }}
                       >
                         View Product
                       </a>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-12">
                 <div className="text-gray-400 mb-4">
                   <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                   </svg>
                 </div>
                 <p className="text-gray-600">No related products found</p>
                 <p className="text-sm text-gray-500 mt-1">Check back later for more products</p>
               </div>
             )}
           </div>
         </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
