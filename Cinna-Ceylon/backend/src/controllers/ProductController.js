import Product from "../models/Product.js"; // import the Product model to interact with the products collection

// Helper: determine if a product is expired (expiryDate strictly before start of today)
const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return new Date(expiryDate) < todayStart;
};

// Helper: mark all expired public products as private (used lazily within requests; can be refactored to a cron later)
const privatizeExpiredProducts = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  try {
    await Product.updateMany(
      { expiryDate: { $lt: todayStart }, visibility: "public" },
      { $set: { visibility: "private" } }
    );
  } catch (e) {
    // Swallow to avoid breaking main requests; could log with a logger util
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const data = req.body; // get data sent from frontend

    // Validate expiry date if provided
    if (data.expiryDate) {
      const today = new Date(); // current date
      const expDate = new Date(data.expiryDate); // convert input expiry date to Date
      if (expDate < today.setHours(0, 0, 0, 0)) { // check if expiry is before today
        return res.status(400).json({ error: "Expiry date must be today or later" });
      }
    }

    // If an image file is uploaded, store the filename
    if (req.file) {
      data.image = req.file.filename;
    }

    // Create new product in database
    const product = await Product.create(data);
    res.status(201).json(product); // return the created product
  } catch (err) {
    res.status(400).json({ error: err.message }); // handle errors
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true'; // check if admin query param is true
    const search = (req.query.q || req.query.search || '').trim(); // optional search term

    // First, lazily enforce privatization of expired products
    await privatizeExpiredProducts();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Base query: exclude expired products for non-admins by visibility AND by expiryDate
    // Admins can see all (including expired) to manage them
    const query = {};
    if (!isAdmin) {
      query.visibility = "public";
      query.expiryDate = { $gte: todayStart };
    }

    // If a search term is provided, apply case-insensitive regex on name and (optionally) description
    if (search.length > 0) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // escape then case-insensitive
      query.$or = [
        { name: regex },
        { description: regex }
      ];
    }

    // Find products based on query and sort newest first
    const products = await Product.find(query).sort("-createdAt");
    res.json(products); // send products list as JSON
  } catch (err) {
    res.status(500).json({ error: err.message }); // server error
  }
};

// Get single product by ID
export const getProduct = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const product = await Product.findById(req.params.id); // find product by ID
    if (!product) return res.status(404).json({ error: "Not found" });

    // Auto privatize if expired and still public (lazy enforcement)
    if (isExpired(product.expiryDate) && product.visibility !== 'private') {
      product.visibility = 'private';
      await product.save();
    }

    // If not admin: hide if now private OR expired
    if (!isAdmin) {
      if (product.visibility !== 'public' || isExpired(product.expiryDate)) {
        return res.status(404).json({ error: "Not found" });
      }
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const data = req.body; // get updated data from frontend

    // If a new image is uploaded, update the filename
    if (req.file) {
      data.image = req.file.filename;
    }

    // Validate expiry date if provided
    if (data.expiryDate) {
      const today = new Date();
      const expDate = new Date(data.expiryDate);
      if (expDate < today.setHours(0, 0, 0, 0)) {
        return res.status(400).json({ error: "Expiry date must be today or later" });
      }
    }

    // Update product in DB and return new version
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: "Not found" });

    res.json(product); // send updated product
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id); // remove product from DB
    res.json({ message: "Deleted" }); // confirm deletion
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update stock levels
export const updateStock = async (req, res) => {
  try {
    const { stock, safetyStock, reorderLevel } = req.body; // get stock values from request
    const product = await Product.findById(req.params.id); // find product

    if (!product) return res.status(404).json({ error: "Product not found" });

    // Validate that stock values are not negative
    if (stock < 0) return res.status(400).json({ error: "Stock cannot be negative" });
    if (safetyStock < 0) return res.status(400).json({ error: "Safety stock cannot be negative" });
    if (reorderLevel < 0) return res.status(400).json({ error: "Reorder level cannot be negative" });

    // Update stock values in DB
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stock, safetyStock, reorderLevel },
      { new: true } // return updated product
    );

    res.json(updatedProduct); // return updated product
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get inventory status
export const getInventoryStatus = async (req, res) => {
  try {
    // Fetch selected fields from all products
    const products = await Product.find().select("name stock safetyStock reorderLevel availableStock");

    // Map products to include useful inventory info
    const inventoryStatus = products.map(product => ({
      id: product._id,
      name: product.name,
      actualStock: product.stock, // total stock
      safetyStock: product.safetyStock, // minimum stock to keep
      reorderLevel: product.reorderLevel, // stock level to trigger reorder
      availableStock: product.availableStock, // computed available stock
      needsReorder: product.stock <= product.reorderLevel, // true if stock below reorder
      belowSafetyStock: product.stock <= product.safetyStock, // true if below safety stock
    }));

    res.json(inventoryStatus); // send inventory status
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
