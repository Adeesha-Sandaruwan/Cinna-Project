import mongoose from 'mongoose';

// Drops known-bad indexes and ensures required ones exist
export default async function ensureIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const reviews = db.collection('reviews');
    const indexes = await reviews.indexes();
    const names = indexes.map(i => i.name);

    // Drop stray unique index on Review_id if present
    if (names.includes('Review_id_1')) {
      try {
        await reviews.dropIndex('Review_id_1');
        console.log('🧹 Dropped stray index: reviews.Review_id_1');
      } catch (e) {
        console.warn('⚠️ Failed to drop reviews.Review_id_1:', e.message);
      }
    }

    // Ensure the intended unique compound index exists
    if (!names.includes('productId_1_userId_1')) {
      try {
        await reviews.createIndex({ productId: 1, userId: 1 }, { unique: true, name: 'productId_1_userId_1' });
        console.log('✅ Ensured index: reviews.productId_1_userId_1 (unique)');
      } catch (e) {
        console.warn('⚠️ Failed to create reviews.productId_1_userId_1:', e.message);
      }
    }
  } catch (err) {
    console.warn('⚠️ ensureIndexes encountered an error:', err.message);
  }
}
