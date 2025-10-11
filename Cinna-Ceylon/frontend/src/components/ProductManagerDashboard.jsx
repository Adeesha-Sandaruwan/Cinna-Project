import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

/**
 * Theme colors used across the dashboard for consistent styling
 */
const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

// Colors used for chart segments
const CHART_COLORS = [COLORS.DEEP_CINNAMON, COLORS.RICH_GOLD, '#F0A369', '#E6BE8A'];

/**
 * ProductManagerDashboard Component
 * ---------------------------------
 * Displays product statistics, quick actions, and visual charts for product stock overview.
 */
const ProductManagerDashboard = () => {
  // Local state: products, loading status, and error message
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch products from backend when component mounts
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products?admin=true');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // -------------------- Derived Data --------------------

  // Total number of products
  const totalProducts = products.length;

  // Count of out-of-stock items
  const outOfStock = products.filter(p => p.availableStock === 0).length;

  // Count of low-stock items (<= 10 units)
  const lowStock = products.filter(p => p.availableStock > 0 && p.availableStock <= 10).length;

  // Remaining in-stock items
  const inStock = totalProducts - outOfStock;

  // Data formatted for Recharts PieChart
  const stockData = [
    { name: 'In Stock', value: inStock },
    { name: 'Out of Stock', value: outOfStock },
    { name: 'Low Stock', value: lowStock },
  ];

  // Top 5 products with the lowest stock levels
  const lowStockItems = products
    .filter(p => p.availableStock > 0 && p.availableStock <= 10)
    .sort((a, b) => a.availableStock - b.availableStock)
    .slice(0, 5);

  // -------------------- Conditional UI --------------------

  // Show loading state
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Show error message if data fetching fails
  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  // -------------------- Render Dashboard --------------------
  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        {/* Page Title */}
        <h1
          className="text-4xl font-bold mb-8"
          style={{ color: COLORS.DARK_SLATE }}
        >
          Product Manager Dashboard
        </h1>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Products Card */}
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: COLORS.WARM_BEIGE }}
          >
            <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>
              Total Products
            </h2>
            <p className="text-4xl font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
              {totalProducts}
            </p>
          </div>

          {/* Out of Stock Card */}
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: COLORS.WARM_BEIGE }}
          >
            <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>
              Out of Stock
            </h2>
            <p className="text-4xl font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
              {outOfStock}
            </p>
          </div>

          {/* Low Stock Card */}
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: COLORS.WARM_BEIGE }}
          >
            <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>
              Low Stock (≤10)
            </h2>
            <p className="text-4xl font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
              {lowStock}
            </p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Add Product Link */}
          <Link
            to="/product_form"
            className="p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            style={{ backgroundColor: COLORS.RICH_GOLD, color: COLORS.SOFT_WHITE }}
          >
            <h2 className="text-2xl font-bold">Add New Product</h2>
            <p>Create a new product listing</p>
          </Link>

          {/* Manage Products Link */}
          <Link
            to="/admin/products"
            className="p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            style={{ backgroundColor: COLORS.DEEP_CINNAMON, color: COLORS.SOFT_WHITE }}
          >
            <h2 className="text-2xl font-bold">Manage All Products</h2>
            <p>View, edit, or delete existing products</p>
          </Link>
        </div>

        {/* Charts and Low-Stock List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Status Pie Chart */}
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: COLORS.WARM_BEIGE }}
          >
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: COLORS.DARK_SLATE }}
            >
              Stock Status
            </h2>
            <div className="w-full h-80 flex items-center justify-center">
              <PieChart width={400} height={300}>
                <Pie
                  data={stockData}        // the data array above
                  dataKey="value"          // the field that determines slice size
                  nameKey="name"           // the field used for labels
                  cx="50%" cy="50%"        // centers the pie
                  outerRadius={100}        // radius (size) of the pie
                  label                   // enables labels on each slice
                >
                  {/* Apply colors to each chart slice */}
                  {stockData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* Top 5 Low Stock Items */}
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: COLORS.WARM_BEIGE }}
          >
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: COLORS.DARK_SLATE }}
            >
              Top 5 Low Stock Items
            </h2>
            <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.map(item => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center p-3 rounded"
                    style={{ backgroundColor: COLORS.SOFT_WHITE }}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-red-600">
                      {item.availableStock} units left
                    </span>
                  </div>
                ))
              ) : (
                <p>No items with low stock.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductManagerDashboard;
