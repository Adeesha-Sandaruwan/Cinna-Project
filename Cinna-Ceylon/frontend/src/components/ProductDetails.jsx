// Import necessary libraries and components from React and other packages.
import React, { useEffect, useState } from "react"; // Import React core, and the 'useEffect' and 'useState' hooks.
import { useParams, Link, useNavigate } from "react-router-dom"; // Import routing hooks for accessing URL params, creating links, and programmatic navigation.
import HeaderAfterLogin from "./HeaderAfterLogin.jsx"; // Import the header component for logged-in users.
import Footer from "./Footer.jsx"; // Import the footer component.

// Define a constant object to hold the theme colors for consistent styling.
const COLORS = {
  RICH_GOLD: "#c5a35a", // A rich gold color, often for accents or buttons.
  DEEP_CINNAMON: "#CC7722", // A deep cinnamon color, used for primary actions like 'Buy Now'.
  WARM_BEIGE: "#F5EFE6", // A warm beige, likely for backgrounds.
  DARK_SLATE: "#2d2d2d", // A dark slate color for primary text.
  SOFT_WHITE: "#FCFBF8", // A soft white color, also for backgrounds or card elements.
};

// Define the main component for displaying product details.
const ProductDetails = () => {
  // Get the 'id' parameter from the URL (e.g., /products/123 -> id is '123').
  const { id } = useParams();
  // Get the navigate function to programmatically redirect the user to other pages.
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  // State to hold the fetched product object. Initial value is null.
  const [product, setProduct] = useState(null);
  // State to track if the main product details are currently being loaded. Default is true.
  const [loading, setLoading] = useState(true);
  // State to manage the quantity of the product the user wants to buy. Default is 1.
  const [quantity, setQuantity] = useState(1);
  // State to hold an array of products related to the current one.
  const [relatedProducts, setRelatedProducts] = useState([]);
  // State to track if the related products are being loaded.
  const [relatedLoading, setRelatedLoading] = useState(true);
  // State to track if the product is being added to the cart (for showing a loading state on the button).
  const [addingToCart, setAddingToCart] = useState(false);
  // State to hold the message shown to the user after trying to add to cart (e.g., "Success!").
  const [cartMessage, setCartMessage] = useState("");
  // State to track if the "Buy Now" process is active.
  const [buyingNow, setBuyingNow] = useState(false);

  // Mock (placeholder) data for product reviews until a real review system is built.
  const reviews = { rating: 4.5, count: 24 };

  // This effect runs once when the component is first mounted.
  useEffect(() => {
    // Scrolls the browser window to the very top of the page.
    window.scrollTo(0, 0);
  }, []); // The empty dependency array [] means this effect runs only once.

  // This effect runs whenever the 'id' from the URL changes.
  useEffect(() => {
    // Define an asynchronous function to fetch the product data.
    const fetchProduct = async () => {
      setLoading(true); // Set loading state to true before starting the fetch.
      // Fetch data for the specific product from the backend API.
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      // Check if the server responded with a success status code (e.g., 200 OK).
      if (res.ok) {
        // If successful, parse the JSON data from the response.
        const data = await res.json();
        // Update the 'product' state with the fetched data.
        setProduct(data);
      }
      // Set loading state to false after the fetch is complete (whether it succeeded or failed).
      setLoading(false);
    };
    // Call the function to execute the fetch.
    fetchProduct();
  }, [id]); // The dependency array [id] means this effect re-runs if 'id' changes.

  // This effect runs when the main 'product' state is updated.
  useEffect(() => {
    // If there is no product data yet, do nothing.
    if (!product) return;
    // Define an async function to fetch related products.
    const fetchRelated = async () => {
      setRelatedLoading(true); // Start the loading state for related products.
      // Fetch all products from the API.
      const res = await fetch("http://localhost:5000/api/products");
      // If the fetch is successful...
      if (res.ok) {
        // Parse the list of all products.
        const allProducts = await res.json();
        // Filter the list to find related products.
        const related = allProducts
          .filter(
            (p) =>
              p._id !== id && // Exclude the current product itself.
              (p.type === product.type || p.grade === product.grade) // Match by type OR grade.
          )
          .slice(0, 3); // Take only the first 3 related products found.
        // Update the 'relatedProducts' state with the filtered list.
        setRelatedProducts(related);
      }
      setRelatedLoading(false); // End the loading state for related products.
    };
    // Call the function to fetch related items.
    fetchRelated();
  }, [product, id]); // Re-run this effect if the main 'product' or its 'id' changes.

  // Function to handle the "Add to Cart" button click.
  const addToCart = async () => {
    // Prevent action if there's no product or it's out of stock.
    if (!product || product.availableStock === 0) return;

    setAddingToCart(true); // Show loading state on the button.
    setCartMessage(""); // Clear any previous cart messages.

    // Prepare the data to be sent to the backend.
    const requestBody = {
      user: "default", // NOTE: User ID is hardcoded, should be dynamic in a real app.
      productId: product._id, // The ID of the product to add.
      qty: quantity, // The quantity selected by the user.
    };

    // Send a POST request to the cart API endpoint.
    const response = await fetch("http://localhost:5000/api/cart", {
      method: "POST", // Specify the HTTP method.
      headers: { "Content-Type": "application/json" }, // Tell the server we're sending JSON.
      body: JSON.stringify(requestBody), // Convert the JavaScript object to a JSON string.
    });

    // Check if the request was successful.
    if (response.ok) {
      // If successful, show a success message.
      setCartMessage("✅ Added to cart successfully!");
      // Automatically hide the message after 3 seconds.
      setTimeout(() => setCartMessage(""), 3000);
      // Dispatch a custom event to notify other components (like the header) that the cart has changed.
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      // If there was an error...
      const errorData = await response.json(); // Parse the error response from the server.
      // Show a detailed error message.
      setCartMessage(`❌ ${errorData.error || "Failed to add to cart"}`);
      // Automatically hide the message after 3 seconds.
      setTimeout(() => setCartMessage(""), 3000);
    }

    setAddingToCart(false); // Reset the button's loading state.
  };

  // Function to handle the "Buy Now" button click.
  const buyNow = async () => {
    // Prevent action if there's no product or it's out of stock.
    if (!product || product.availableStock === 0) return;

    setBuyingNow(true); // Show loading state on the button.

    // Prepare the data to create a new order.
    const orderData = {
      user: "default", // NOTE: Hardcoded user.
      items: [ // An array of items in this order.
        {
          product: product._id, // Product ID.
          qty: quantity, // Selected quantity.
          price: product.price, // Price at time of purchase.
          itemType: "product", // Type of item.
          name: product.name, // Product name.
          type: product.type, // Product type.
        },
      ],
      total: quantity * product.price, // Calculate the total price.
      shippingAddress: { // Pre-fill shipping with empty values for the checkout form.
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
      },
      paymentMethod: "Credit Card", // Default payment method.
      status: "pending", // Initial status of the order.
    };

    // Send a POST request to the orders API to create the order.
    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST", // HTTP method.
      headers: { "Content-Type": "application/json" }, // Data format.
      body: JSON.stringify(orderData), // The order data in JSON format.
    });

    // If the order was created successfully...
    if (response.ok) {
      const order = await response.json(); // Get the created order details from the response.
      // Redirect the user to the checkout page, passing the new order ID as a URL parameter.
      navigate(`/checkout/default?orderId=${order._id}&buyNow=true`);
    } else {
      // If order creation failed...
      const errorData = await response.json(); // Get the error details.
      // Show an alert to the user with the error message.
      alert(`Failed to create order: ${errorData.error || "Unknown error"}`);
    }

    setBuyingNow(false); // Reset the button's loading state.
  };

  // --- RENDER LOGIC ---

  // If data is still loading, show a simple loading message.
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin /> {/* Show header */}
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading product details...</p> {/* Loading text */}
        </div>
        <Footer /> {/* Show footer */}
      </div>
    );
  }

  // If loading is finished but no product was found, show a "not found" message.
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin /> {/* Show header */}
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-600">Product not found</p> {/* Not found text */}
        </div>
        <Footer /> {/* Show footer */}
      </div>
    );
  }

  // If the product was loaded successfully, render the full details page.
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin /> {/* Render the header */}

      <div className="container mx-auto px-4 py-8">
        {/* Main product details card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column: Product Image */}
            <div className="lg:col-span-1">
              <div className="relative flex items-center justify-center bg-white">
                <img
                  src={`http://localhost:5000/uploads/${product.image}`} // Dynamically set the image source.
                  alt={product.name} // Set alt text for accessibility.
                  className="w-full h-full object-contain" // Style the image to fit its container.
                  onError={(e) => { // This function runs if the image fails to load.
                    // It replaces the broken image source with a placeholder image.
                    e.target.src =
                      "https://via.placeholder.com/600x600/f5efe6/cc7722?text=Cinnamon+Product";
                  }}
                />
                {/* Conditionally render a "Low Stock" badge if stock is 5 or less. */}
                {product.availableStock <= 5 && product.availableStock > 0 && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Low Stock
                  </span>
                )}
                {/* Conditionally render an "Out of Stock" badge if stock is 0. */}
                {product.availableStock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Product Information */}
            <div className="lg:col-span-1 p-8">
              {/* Product Name */}
              <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                {product.name}
              </h1>

              {/* Star Rating & Review Count */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {/* Create an array of 5 items to map over for the stars. */}
                  {[...Array(5)].map((_, i) => (
                    <svg // Render an SVG icon for each star.
                      key={i} // Unique key for each star.
                      className={`w-5 h-5 ${
                        // Conditionally color the star based on the rating.
                        i < Math.floor(reviews.rating)
                          ? "fill-current" // Filled star
                          : "fill-gray-300" // Empty star
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {reviews.rating} ({reviews.count} reviews) {/* Display rating and count */}
                </span>
              </div>

              {/* Product Price */}
              <div className="text-3xl font-bold mb-4" style={{ color: COLORS.DEEP_CINNAMON }}>
                {/* Format the price with commas (e.g., 1,000). */}
                LKR {product.price.toLocaleString()}
              </div>

              {/* Product Info Section */}
              <div className="space-y-2 mb-6">
                <p>SKU: <span className="font-semibold">{product.sku}</span></p>
                <p>Type: <span className="font-semibold capitalize">{product.type}</span></p>
                <p>Grade: <span className="font-semibold capitalize">{product.grade}</span></p>
                <p>
                  Available:{" "}
                  <span
                    className={`font-semibold ${
                      // Dynamically set the text color based on stock level.
                      product.availableStock > 10
                        ? "text-green-600" // Green for high stock.
                        : product.availableStock > 0
                        ? "text-orange-600" // Orange for low stock.
                        : "text-red-600" // Red for out of stock.
                    }`}
                  >
                    {/* Display a user-friendly stock message. */}
                    {product.availableStock > 0
                      ? `${product.availableStock} available`
                      : "Out of stock"}
                  </span>
                </p>
                <p>
                  Expiry Date:{" "}
                  <span className="font-semibold">
                    {/* Format the date string into a more readable local format. */}
                    {new Date(product.expiryDate).toLocaleDateString()}
                  </span>
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-gray-600">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    // Decrease quantity on click.
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2"
                    // Disable the button if quantity is already 1.
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number" // Use number input type for better mobile experience.
                    min="1" // Minimum allowed value.
                    max={product.availableStock || 0} // Maximum allowed value is the available stock.
                    value={quantity} // Controlled input value from state.
                    onChange={(e) => { // Handle direct input changes.
                      const value = parseInt(e.target.value) || 1; // Parse the input value, defaulting to 1.
                      // Ensure the value is within the valid range [1, availableStock].
                      setQuantity(
                        Math.max(1, Math.min(product.availableStock || 0, value))
                      );
                    }}
                    className="w-16 text-center border-x"
                  />
                  <button
                    // Increase quantity on click.
                    onClick={() =>
                      setQuantity(
                        Math.min(product.availableStock || 0, quantity + 1)
                      )
                    }
                    className="px-3 py-2"
                    // Disable the button if quantity reaches the available stock.
                    disabled={quantity >= (product.availableStock || 0)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cart Success/Error Message */}
              {cartMessage && ( // Only render this div if 'cartMessage' is not empty.
                <div
                  // Apply dynamic classes based on whether the message is a success or error.
                  className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                    cartMessage.includes("✅")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {cartMessage} {/* Display the message text. */}
                  {cartMessage.includes("✅") && ( // If it's a success message...
                    <Link
                      to="/cart" // Provide a link to the cart page.
                      className="block mt-2 text-sm underline"
                      style={{ color: COLORS.DEEP_CINNAMON }}
                    >
                      View Cart →
                    </Link>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={addToCart} // Call the addToCart function on click.
                  // Disable the button if out of stock or if it's already being added.
                  disabled={product.availableStock === 0 || addingToCart}
                  className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-300"
                >
                  {/* Show "Adding..." text while the process is running. */}
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={buyNow} // Call the buyNow function on click.
                  // Disable if out of stock or if the process is already running.
                  disabled={product.availableStock === 0 || buyingNow}
                  className="flex-1 py-3 px-6 rounded-lg text-white"
                  style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                >
                  {/* Show "Processing..." text while the process is running. */}
                  {buyingNow ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && ( // Only render this section if a description exists.
          <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Product Features Section */}
        <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8">
          <h2 className="text-2xl font-bold mb-6">Product Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
            {/* Hardcoded list of features. */}
            <li>✅ Premium Quality</li>
            <li>✅ Fresh & Natural</li>
            <li>✅ Certified Organic</li>
          </ul>
        </div>

        {/* Customer Reviews Summary Section */}
        <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          <div className="flex justify-center mb-2 text-yellow-400 text-2xl">
            {/* Another star rating display, this time larger. */}
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-8 h-8 ${
                  i < Math.floor(reviews.rating) ? "fill-current" : "fill-gray-300"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-xl font-bold">{reviews.rating} out of 5</p>
          <p className="text-gray-600">Based on {reviews.count} reviews</p>
        </div>

     {/* Related Products Section */}
     <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto p-8">
       <h2 className="text-2xl font-bold mb-6">Related Products</h2>
       {relatedLoading ? ( // If related products are still loading...
         <p className="text-center">Loading related products...</p> // Show a loading message.
       ) : relatedProducts.length > 0 ? ( // Otherwise, if there are related products...
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {/* Map over the related products array to create a card for each one. */}
           {relatedProducts.map((relatedProduct) => (
             <div
               key={relatedProduct._id} // Unique key for each product card.
               className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition"
             >
               {/* Image container to maintain a consistent square aspect ratio. */}
               <div className="w-full aspect-square bg-white flex items-center justify-center">
                 <img
                   src={`http://localhost:5000/uploads/${relatedProduct.image}`} // Image source.
                   alt={relatedProduct.name} // Alt text.
                   className="max-h-full max-w-full object-contain p-4" // Image styling.
                   onError={(e) => { // Fallback for broken images.
                     e.target.src =
                       "https://via.placeholder.com/400x400/f5efe6/cc7722?text=Cinnamon+Product";
                   }}
                 />
               </div>

               {/* Product Info */}
               <div className="p-4 flex flex-col flex-grow">
                 <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">
                   {relatedProduct.name} {/* Product name */}
                 </h3>
                 <p
                   className="text-md font-bold mb-4 text-center"
                   style={{ color: COLORS.DEEP_CINNAMON }}
                 >
                   LKR {relatedProduct.price.toLocaleString()} {/* Product price */}
                 </p>

                 {/* "View Product" Button/Link */}
                 <div className="mt-auto"> {/* Pushes the button to the bottom of the card. */}
                   <Link
                     to={`/products/${relatedProduct._id}`} // Links to the product's own details page.
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
       ) : ( // If there are no related products found...
         <p className="text-center text-gray-600">No related products found</p> // Show a message.
       )}
     </div>

      </div> {/* End of container */}

      <Footer /> {/* Render the footer */}
    </div>
  );
};

// Export the component so it can be used in other parts of the application.
export default ProductDetails;