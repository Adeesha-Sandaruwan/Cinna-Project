import Offer from '../models/Offer.js';

// Get all offers
// Updates expired offers, then returns all offers with product details
export const getAllOffers = async (req, res) => {
  try {
    // Update expired offers first
    await Offer.updateExpiredOffers();
    
    // Build query based on filter
    const filter = req.query.filter || 'all';
    let query = {};
    
    if (filter === 'active') {
      query.status = 'Active';
    } else if (filter === 'expired') {
      query.status = 'Expired';
    }

    const offers = await Offer.find(query)
      .populate('products', 'name price image')
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single offer by ID
// Returns offer with product details
export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('products', 'name price image description');

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new offer
// 1. products: must be non-empty array
// Other fields validated by Mongoose schema
// --- Calculation Logic ---
// discountedPrice is provided by frontend, no backend calculation
export const createOffer = async (req, res) => {
  try {
    const { name, description, products, discountedPrice, expiryDate, status, image } = req.body;

    // 1. Validate products array
    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'At least one product is required' });
    }

    const offer = new Offer({
      name,
      description,
      products,
      discountedPrice,
      expiryDate,
      status,
      image
    });

    await offer.save();
    await offer.populate('products', 'name price image');

    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update offer by ID
// Validates and updates offer, returns updated offer with product details
export const updateOffer = async (req, res) => {
  try {
    const { name, description, products, discountedPrice, expiryDate, status, image } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { name, description, products, discountedPrice, expiryDate, status, image },
      { new: true, runValidators: true }
    ).populate('products', 'name price image');

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete offer by ID
// Deletes offer and returns success message
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};