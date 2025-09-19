import DeliveryPayout from "../models/DeliveryPayout.js";
import Maintenance from "../models/maintenance.js";
import Emergency from "../models/emergency.js";
import Vehicle from "../models/vehicle.js";

// CREATE
export const createDeliveryPayout = async (req, res) => {
  try {
    const { referenceType, referenceId, ...payoutData } = req.body;
    
    // Verify the reference exists
    let reference;
    if (referenceType === "Maintenance") {
      reference = await Maintenance.findById(referenceId).populate('vehicle');
    } else if (referenceType === "Emergency") {
      reference = await Emergency.findById(referenceId).populate('vehicle');
    }
    
    if (!reference) {
      return res.status(404).json({ message: `${referenceType} record not found` });
    }
    
    // Create the payout
    const payout = await DeliveryPayout.create({
      referenceType,
      referenceId,
      ...payoutData
    });
    
    // Populate the payout with all necessary data
    const populatedPayout = await DeliveryPayout.findById(payout._id)
      .populate('vehicle', 'make model licensePlate')
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      });
    
    res.status(201).json(populatedPayout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all with filtering
export const getDeliveryPayouts = async (req, res) => {
  try {
    const { 
      referenceType, 
      paymentStatus, 
      startDate, 
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    
    if (referenceType) filter.referenceType = referenceType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      filter.payoutDate = {};
      if (startDate) filter.payoutDate.$gte = new Date(startDate);
      if (endDate) filter.payoutDate.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination info
    const total = await DeliveryPayout.countDocuments(filter);
    
    // Get paginated results
    const payouts = await DeliveryPayout.find(filter)
      .populate('vehicle', 'make model licensePlate')
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      })
      .sort({ payoutDate: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      docs: payouts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one
export const getDeliveryPayoutById = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findById(req.params.id)
      .populate('vehicle', 'make model licensePlate')
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      });
      
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateDeliveryPayout = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    )
    .populate('vehicle', 'make model licensePlate')
    .populate({
      path: 'referenceId',
      populate: {
        path: 'vehicle',
        select: 'make model licensePlate'
      }
    });
    
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    res.json(payout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteDeliveryPayout = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findByIdAndDelete(req.params.id);
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    res.json({ message: "Payout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available maintenance and emergency records for dropdown
export const getAvailableReferences = async (req, res) => {
  try {
    const { type, vehicleId } = req.query;
    
    let references = [];
    
    if (type === 'Maintenance') {
      references = await Maintenance.find(
        vehicleId ? { vehicle: vehicleId } : {}
      )
      .populate('vehicle', 'make model licensePlate')
      .select('description serviceDate serviceCost vehicle');
    } else if (type === 'Emergency') {
      references = await Emergency.find(
        vehicleId ? { vehicle: vehicleId } : {}
      )
      .populate('vehicle', 'make model licensePlate')
      .populate('driver', 'name')
      .select('description accidentDate vehicle driver');
    }
    
    res.json(references);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payout statistics
export const getPayoutStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.payoutDate = {};
      if (startDate) matchStage.payoutDate.$gte = new Date(startDate);
      if (endDate) matchStage.payoutDate.$lte = new Date(endDate);
    }
    
    const stats = await DeliveryPayout.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            referenceType: "$referenceType",
            paymentStatus: "$paymentStatus"
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.referenceType",
          statuses: {
            $push: {
              status: "$_id.paymentStatus",
              count: "$count",
              amount: "$totalAmount"
            }
          },
          totalCount: { $sum: "$count" },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};