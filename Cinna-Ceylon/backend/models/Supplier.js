const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    Supplier_ID: { type: String, required: true, unique: true, index: true },
    Company_Name: { type: String },
    Updated_at: { type: Date },
    NIC: { type: String },
    Bank_Account: { type: String },
    Tax_ID: { type: String },
    Supplier_Name: { type: String }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;