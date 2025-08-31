import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
};

// Reusable small components
const Modal = ({ open, onClose, children }) =>
  !open ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg animate-fadeIn">
        {children}
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

const StockStatus = ({ stock }) => {
  const status =
    stock <= 5
      ? { text: "Low", color: "bg-red-100 text-red-700" }
      : stock <= 20
      ? { text: "Medium", color: "bg-yellow-100 text-yellow-700" }
      : { text: "Good", color: "bg-green-100 text-green-700" };
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${status.color}`}>
      {status.text}
    </span>
  );
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  // API helper
  const apiRequest = async (url, options, successMsg) => {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        setMessage(successMsg);
        fetchProducts();
        return true;
      }
    } catch {
      setMessage("❌ Something went wrong");
    }
    return false;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products");
      setProducts(await res.json());
    } catch {
      setMessage("❌ Error loading products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter + paginate
  const filtered = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())) &&
      (filter === "all" || p.type === filter)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  // Handlers
  const saveEdit = async () => {
    const fd = new FormData();
    Object.entries(editProduct).forEach(([k, v]) =>
      !["_id", "createdAt", "updatedAt"].includes(k) && fd.append(k, v)
    );
    if (
      await apiRequest(
        `http://localhost:5000/api/products/${editProduct._id}`,
        { method: "PUT", body: fd },
        "✅ Product updated"
      )
    )
      setEditProduct(null);
  };

  const confirmDelete = async () => {
    if (
      await apiRequest(
        `http://localhost:5000/api/products/${deleteProduct._id}`,
        { method: "DELETE" },
        "✅ Product deleted"
      )
    )
      setDeleteProduct(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <div className="p-6 flex-1">
        {message && (
          <div className="mb-4 text-center font-medium text-green-700 bg-green-100 py-2 rounded-xl">
            {message}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex border p-2 rounded-xl bg-white shadow-sm w-full md:w-1/3">
            <MagnifyingGlassIcon className="w-5 mr-2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or description..."
              className="flex-1 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded-xl bg-white shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="spice">Spice</option>
            <option value="powder">Powder</option>
          </select>
          <Link
            to="/product_form"
            className="ml-auto bg-orange-700 hover:bg-orange-800 text-white px-4 py-2 rounded-xl flex items-center shadow-md"
          >
            <PlusIcon className="w-5 mr-1" /> Add Product
          </Link>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl overflow-hidden bg-white shadow-md">
              <thead className="bg-gray-300">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((p) => (
                  <tr key={p._id} className="text-center border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.sku}</td>
                    <td className="p-3 capitalize">{p.type}</td>
                    <td className="p-3">${p.price}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3"><StockStatus stock={p.stock} /></td>
                    <td className="p-3 flex justify-center gap-3">
                      <button onClick={() => setEditProduct(p)} className="text-blue-600 hover:text-blue-800">
                        <PencilIcon className="w-5" />
                      </button>
                      <button onClick={() => setDeleteProduct(p)} className="text-red-600 hover:text-red-800">
                        <TrashIcon className="w-5" />
                      </button>
                      <Link to={`/products/${p._id}`} className="text-gray-600 hover:text-gray-900">
                        <EyeIcon className="w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-center gap-3 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded-xl bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded-xl bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)}>
        {editProduct && (
          <div>
            <h2 className="text-lg font-bold mb-3">Edit Product</h2>
            <div className="grid gap-2">
              <input
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="border p-2 rounded"
                placeholder="Name"
              />
              <input
                value={editProduct.sku}
                onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                className="border p-2 rounded"
                placeholder="SKU"
              />
              <select
                value={editProduct.type}
                onChange={(e) => setEditProduct({ ...editProduct, type: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="spice">Spice</option>
                <option value="powder">Powder</option>
              </select>
              <input
                type="number"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                className="border p-2 rounded"
                placeholder="Price"
              />
              <input
                type="number"
                value={editProduct.stock}
                onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                className="border p-2 rounded"
                placeholder="Stock"
              />
              <textarea
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                className="border p-2 rounded"
                placeholder="Description"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteProduct} onClose={() => setDeleteProduct(null)}>
        <p className="text-lg">Delete <span className="font-bold">{deleteProduct?.name}</span>?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            Confirm Delete
          </button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
