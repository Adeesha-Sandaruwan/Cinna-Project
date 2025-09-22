import Offer from '../models/Offer.js';

// Get all offers
export const getAllOffers = async (req, res) => {
  try {
    // Update expired offers first
    await Offer.updateExpiredOffers();
    
    const offers = await Offer.find()
      .populate('products', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single offer
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
export const createOffer = async (req, res) => {
  try {
    const { name, description, products, discountedPrice, expiryDate, status, image } = req.body;
    
    // Validate products array
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

// Update offer
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

// Delete offer
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