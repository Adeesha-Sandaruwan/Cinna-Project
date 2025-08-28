const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  Review_id: { type: String, required: true, unique: true, index: true },
  Rating: { type: Number },
  Comment: { type: String },
  image: { type: String },
  Buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  Order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


