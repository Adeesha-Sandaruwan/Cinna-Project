import React, { useState } from "react";
import { Link } from "react-router-dom";

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    type: "spice",
    grade: "A",
    expiryDate: "",
    visibility: "public",
    image: null,
    customType: "",
    description: "",
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && !file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "❌ Only image files allowed" }));
        return;
      }
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };  const validateForm = () => {
    let errs = {};
  
    if (!formData.name) {
      errs.name = "Name is required";
    }
    if (!formData.price || formData.price <= 0) {
      errs.price = "Price must be greater than 0";
    }
    if (!formData.description || formData.description.trim().length < 5) {
      errs.description = "Description must be at least 5 characters";
    }
    if (!formData.expiryDate) {
      errs.expiryDate = "Expiry date is required";
    }
    if (!formData.image) {
      errs.image = "Product image is required";
    }
    if (!formData.stock || formData.stock < 1) {
      errs.stock = "Stock must be at least 1";
    }
  
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("❌ Please fix form errors before submitting");
      return;
    }

    try {
      const dataToSend = new FormData();
      
      // Handle each field properly
      Object.keys(formData).forEach((key) => {
        if (key === "image") {
          if (formData[key]) {
            dataToSend.append(key, formData[key]);
          }
        } else if (key === "type") {
          // Handle type field - if "other" is selected, use customType, otherwise use the selected type
          if (formData.type === "other" && formData.customType) {
            dataToSend.append("type", formData.customType);
          } else {
            dataToSend.append("type", formData.type);
          }
        } else if (key !== "customType") {
          // Append all other fields except customType (which is handled above)
          dataToSend.append(key, formData[key]);
        }
      });

      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        body: dataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Product created successfully!");
        setFormData({
          name: "",
          sku: "",
          price: "",
          stock: "",
          type: "spice",
          grade: "A",
          expiryDate: "",
          visibility: "public",
          image: null,
          customType: "",
          description: "",
        });
        setPreview(null);
        setErrors({});
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Request failed: ${err.message}`);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-xl p-8"
        style={{ backgroundColor: COLORS.SOFT_WHITE }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: COLORS.DARK_SLATE }}
          >
            🍂 Add New Product
          </h2>
          <Link
            to="/admin/products"
            className="text-sm px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: COLORS.RICH_GOLD, color: COLORS.RICH_GOLD }}
          >
            View All Products
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:outline-none"
              style={{ borderColor: COLORS.RICH_GOLD }}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>

          {/* Description */}
<div>
  <label className="block mb-1 font-medium text-sm">Description</label>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    className="w-full border p-3 rounded h-28 resize-none"
    style={{ borderColor: COLORS.RICH_GOLD }}
    placeholder="Enter detailed product description..."
  />
  {errors.description && (
    <p className="text-red-600 text-sm">{errors.description}</p>
  )}
</div>


          {/* SKU */}
          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={formData.sku}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            style={{ borderColor: COLORS.RICH_GOLD }}
          />

{/* Price & Stock */}
<div className="flex gap-4">
  {/* Price */}
  <div className="w-1/2">
    <input
      type="number"
      name="price"
      placeholder="Price"
      value={formData.price}
      onChange={handleChange}
      className="w-full border p-3 rounded"
      style={{ borderColor: COLORS.RICH_GOLD }}
      min="1"   // ✅ prevents price <= 0
    />
    {errors.price && (
      <p className="text-red-600 text-sm">{errors.price}</p>
    )}
  </div>

  {/* Stock */}
  <div className="w-1/2">
    <input
      type="number"
      name="stock"
      placeholder="Stock"
      value={formData.stock}
      onChange={handleChange}
      className="w-full border p-3 rounded"
      style={{ borderColor: COLORS.RICH_GOLD }}
      min="1"
    />
    {errors.stock && (
      <p className="text-red-600 text-sm">{errors.stock}</p>
    )}
  </div>
</div>

<div>
  <label className="block mb-1 font-medium text-sm">Category</label>
  <select
    name="type"
    value={formData.type}
    onChange={handleChange}
    className="w-full border p-3 rounded"
    style={{ borderColor: COLORS.RICH_GOLD }}
  >
    <option value="spice">Spice</option>
    <option value="powder">Powder</option>
    <option value="other">Other</option>
  </select>

  {/* If "Other" is selected → show input */}
  {formData.type === "other" && (
    <input
      type="text"
      name="customType"
      placeholder="Enter custom category"
      value={formData.customType || ""}
      onChange={handleChange}
      className="w-full border p-3 rounded mt-2"
      style={{ borderColor: COLORS.RICH_GOLD }}
    />
  )}
</div>

          {/* Grade */}
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            style={{ borderColor: COLORS.RICH_GOLD }}
          >
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>

         {/* Expiry Date */}
<div>
  <label className="block mb-1 font-medium text-sm">
    Expiry Date
  </label>
  <input
    type="date"
    name="expiryDate"
    value={formData.expiryDate}
    onChange={handleChange}
    className="w-full border p-3 rounded"
    style={{ borderColor: COLORS.RICH_GOLD }}
    min={new Date().toISOString().split("T")[0]} // ✅ cannot pick before today
  />
  {errors.expiryDate && (
    <p className="text-red-600 text-sm">{errors.expiryDate}</p>
  )}
</div>


          {/* Visibility */}
          <div>
            <label className="block mb-1 font-medium text-sm">Visibility</label>
            <div className="flex gap-6">
              <label>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === "public"}
                  onChange={handleChange}
                />{" "}
                Public
              </label>
              <label>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === "private"}
                  onChange={handleChange}
                />{" "}
                Private
              </label>
            </div>
          </div>

          {/* Image */}
<div>
  <label className="block mb-1 font-medium text-sm">Product Image</label>
  <input
    type="file"
    name="image"
    accept="image/*"
    onChange={(e) =>
      setFormData({ ...formData, image: e.target.files[0] })
    }
    className="w-full border p-3 rounded"
    style={{ borderColor: COLORS.RICH_GOLD }}
  />
  {errors.image && (
    <p className="text-red-600 text-sm">{errors.image}</p>
  )}
</div>

          <button
            type="submit"
            className="w-full py-3 rounded font-bold text-white transition duration-200"
            style={{ backgroundColor: COLORS.RICH_GOLD }}
          >
            Save Product
          </button>
        </form>

        {message && (
          <p
            className="mt-4 text-center font-medium"
            style={{ color: COLORS.DEEP_CINNAMON }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
