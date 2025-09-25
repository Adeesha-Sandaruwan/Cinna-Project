import React, { useState, useEffect } from "react";// brings react in to scope and use effect support fetching data
import { Link } from "react-router-dom";//link navigates between routes without reloading the page.
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";//import some visual icons from hereicons(delete , search and view)
import ExpiryBar from './ExpiryBar.jsx';

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
}; // using this we can centrelize the brand colors later reuse instead of hex values

// Reusable small components
const Modal = ({ open, onClose, children }) =>//open - whether to show the model,onclose - calls when user closes, children - jsx
  !open ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">//
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
    stock <= 5 //if stock returns lower than 5
      ? { text: "Low", color: "bg-red-100 text-red-700" } //display low
      : stock <= 20
      ? { text: "Medium", color: "bg-yellow-100 text-yellow-700" }
      : { text: "Good", color: "bg-green-100 text-green-700" };
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${status.color}`}>
      {status.text}
    </span> //returns a pill like status tag
  );
};

export default function ProductManagement() { // defines and exports the main page component
  const [products, setProducts] = useState([]); //holds full products list from the backend
  const [loading, setLoading] = useState(true); //Controls the loading state (spinner/message).
  const [message, setMessage] = useState(""); // Holds feedback text (e.g., “ Product updated”, errors, etc.
  const [search, setSearch] = useState(""); //current text in the search box
  const [filter, setFilter] = useState("all"); //filter type "all","spice","powder"
  const [page, setPage] = useState(1); //current page in the pagination
  const perPage = 10; //10 products per page

  const [editProduct, setEditProduct] = useState(null); // holds the product which is about to be updated part. null if model is closed
  const [deleteProduct, setDeleteProduct] = useState(null); // holds product user intends to delete.

  // API helper
  const apiRequest = async (url, options, successMsg) => { //define const apiRequest it will hold an asynchronous function that takes three parameters: url, options, and successMsg.
    try {
      const res = await fetch(url, options); // use await to wait for the fetch to complete
      if (res.ok) {
        setMessage(successMsg); //if response is okay display success msg
        fetchProducts(); // refresh the table
        return true;
      }
    } catch {
      setMessage("❌ Something went wrong");// if fails displays this msg
    }
    return false; //otherwise return false
  };

  const fetchProducts = async () => { //get products from the backend, makes it asynchronus to use await inside the function
    setLoading(true); //This shows a spinner/loader in the UI while waiting.
    try {
      const res = await fetch("http://localhost:5000/api/products?admin=true"); //fetch ALL products (including private) for admin view
      setProducts(await res.json()); //updates the products state with the fetched data. React component will re-render with the new product data.
    } catch { //If something goes wrong (like no internet, server down, invalid JSON), the catch block runs.
      setMessage("❌ Error loading products");
    }
    setLoading(false); //hides the spinner
  };

  useEffect(() => { // a react hook to call fetchProducts when the component loads first.
    fetchProducts();
  }, []);

  // Filter + paginate
  const filtered = products.filter( //takes full products list and returns only matches
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) || //Everything is converted to lowercase
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())) &&
      (filter === "all" || p.type === filter) //If the user’s filter is "all" → all product types are allowed.
  );
  const totalPages = Math.ceil(filtered.length / perPage); //total number of filtered products / how many pages you need. Math.ceil → rounds up number
  const current = filtered.slice((page - 1) * perPage, page * perPage);//slice(start, end) cuts out a portion of the array
//page - 1 starts from 0 for the first page, so we multiply by perPage to get the correct starting index.

  
// Handlers
  const saveEdit = async () => {//This will run when the user saves changes to a product.
    const fd = new FormData(); //Creates a new FormData object and it lets you append key/value pairs
    Object.entries(editProduct).forEach(([k, v]) => //Turns the editProduct object into an array of [key, value] pairs and loop through each [key,value]
      !["_id", "createdAt", "updatedAt"].includes(k) && fd.append(k, v) //fd.append(k, v) Adds the remaining key/value pairs into the FormData object.
    ); //This condition excludes some keys that don’t want to send (like _id, createdAt, updatedAt
    if (
      await apiRequest( //Calls your apiRequest helper.
        `http://localhost:5000/api/products/${editProduct._id}`, //updates a specific product
        { method: "PUT", body: fd }, //method: "PUT" → because of trying to update. body: fd → sending the form data.
        "✅ Product updated"
      )
    )
      setEditProduct(null); //closes the edit form
  };//inshort collects all updated product fields (except DB-only ones) → sends them to backend via PUT → if successful, clears edit mode.


  const confirmDelete = async () => { //runs when user confirms the delete . Marked async because it makes an API call
    if (
      await apiRequest(
        `http://localhost:5000/api/products/${deleteProduct._id}`,//inserts specific id into the URL
        { method: "DELETE" }, //HTTP method is "DELETE"
        "✅ Product deleted" // display
      )
    )
      setDeleteProduct(null);//close the confirmation dialog / modal,
  };

  const toggleVisibility = async (product) => {
    const newVisibility = product.visibility === 'public' ? 'private' : 'public';
    const fd = new FormData();
    fd.append('visibility', newVisibility);
    
    if (
      await apiRequest(
        `http://localhost:5000/api/products/${product._id}`,
        { method: "PUT", body: fd },
        `✅ Product is now ${newVisibility}`
      )
    ) {
      // Update local state to reflect the change
      setProducts(products.map(p => 
        p._id === product._id 
          ? { ...p, visibility: newVisibility }
          : p
      ));
    }
  };

//display the content part....................................................................................................

  return ( // react component that returns JSX that defines what will render
    <div className="bg-gray-50 min-h-screen flex flex-col">  
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
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Visibility</th>
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
                    <td className="p-3 w-28">
                      {p.expiryDate && (
                        <ExpiryBar createdAt={p.createdAt} expiryDate={p.expiryDate} compact />
                      )}
                      <div className="text-[10px] mt-1">
                        {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleVisibility(p)}
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          p.visibility === 'public'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.visibility === 'public' ? 'Public' : 'Private'}
                      </button>
                    </td>
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
              <input
                type="date"
                value={editProduct.expiryDate ? editProduct.expiryDate.split('T')[0] : ''}
                onChange={(e) => setEditProduct({ ...editProduct, expiryDate: e.target.value })}
                className="border p-2 rounded"
                min={new Date().toISOString().split('T')[0]}
                placeholder="Expiry Date"
              />
              <textarea
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                className="border p-2 rounded"
                placeholder="Description"
              />
              <div className="flex items-center gap-2">
                <label className="font-medium">Visibility:</label>
                <select
                  value={editProduct.visibility}
                  onChange={(e) => setEditProduct({ ...editProduct, visibility: e.target.value })}
                  className="border p-2 rounded flex-grow"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
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

    </div>
  );
}
