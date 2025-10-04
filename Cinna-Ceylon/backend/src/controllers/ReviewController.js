import Review from '../models/Review.js';
import mongoose from 'mongoose';

// Create review
export const createReview = async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    // Input validation
    if (!productId || !userId || !rating) {
      return res.status(400).json({ 
        error: "Missing required fields: productId, userId, and rating are required" 
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await Review.create({ productId, userId, rating, comment });
    const populatedReview = await Review.findById(review._id)
      .populate('productId', 'name price')
      .populate('userId', 'name email');
    
    res.status(201).json(populatedReview);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "You have already reviewed this product" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const { productId, userId, rating } = req.query;
    let filter = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (rating) filter.rating = parseInt(rating);

    const reviews = await Review.find(filter)
      .populate('productId', 'name price')
      .populate('userId', 'name email')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single review
export const getReview = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const review = await Review.findById(req.params.id)
      .populate('productId', 'name price')
      .populate('userId', 'name email');
    
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const { rating, comment } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id, 
      { rating, comment }, 
      { new: true }
    ).populate('productId', 'name price')
     .populate('userId', 'name email');
    
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
