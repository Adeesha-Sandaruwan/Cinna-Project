import Product from "../models/Product.js";

// Marks all products whose expiryDate is before start of today as private.
// Returns the number of products updated.
export const privatizeExpiredProductsAtStartup = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const result = await Product.updateMany(
    { expiryDate: { $lt: todayStart }, visibility: "public" },
    { $set: { visibility: "private" } }
  );
  return result.modifiedCount || 0;
};

export default privatizeExpiredProductsAtStartup;