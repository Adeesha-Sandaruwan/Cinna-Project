const mongoose = require('mongoose');

const supplyRecordSchema = new mongoose.Schema({
    Supply_Id: { type: String, required: true, unique: true, index: true },
    Price: { type: Number },
    Cinnamon_Type: { type: String },
    Quantity: { type: Number },
    Documents: { type: String },
    Status: { type: String },
    Harvest_Date: { type: Date },
    Date: { type: Date },
    Supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    Pay_ID: { type: String }
});

const SupplyRecord = mongoose.model('Supply_Record', supplyRecordSchema);

module.exports = SupplyRecord;