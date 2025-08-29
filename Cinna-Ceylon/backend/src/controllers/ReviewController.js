import Review from '../models/Review.js';

// Create review
export const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('product');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
