const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  Product_ID: { type: String, required: true, unique: true, index: true },
  Status: { type: String },
  name: { type: String },
  Expiry_date: { type: Date },
  Manufacture_date: { type: Date },
  Category: { type: String },
  Description: { type: String },
  Unit_Price: { type: Number },
  image: { type: String },
});

const Product = mongoose.model('Product', productSchema);

export default Product;


