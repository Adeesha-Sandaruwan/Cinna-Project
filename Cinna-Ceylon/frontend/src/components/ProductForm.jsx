import React, { useState } from "react"; // React component + local state hook
import {
  validateName,
  validatePrice,
  validateDescription,
  validateExpiryDate,
  validateImage,
  validateStock,
  validateSKU,
  validateCategory,
  validateGrade,
  validateVisibility
} from "../utils/product_form_validations";
import { Link } from "react-router-dom"; // For navigation to product list/admin area

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
}; // Centralized palette used across inputs/buttons

const ProductForm = () => {
  // Form fields for new product creation
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
  const [preview, setPreview] = useState(null); // Local image preview URL
  const [errors, setErrors] = useState({}); // Field-level validation messages
  const [message, setMessage] = useState(""); // Form submit feedback banner

  // Handle any input change (text/select/file)
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validate single field on blur
  // Validate a single field when leaving the input (onBlur)
  const handleBlur = async (e) => {
    const { name, value, files } = e.target;
    let error = "";
    
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "price":
        error = validatePrice(value);
        break;
      case "description":
        error = validateDescription(value);
        break;
      case "expiryDate":
        error = validateExpiryDate(value);
        break;
      case "stock":
        error = validateStock(value);
        break;
      case "sku":
        error = validateSKU(value);
        break;
      case "type":
        error = validateCategory(value === 'other' ? formData.customType : value);
        break;
      case "grade":
        error = validateGrade(value);
        break;
      case "visibility":
        error = validateVisibility(value);
        break;
      case "image":
        error = await validateImage(files[0]);
        break;
    }

    // Merge this field's error into the error bag
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Run all field validations before submit
  const validateForm = async () => {
    let errs = {};
    errs.name = validateName(formData.name);
    errs.price = validatePrice(formData.price);
    errs.description = validateDescription(formData.description);
    errs.expiryDate = validateExpiryDate(formData.expiryDate);
    errs.stock = validateStock(formData.stock);
    errs.sku = validateSKU(formData.sku);
    errs.category = validateCategory(formData.type === 'other' ? formData.customType : formData.type);
    errs.grade = validateGrade(formData.grade);
    errs.visibility = validateVisibility(formData.visibility);
    
  // Image validation is async due to dimension checking
    errs.image = await validateImage(formData.image);

    // Remove empty error messages
    Object.keys(errs).forEach((key) => {
      if (!errs[key]) delete errs[key];
    });
    setErrors(errs); // Show all current errors
    return Object.keys(errs).length === 0;
  };
  

  // Build multipart payload and POST to backend when valid
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) {
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

      const data = await res.json(); // Backend returns success or error JSON
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
        setPreview(null); // clear image preview
        setErrors({}); // clear errors after success
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

  <form onSubmit={handleSubmit} className="space-y-4"> {/* Main product form */}
          {/* Name */}
          <div> {/* Product Name */}
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border p-3 rounded focus:outline-none"
              style={{ borderColor: errors.name ? 'red' : COLORS.RICH_GOLD }}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>

          {/* Description textarea with length validation */}
<div>
  <label className="block mb-1 font-medium text-sm">Description</label>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    onBlur={handleBlur}
    className="w-full border p-3 rounded h-28 resize-none"
    style={{ borderColor: errors.description ? 'red' : COLORS.RICH_GOLD }}
    placeholder="Enter detailed product description (5-1000 characters)..."
  />
  {errors.description && (
    <p className="text-red-600 text-sm">{errors.description}</p>
  )}
</div>


          {/* SKU follows pattern like CIN-XXXX-XXX */}
          <input
            type="text"
            name="sku"
            placeholder="SKU (Format: CIN-XXXX-XXX)"
            value={formData.sku}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border p-3 rounded"
            style={{ borderColor: errors.sku ? 'red' : COLORS.RICH_GOLD }}
          />

{/* Price & Stock side-by-side inputs */}
<div className="flex gap-4">
  {/* Price (currency with two decimals) */}
  <div className="w-1/2">
    <input
      type="number"
      name="price"
      placeholder="Price (Max: 999,999.99)"
      value={formData.price}
      onChange={handleChange}
      onBlur={handleBlur}
      step="0.01"
      min="0.01"
      max="999999.99"
      className="w-full border p-3 rounded"
      style={{ borderColor: errors.price ? 'red' : COLORS.RICH_GOLD }}
    />
    {errors.price && (
      <p className="text-red-600 text-sm">{errors.price}</p>
    )}
  </div>

  {/* Stock (integer quantities only) */}
  <div className="w-1/2">
    <input
      type="number"
      name="stock"
      placeholder="Stock (Min: 5, Max: 100,000)"
      value={formData.stock}
      onChange={handleChange}
      onBlur={handleBlur}
      min="5"
      max="100000"
      step="1"
      className="w-full border p-3 rounded"
      style={{ borderColor: errors.stock ? 'red' : COLORS.RICH_GOLD }}
    />
    {errors.stock && (
      <p className="text-red-600 text-sm">{errors.stock}</p>
    )}
  </div>
</div>

<div>
  <label className="block mb-1 font-medium text-sm">Category</label> {/* Select preset types or Other */}
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

  {/* If "Other" is selected → show input for custom category */}
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

          {/* Grade selection (A/B/C) */}
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

         {/* Expiry Date cannot be before today */}
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


          {/* Visibility (public/private) controls storefront listing */}
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

          {/* Image file upload (validated by dimensions/size in utils) */}
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
