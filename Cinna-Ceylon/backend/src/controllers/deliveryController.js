// controllers/deliveryController.js
import Delivery from "../models/delivery.js";
import Product from "../models/Product.js";
import { sendDeliveryStatusEmail } from "../utils/emailSender.js";

// Helper function to get buyer email and order details from delivery
export async function getBuyerEmailAndOrderDetails(delivery) {
  let buyerEmail = null;
  let buyerName = 'Valued Customer';
  let orderDetails = null;
  
  console.log('🔍 Searching for buyer email and order details...');
  console.log(`📋 Delivery ID: ${delivery._id}`);
  console.log(`📋 Delivery has email field: ${!!delivery.email}`);
  console.log(`📋 Delivery has order: ${!!delivery.order}`);
  
  // First priority: Check delivery record email
  if (delivery.email) {
    buyerEmail = delivery.email;
    buyerName = delivery.firstName && delivery.lastName 
      ? `${delivery.firstName} ${delivery.lastName}` 
      : buyerName;
    console.log(`📧 Found email in delivery record: ${buyerEmail}`);
  }
  
  // Get order details if available
  if (delivery.order) {
    console.log(`📦 Order ID: ${delivery.order._id || delivery.order}`);
    
    // Populate order with items and product details
    await delivery.populate({
      path: 'order',
      populate: {
        path: 'items.product',
        select: 'name price sku'
      }
    });
    
    console.log(`📦 Order populated successfully: ${!!delivery.order.items}`);
    console.log(`📦 Order has shipping address: ${!!delivery.order.shippingAddress}`);
    console.log(`📦 Shipping address has email: ${!!delivery.order.shippingAddress?.email}`);
    
    orderDetails = {
      items: delivery.order.items,
      total: delivery.order.total,
      shippingAddress: delivery.order.shippingAddress,
      paymentMethod: delivery.order.paymentMethod
    };
    
    // If no email found yet, try order shipping address
    if (!buyerEmail && delivery.order.shippingAddress && delivery.order.shippingAddress.email) {
      buyerEmail = delivery.order.shippingAddress.email;
      buyerName = delivery.order.shippingAddress.firstName && delivery.order.shippingAddress.lastName
        ? `${delivery.order.shippingAddress.firstName} ${delivery.order.shippingAddress.lastName}`
        : buyerName;
      console.log(`📧 Found email in order shipping: ${buyerEmail}`);
    }
    
    // Last resort: try user account
    if (!buyerEmail && delivery.order.user && delivery.order.user !== 'default') {
      try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(delivery.order.user);
        if (user && user.email) {
          buyerEmail = user.email;
          buyerName = user.profile && user.profile.name 
            ? user.profile.name 
            : user.username || buyerName;
          console.log(`📧 Found email in user account: ${buyerEmail}`);
        }
      } catch (err) {
        console.log('⚠️ Could not fetch user details:', err.message);
      }
    }
  }
  
  console.log(`✅ Final result - Email: ${buyerEmail || 'NOT FOUND'}, Name: ${buyerName}, Order details: ${orderDetails ? 'Available' : 'Not found'}`);
  
  if (!buyerEmail) {
    console.log('❌ NO BUYER EMAIL FOUND! Checked:');
    console.log(`   - Delivery email field: ${delivery.email || 'EMPTY'}`);
    console.log(`   - Order shipping email: ${delivery.order?.shippingAddress?.email || 'EMPTY'}`);
    console.log(`   - User account email: Attempted lookup`);
  }
  
  return { buyerEmail, buyerName, orderDetails };
}

