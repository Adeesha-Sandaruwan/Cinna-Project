import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Create review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    // Always trust authenticated user; support multiple token shapes
    const authUserId = req.user?.id || req.user?._id || req.user?.userId;
    const userId = authUserId || req.body.userId; // fallback for legacy clients

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

    // Verify user has at least one order containing this product
    const purchased = await Order.exists({
      user: userId,
      'items.product': productId
    });
    if (!purchased) {
      return res.status(403).json({ error: 'Only customers who purchased this product can review it' });
    }

    // Idempotent upsert: create or update the user's review for this product
    const upserted = await Review.findOneAndUpdate(
      { productId, userId },
      { $set: { rating, comment }, $setOnInsert: { isVerified: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const populatedReview = await Review.findById(upserted._id)
      .populate('productId', 'name price')
      .populate('userId', 'username email');
    // Update product summary (avg + count)
    await updateProductRating(productId);
    res.status(201).json(populatedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const { productId, userId, rating } = req.query;
    // Simple pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    let filter = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (rating) filter.rating = parseInt(rating);

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('productId', 'name price')
      .populate('userId', 'username email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
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
      .populate('userId', 'username email');
    
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

    // Ensure only review owner can update
    const existing = await Review.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Review not found' });
    const authUserId = req.user?.id || req.user?._id || req.user?.userId;
    if (authUserId && existing.userId.toString() !== String(authUserId)) {
      return res.status(403).json({ error: 'You can only update your own review' });
    }
    existing.rating = rating ?? existing.rating;
    existing.comment = comment ?? existing.comment;
    const saved = await existing.save();
    const review = await Review.findById(saved._id)
      .populate('productId', 'name price')
      .populate('userId', 'username email');
    await updateProductRating(existing.productId.toString());
    
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

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    const authUserId = req.user?.id || req.user?._id || req.user?.userId;
    if (authUserId && review.userId.toString() !== String(authUserId)) {
      return res.status(403).json({ error: 'You can only delete your own review' });
    }
    const productId = review.productId.toString();
    await review.deleteOne();
    await updateProductRating(productId);
    
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: recompute and persist average rating and count on a product
async function updateProductRating(productId) {
  try {
    const agg = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const { avg = 0, count = 0 } = agg[0] || {};
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round((avg || 0) * 10) / 10,
      ratingCount: count || 0
    }, { new: false });
  } catch (e) {
    // Log and continue; rating summary is non-critical
    console.warn('updateProductRating failed:', e.message);
  }
}
