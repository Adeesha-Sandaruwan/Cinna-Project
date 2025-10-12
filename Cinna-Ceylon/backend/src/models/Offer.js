import mongoose from 'mongoose';
const offerSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true },
  description: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true}],
  discountedPrice: {type: Number, required: true, min: 0},
  expiryDate: {type: Date, required: true},
  status: {type: String, enum: ['Active', 'Expired'], default: 'Active'},
  image: {type: String, default: '' }
}, {timestamps: true
});
// Update status based on expiry date
offerSchema.pre('save', function(next) {
  if (this.expiryDate < new Date()) {
    this.status = 'Expired';
  }
  next();
});
// Pre-find hooks removed to allow fetching all offers including expired ones
// Static method to update expired offers
offerSchema.statics.updateExpiredOffers = async function() {
  await this.updateMany(
    { expiryDate: { $lt: new Date() }, status: 'Active' },
    { status: 'Expired' }
  );
};
const Offer = mongoose.model('Offer', offerSchema);
export default Offer;