// CREATE
export const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json(delivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getDeliveries = async (req, res) => {
  try {
    // Check if filtering by driver from query params
    const { driver } = req.query;
    let query = {};
    
    if (driver) {
      query.driver = driver;
    }
    
    const deliveries = await Delivery.find(query)
      .populate("vehicle")
      .populate("driver", "username email profile")
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "username email"
        }
      })
      .sort({ createdAt: -1 });
      
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("vehicle");
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateDelivery = async (req, res) => {
  try {
    const oldDelivery = await Delivery.findById(req.params.id);
    if (!oldDelivery) return res.status(404).json({ message: "Delivery not found" });
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('vehicle').populate('order').populate('driver', 'username email profile');
    
    // Check if status changed and send email notification
    const newStatus = req.body.status;
    if (newStatus && newStatus !== oldDelivery.status) {
      console.log(`🔄 Status changed from ${oldDelivery.status} to ${newStatus} for delivery ${delivery._id}`);
      
      // Send email notifications for important status changes
      if (newStatus === 'accepted' || newStatus === 'in-transit' || newStatus === 'delivered' || newStatus === 'completed') {
        try {
          const { buyerEmail, buyerName, orderDetails } = await getBuyerEmailAndOrderDetails(delivery);
          
          const emailResult = await sendDeliveryStatusEmail(buyerEmail, buyerName, newStatus, orderDetails);
          
          if (emailResult.success) {
            console.log(`✅ ${newStatus} email sent successfully: ${emailResult.message}`);
          } else {
            console.log(`⚠️ ${newStatus} email skipped: ${emailResult.message}`);
          }
        } catch (emailErr) {
          console.error(`Email process error for ${newStatus}:`, emailErr.message);
        }
      }
    }
    
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json({ message: "Delivery deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign driver and vehicle
export const assignDriverVehicle = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, vehicle: vehicleId, status: "assigned" },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update buyer details
export const updateBuyerDetails = async (req, res) => {
  try {
    const updateFields = (({ firstName, lastName, email, houseNo, postalCode, phoneNumber, vehicle }) => ({ firstName, lastName, email, houseNo, postalCode, phoneNumber, vehicle }))(req.body);
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json({ message: "Buyer details updated!", delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Driver accepts delivery
export const driverAcceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", acceptedAt: new Date() },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    
    // Get buyer email and order details, then send notification
    try {
      const { buyerEmail, buyerName, orderDetails } = await getBuyerEmailAndOrderDetails(delivery);
      
      const emailResult = await sendDeliveryStatusEmail(buyerEmail, buyerName, "accepted", orderDetails);
      
      if (emailResult.success) {
        console.log(`✅ Acceptance email sent successfully: ${emailResult.message}`);
      } else {
        console.log(`⚠️ Email notification skipped: ${emailResult.message}`);
      }
    } catch (emailErr) {
      // Log but don't block response
      console.error("Email process error:", emailErr.message);
    }
    
    res.json({ message: "Delivery accepted!", delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ deliveries for a specific driver
export const getDeliveriesByDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    console.log(`🚚 Fetching deliveries for driver ID: ${driverId}`);
    
    // Query deliveries for this specific driver
    const deliveries = await Delivery.find({ driver: driverId })
      .populate('vehicle')
      .populate({
        path: 'order',
        populate: {
          path: 'user',
          select: 'username email'
        }
      })
      .populate('driver', 'username email profile')
      .sort({ createdAt: -1 }); // Most recent first
      
    console.log(`📦 Found ${deliveries.length} deliveries for driver ${driverId}`);
    
    // Log first delivery for debugging (if exists)
    if (deliveries.length > 0) {
      console.log(`📋 Sample delivery:`, {
        id: deliveries[0]._id,
        status: deliveries[0].status,
        customer: `${deliveries[0].firstName} ${deliveries[0].lastName}`,
        vehicle: deliveries[0].vehicle?.vehicleType,
        hasOrder: !!deliveries[0].order
      });
    }
    
    res.json(deliveries);
  } catch (error) {
    console.error(`❌ Error fetching deliveries for driver ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// Send notification email for delivery status update
export const notifyDeliveryStatusUpdate = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { status } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    
    // Get buyer email and order details using enhanced detection
    try {
      const { buyerEmail, buyerName, orderDetails } = await getBuyerEmailAndOrderDetails(delivery);
      
      const emailResult = await sendDeliveryStatusEmail(buyerEmail, buyerName, status, orderDetails);
      
      if (emailResult.success) {
        console.log(`✅ ${status} notification sent successfully: ${emailResult.message}`);
        res.json({ 
          message: "Notification sent successfully", 
          emailSent: emailResult.recipient,
          details: emailResult.message
        });
      } else {
        console.log(`⚠️ ${status} notification skipped: ${emailResult.message}`);
        res.json({ 
          message: "Notification was skipped", 
          reason: emailResult.message,
          recommendation: emailResult.recommendation
        });
      }
      
    } catch (emailErr) {
      console.error("Email process error:", emailErr);
      res.status(500).json({ 
        message: "Email process failed", 
        error: emailErr.message 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update delivery status by driver
export const updateDeliveryStatus = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { status, notes } = req.body;
    
    // Validate status
    const allowedStatuses = ['assigned', 'accepted', 'in-transit', 'on-delivery', 'delivered', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}` 
      });
    }

    const updateData = { status };
    
    // Add timestamp based on status
    if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'in-transit' || status === 'on-delivery') {
      updateData.startedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId, 
      updateData, 
      { new: true }
    ).populate('vehicle').populate('order').populate('driver', 'username email profile');
    
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Send email notifications for important status changes
    if (status === 'accepted' || status === 'in-transit' || status === 'delivered' || status === 'completed') {
      try {
        const { buyerEmail, buyerName, orderDetails } = await getBuyerEmailAndOrderDetails(delivery);
        
        const emailResult = await sendDeliveryStatusEmail(buyerEmail, buyerName, status, orderDetails);
        
        if (emailResult.success) {
          console.log(`✅ ${status} email sent successfully: ${emailResult.message}`);
        } else {
          console.log(`⚠️ ${status} email skipped: ${emailResult.message}`);
        }
      } catch (emailErr) {
        console.error(`Email process error for ${status}:`, emailErr.message);
      }
    }

    res.json({
      message: `Delivery status updated to ${status}`,
      delivery
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
