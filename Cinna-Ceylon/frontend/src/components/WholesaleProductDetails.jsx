import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Simple star rating renderer using Unicode stars
const StarRating = ({ rating = 0, reviewCount = 0 }) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.round(r);
  return (
    <div className="flex items-center gap-2">
      <div className="text-yellow-500 text-lg leading-none">{'★'.repeat(Math.min(5, full))}{'☆'.repeat(5 - Math.min(5, full))}</div>
      {reviewCount > 0 && (
        <span className="text-sm text-gray-600">{r.toFixed(1)} ({reviewCount} reviews)</span>
      )}
    </div>
  );
};

// Compact spec row (label on left, value close on right)
const SpecRow = ({ label, children, border = true }) => (
  <div className={`grid grid-cols-12 items-center py-2 ${border ? 'border-b border-gray-200' : ''}`}>
    <div className="col-span-5 md:col-span-4 text-gray-600 font-medium">{label}:</div>
    <div className="col-span-7 md:col-span-8 text-gray-900">{children}</div>
  </div>
);

const WholesaleProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
    fetchRelatedProducts();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/raw-materials/${id}`);
      if (response.ok) {
        const data = await response.json();
        let email = data.email;
        let whatsappNumber = data.whatsappNumber;
        let supplierName = data?.supplier?.name;
        let supplierObj = typeof data?.supplier === 'object' ? data.supplier : null;

        if (data?.supplier && typeof data.supplier === 'object') {
          email = email || data.supplier.email;
          whatsappNumber = whatsappNumber || data.supplier.whatsappNumber || data.supplier.contactNumber;
        }

        const supplierId = typeof data?.supplier === 'string'
          ? data.supplier
          : (data?.supplier?._id || data?.supplier?.id || data?.supplierId);

        if (supplierId) {
          try {
            const supRes = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`);
            let sup = null;
            if (supRes.ok) {
              const maybe = await supRes.json();
              sup = maybe?.supplier || maybe?.data || maybe;
            } else {
              const listRes = await fetch('http://localhost:5000/api/suppliers');
              if (listRes.ok) {
                const raw = await listRes.json();
                const list = Array.isArray(raw) ? raw : (raw.data || raw.suppliers || raw.results || []);
                sup = list.find(s => String(s._id || s.id) === String(supplierId)) || null;
              }
            }
            if (sup) {
              const resolvedName = sup.name || sup.fullName || sup.companyName || [sup.firstName, sup.lastName].filter(Boolean).join(' ');
              supplierName = supplierName || resolvedName;
              email = email || sup.email || sup.gmail;
              whatsappNumber = whatsappNumber || sup.whatsappNumber || sup.whatsapp || sup.contactNumber;
              const base = supplierObj && typeof supplierObj === 'object' ? supplierObj : {};
              supplierObj = {
                ...base,
                ...sup,
                _id: base._id || sup._id || supplierId,
                name: base.name || resolvedName,
                email: base.email || sup.email || sup.gmail,
                whatsappNumber: base.whatsappNumber || sup.whatsappNumber || sup.whatsapp,
                contactNumber: base.contactNumber || sup.contactNumber
              };
            }
          } catch (e) {
            console.warn('Could not enrich supplier contact:', e);
          }
        }

        setProduct({ ...data, email, whatsappNumber, supplierName, supplier: supplierObj || data.supplier });
      } else {
        console.error('Product not found');
        setProduct(null);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/raw-materials');
      if (response.ok) {
        const data = await response.json();
        const available = data.filter(
          p => p._id !== id && p.status === 'available' && p.visibility === 'public'
        );
        setRelatedProducts(available.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleEmailSupplier = () => {
    const email = product?.supplier?.email || product?.email;
    if (email) {
      const subject = `Inquiry about ${product.materialName || product.quality || 'cinnamon product'}`;
      const body = `Hello,\n\nI'm interested in your cinnamon product.\n\nPlease let me know the pricing and availability.\n\nThank you.`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    } else {
      alert('Email not available for this product or supplier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist or could not be loaded.</p>
          <button
            onClick={() => navigate('/wholesale')}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Derived display fields
  const typeLabel = (() => {
    const grade = product?.quality || product?.grade; // prioritize grade as Cinnamon Type
    if (grade) return grade;
    const t = product?.type;
    if (t && /raw\s*material/i.test(t)) return 'Cinnamon';
    return t || product?.materialName || product?.category || 'Cinnamon';
  })();
  const expiry = product?.expiryDate || product?.expireDate || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="relative h-96 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl overflow-hidden">
                {product.materialPhoto ? (
                  <img
                    src={`http://localhost:5000/uploads/${product.materialPhoto}`}
                    alt={product.materialName || product.quality || 'Cinnamon Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl text-amber-400">🌿</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.materialName || product.quality || 'Cinnamon Raw Material'}
                </h1>
                {/* Rating removed as requested */}
                <p className="text-4xl font-bold text-[#8B4513]">
                  LKR {Number(product.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1">
                <SpecRow label="Cinnamon Type">{typeLabel}</SpecRow>
                <SpecRow label="Grade">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {product.quality || 'A'}
                  </span>
                </SpecRow>
                {product.location && (
                  <SpecRow label="Location">{product.location}</SpecRow>
                )}
                <SpecRow label="Available">
                  <span className="text-green-600 font-semibold">{Number(product.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} available</span>
                </SpecRow>
                {product.harvestDate && (
                  <SpecRow label="Harvest Date">{new Date(product.harvestDate).toLocaleDateString()}</SpecRow>
                )}
                {expiry && (
                  <SpecRow label="Expiry Date">{new Date(expiry).toLocaleDateString()}</SpecRow>
                )}
                {product.moistureContent && (
                  <SpecRow label="Moisture Content">{product.moistureContent}%</SpecRow>
                )}
                {product.processingMethod && (
                  <SpecRow label="Processing Method">{product.processingMethod}</SpecRow>
                )}
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-3">Supplier Contact</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Contact:</span> +94 77 123 4567
                </p>
              </div>
            </div>
          </div>
          {product.description && (
            <div className="px-8 pb-8">
              <div className="bg-white rounded-xl border border-amber-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}
        </div>
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-100 cursor-pointer"
                  onClick={() => navigate(`/wholesale/product/${relatedProduct._id}`)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
                    {relatedProduct.materialPhoto ? (
                      <img
                        src={`http://localhost:5000/uploads/${relatedProduct.materialPhoto}`}
                        alt={relatedProduct.materialName || relatedProduct.quality || 'Cinnamon Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl text-amber-400">🌿</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {relatedProduct.materialName || relatedProduct.quality || 'Cinnamon Product'}
                    </h3>
                    <p className="text-xl font-bold text-[#8B4513] mb-3">
                      LKR {Number(relatedProduct.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition">
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesaleProductDetails;