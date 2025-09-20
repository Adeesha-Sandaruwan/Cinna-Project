import Product from "../models/Product.js"; // import the Product model to interact with the products collection

// Create product
export const createProduct = async (req, res) => { // define an async controller function for creating a product
  try { // start of try block to catch errors
    const data = req.body; // take all fields sent in the request body and store them in "data"

    if (data.expiryDate) { // check if expiryDate is provided in the request
      const today = new Date(); // get the current date and time
      const expDate = new Date(data.expiryDate); // convert the expiryDate string to a Date object
      if (expDate < today.setHours(0, 0, 0, 0)) { // compare expiryDate with today's date at midnight
        return res.status(400).json({ error: "Expiry date must be today or later" }); // if expiry date is in the past, return 400 error
      }
    }

    if (req.file) { // check if an image file was uploaded
      data.image = req.file.filename; // assign uploaded image filename to data.image
    }

    const product = await Product.create(data); // create and save the new product in the database
    res.status(201).json(product); // send back the created product with 201 (Created) status
  } catch (err) { // if an error occurs
    res.status(400).json({ error: err.message }); // send 400 (Bad Request) and return the error message
  }
};

// Get all products
export const getProducts = async (req, res) => { // define controller to fetch all products
  try { // start try block
    // Check if request is from admin (you'll need to implement proper auth later)
    const isAdmin = req.query.admin === 'true';
    
    // If not admin, only show public products
    const query = isAdmin ? {} : { visibility: "public" };
    
    const products = await Product.find(query).sort("-createdAt"); // query filtered products and sort them
    res.json(products); // return the filtered list of products as JSON
  } catch (err) { // catch any error
    res.status(500).json({ error: err.message }); // return 500 (Server Error) with the error message
  }
};

// Get single product
export const getProduct = async (req, res) => { // define controller to fetch one product
  try { // start try block
    const product = await Product.findById(req.params.id); // find a product by its ID from the URL params
    if (!product) return res.status(404).json({ error: "Not found" }); // if product not found, return 404
    res.json(product); // return the found product as JSON
  } catch (err) { // catch any error
    res.status(500).json({ error: err.message }); // return 500 (Server Error) with the error message
  }
};

// Update product (with image option)
export const updateProduct = async (req, res) => { // define controller to update an existing product
  try { // start try block
    const data = req.body; // get data from the request body
    if (req.file) { // check if a new image file was uploaded
      data.image = req.file.filename; // set the new image filename in data
    }
    if (data.expiryDate) { // check if expiryDate is provided
      const today = new Date(); // get current date
      const expDate = new Date(data.expiryDate); // convert expiryDate string to Date object
      if (expDate < today.setHours(0, 0, 0, 0)) { // validate expiry date is not in the past
        return res.status(400).json({ error: "Expiry date must be today or later" }); // return 400 if invalid
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true }); // update product by ID and return the updated document
    if (!product) return res.status(404).json({ error: "Not found" }); // if no product found, return 404
    res.json(product); // return the updated product
  } catch (err) { // catch errors
    res.status(400).json({ error: err.message }); // return 400 with error message
  }
};

// Delete product
export const deleteProduct = async (req, res) => { // define controller to delete a product
  try { // start try block
    await Product.findByIdAndDelete(req.params.id); // find product by ID and delete it
    res.json({ message: "Deleted" }); // return success message
  } catch (err) { // catch errors
    res.status(500).json({ error: err.message }); // return 500 with error message
  }
};

// Update stock levels
export const updateStock = async (req, res) => { // define controller to update stock, safety stock, reorder level
  try { // start try block
    const { stock, safetyStock, reorderLevel } = req.body; // destructure stock values from request body
    const product = await Product.findById(req.params.id); // find the product by ID
    
    if (!product) { // if no product found
      return res.status(404).json({ error: "Product not found" }); // return 404 error
    }

    if (stock < 0) { // validate stock is not negative
      return res.status(400).json({ error: "Stock cannot be negative" }); // return 400 if invalid
    }

    if (safetyStock < 0) { // validate safety stock is not negative
      return res.status(400).json({ error: "Safety stock cannot be negative" }); // return 400 if invalid
    }

    if (reorderLevel < 0) { // validate reorder level is not negative
      return res.status(400).json({ error: "Reorder level cannot be negative" }); // return 400 if invalid
    }

    const updatedProduct = await Product.findByIdAndUpdate( // update the product in the database
      req.params.id, // the ID from request params
      { stock, safetyStock, reorderLevel }, // fields to update
      { new: true } // return the updated document instead of the old one
    );

    res.json(updatedProduct); // return the updated product as JSON
  } catch (err) { // catch errors
    res.status(400).json({ error: err.message }); // return 400 with error message
  }
};

// Get inventory status
export const getInventoryStatus = async (req, res) => { // define controller to get stock status for all products
  try { // start try block
    const products = await Product.find().select('name stock safetyStock reorderLevel availableStock'); 
    // fetch all products but only select specific fields

    const inventoryStatus = products.map(product => ({ // map over products to format inventory info
      id: product._id, // product ID
      name: product.name, // product name
      actualStock: product.stock, // actual stock count
      safetyStock: product.safetyStock, // safety stock value
      reorderLevel: product.reorderLevel, // reorder level value
      availableStock: product.availableStock, // virtual field for available stock
      needsReorder: product.stock <= product.reorderLevel, // true if stock is at or below reorder level
      belowSafetyStock: product.stock <= product.safetyStock // true if stock is at or below safety stock
    }));

    res.json(inventoryStatus); // return inventory status list
  } catch (err) { // catch errors
    res.status(500).json({ error: err.message }); // return 500 with error message
  }
};
