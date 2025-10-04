// controllers/deliveryController.js
import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Vehicle from "../models/vehicle.js";

// CREATE - Assign driver and vehicle to order
export const createDelivery = async (req, res) => {
  try {
    const { orderId, driverId, vehicleId, estimatedDelivery, notes } = req.body;

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ order: orderId });
    if (existingDelivery) {
      return res.status(400).json({ 
        message: "Delivery assignment already exists for this order",
        existingDelivery: existingDelivery._id
      });
    }

    // Validate driver exists and is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.userType !== 'driver') {
      return res.status(404).json({ message: "Driver not found or invalid" });
    }

    // Validate vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Create delivery assignment
    const delivery = await Delivery.create({
      order: orderId,
      driver: driverId,
      vehicle: vehicleId,
      estimatedDelivery,
      notes,
    });

    // Update order status
    await Order.findByIdAndUpdate(orderId, { 
      status: "assigned",
      updatedAt: new Date()
    });

    // Populate the delivery with related data
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('order')
      .populate('driver', 'username email profile')
      .populate('vehicle');

    res.status(201).json({
      message: "Delivery assigned successfully",
      delivery: populatedDelivery
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all deliveries
export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('order')
      .populate('driver', 'username email profile')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one delivery
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('order')
      .populate('driver', 'username email profile')
      .populate('vehicle');
    
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE delivery status
export const updateDelivery = async (req, res) => {
  try {
    const { status, estimatedDelivery, actualDelivery, notes } = req.body;
    
    // First find the delivery to check ownership
    const existingDelivery = await Delivery.findById(req.params.id).populate('driver');
    if (!existingDelivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Check if the user is the assigned driver or an admin
    const isAssignedDriver = existingDelivery.driver && existingDelivery.driver._id.toString() === req.user.id;
    const isAdmin = req.user.isAdmin;
    
    if (!isAssignedDriver && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update your own deliveries." });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    if (actualDelivery) updateData.actualDelivery = actualDelivery;
    if (notes) updateData.notes = notes;

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('order').populate('driver', 'username email profile').populate('vehicle');
    
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    
    // Update order status if delivery is completed
    if (status === 'delivered') {
      await Order.findByIdAndUpdate(delivery.order._id, { status: 'delivered' });
    }
    
    res.json({ message: "Delivery updated successfully", delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE delivery
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    
    // Reset order status back to pending
    await Order.findByIdAndUpdate(delivery.order, { status: 'pending' });
    
    res.json({ message: "Delivery deleted and order reset to pending" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get deliveries by driver with rate limiting
const driverRequestCache = new Map();
const RATE_LIMIT_MS = 1000; // 1 second between requests per driver

export const getDeliveriesByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Validate driver ID
    if (!driverId || driverId === 'undefined') {
      return res.status(400).json({ message: 'Valid driver ID is required' });
    }

    // Check if the user is requesting their own deliveries or is an admin
    const isOwnDeliveries = driverId === req.user.id;
    const isAdmin = req.user.isAdmin;
    
    if (!isOwnDeliveries && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only view your own deliveries." });
    }

    // Rate limiting per driver
    const now = Date.now();
    const lastRequest = driverRequestCache.get(driverId);
    
    if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
      return res.status(429).json({ 
        message: 'Too many requests. Please wait before making another request.',
        retryAfter: Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1000)
      });
    }
    
    driverRequestCache.set(driverId, now);

    console.log(`Fetching deliveries for driver: ${driverId}`);
    
    // Query with additional uniqueness constraints
    const deliveries = await Delivery.find({ 
      driver: driverId 
    })
      .populate({
        path: 'order',
        select: '_id shippingAddress firstName lastName total status createdAt'
      })
      .populate({
        path: 'vehicle',
        select: '_id vehicleType insuranceNo status'
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${deliveries.length} deliveries for driver ${driverId}`);
    
    // Remove any potential duplicates at the application level (extra safety)
    const uniqueDeliveries = deliveries.filter((delivery, index, self) => 
      index === self.findIndex(d => d._id.toString() === delivery._id.toString())
    );
    
    console.log(`After deduplication: ${uniqueDeliveries.length} deliveries`);
    
    res.json(uniqueDeliveries);
  } catch (error) {
    console.error('Error fetching deliveries by driver:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get available orders for assignment (not yet assigned)
export const getAvailableOrders = async (req, res) => {
  try {
    // Get all order IDs that are already assigned to deliveries
    const assignedDeliveries = await Delivery.find({}, 'order');
    const assignedOrderIds = assignedDeliveries.map(d => d.order);
    
    // Find orders that are not assigned and have status pending or paid
    const availableOrders = await Order.find({
      _id: { $nin: assignedOrderIds },
      status: { $in: ['pending', 'paid'] }
    }).sort({ createdAt: -1 });
    
    res.json(availableOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send email notification to buyer about delivery status
export const sendDeliveryNotification = async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryId = req.params.id;

    // Get delivery with populated order and buyer information
    const delivery = await Delivery.findById(deliveryId)
      .populate({
        path: 'order',
        select: 'user shippingAddress total _id'
      })
      .populate('driver', 'username profile')
      .populate('vehicle', 'vehicleType insuranceNo');

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Prepare email content based on status
    let subject, message;
    const customerName = delivery.order.shippingAddress?.firstName || 'Valued Customer';
    const orderId = delivery.order._id.toString().slice(-8);
    const driverName = delivery.driver?.profile?.name || delivery.driver?.username || 'Delivery Driver';
    const vehicleInfo = delivery.vehicle ? `${delivery.vehicle.vehicleType} (${delivery.vehicle.insuranceNo})` : 'Company Vehicle';

    switch (status) {
      case 'accepted':
        subject = `Order ${orderId} - Delivery Confirmed`;
        message = `Dear ${customerName},\n\nGreat news! Your order ${orderId} has been confirmed for delivery.\n\nDriver: ${driverName}\nVehicle: ${vehicleInfo}\n\nYour order is now being prepared for dispatch. You will receive another notification when the driver is on the way.\n\nThank you for your business!\n\nBest regards,\nCinnaCeylon Delivery Team`;
        break;
        
      case 'in-transit':
        subject = `Order ${orderId} - Out for Delivery`;
        message = `Dear ${customerName},\n\nYour order ${orderId} is now out for delivery!\n\nDriver: ${driverName}\nVehicle: ${vehicleInfo}\n\nPlease ensure someone is available to receive the delivery at your address:\n${delivery.order.shippingAddress?.address || 'Your registered address'}\n\nEstimated delivery: Today\n\nThank you for your patience!\n\nBest regards,\nCinnaCeylon Delivery Team`;
        break;
        
      case 'delivered':
        subject = `Order ${orderId} - Delivered Successfully`;
        message = `Dear ${customerName},\n\nExcellent! Your order ${orderId} has been delivered successfully.\n\nDelivered by: ${driverName}\nDelivery time: ${new Date().toLocaleString()}\n\nWe hope you enjoy your products! If you have any issues with your order, please contact our customer service.\n\nThank you for choosing CinnaCeylon!\n\nBest regards,\nCinnaCeylon Delivery Team`;
        break;
        
      default:
        subject = `Order ${orderId} - Status Update`;
        message = `Dear ${customerName},\n\nYour order ${orderId} status has been updated to: ${status}\n\nFor any questions, please contact our customer service.\n\nBest regards,\nCinnaCeylon Delivery Team`;
    }

    // Get customer email
    const customerEmail = delivery.order.shippingAddress?.email || delivery.order.user;

    if (customerEmail) {
      // Use the existing email service
      const { sendEmail } = await import('../utils/emailSender.js');
      await sendEmail(customerEmail, subject, message);
      
      res.json({ 
        message: "Email notification sent successfully",
        sentTo: customerEmail,
        status: status
      });
    } else {
      res.status(400).json({ message: "Customer email not found" });
    }

  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Error sending notification: " + error.message });
  }
};
