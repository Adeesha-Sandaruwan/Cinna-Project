import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Enhanced email sender with product purchase details
export const sendDeliveryStatusEmail = async (to, buyerName, status, orderDetails = null) => {
  try {
    // Enhanced debugging for email validation
    console.log('🔍 EMAIL VALIDATION DEBUG:');
    console.log(`   - to parameter: ${to} (type: ${typeof to})`);
    console.log(`   - buyerName: ${buyerName}`);
    console.log(`   - status: ${status}`);
    console.log(`   - orderDetails: ${orderDetails ? 'Available' : 'null'}`);
    
    // Validate email address with better error reporting and fallback
    if (!to) {
      console.log('❌ No email address provided (undefined/null)');
      console.log('🔧 SOLUTION: The calling function should use getBuyerEmailAndOrderDetails() to find buyer email');
      console.error('CALL STACK:', new Error().stack);
      
      // Instead of throwing an error, return gracefully with a log message
      console.log('⚠️ Email notification skipped - no recipient email found');
      return { 
        success: false, 
        message: 'No email address provided. Email notification was skipped.',
        recommendation: 'Ensure the order has a shippingAddress.email or delivery record has buyer email'
      };
    }
    
    if (typeof to !== 'string' || !to.includes('@')) {
      console.log('❌ Invalid email format:', to);
      console.log('🔧 SOLUTION: Email must be a valid string containing @ symbol');
      console.error('CALL STACK:', new Error().stack);
      
      // Return gracefully instead of throwing
      console.log('⚠️ Email notification skipped - invalid email format');
      return { 
        success: false, 
        message: `Invalid email format: ${to}. Email notification was skipped.`,
        recommendation: 'Provide a valid email address in format: user@domain.com'
      };
    }

    const transporter = createTransporter();
    
    // Create email content based on status
    const emailContent = createEmailContent(status, buyerName, orderDetails);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@cinnaceylon.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    console.log(`📧 Sending ${status} email to: ${to} (${buyerName})`);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!', result.messageId);
    return { 
      success: true, 
      messageId: result.messageId,
      message: `Email sent successfully to ${to}`,
      recipient: to
    };
    
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    console.log('🔧 Email service error - continuing without email notification');
    return { 
      success: false, 
      message: `Email send failed: ${error.message}`,
      error: error.message,
      recommendation: 'Check email configuration and network connectivity'
    };
  }
};

// Create email content with product details
const createEmailContent = (status, buyerName, orderDetails) => {
  const productsList = orderDetails?.items?.map(item => 
    `<li style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
      <strong>${item.product?.name || 'Product'}</strong><br/>
      <span style="color: #666;">Quantity: ${item.qty} | Price: LKR ${item.price}</span>
    </li>`
  ).join('') || '';

  const orderSummary = orderDetails ? `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #333; margin: 0 0 10px 0;">Your Order Details:</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${productsList}
      </ul>
      <div style="border-top: 2px solid #8B4513; margin-top: 15px; padding-top: 10px;">
        <strong style="font-size: 16px; color: #8B4513;">Total: LKR ${orderDetails.total}</strong>
      </div>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        <strong>Shipping Address:</strong><br/>
        ${orderDetails.shippingAddress?.firstName} ${orderDetails.shippingAddress?.lastName}<br/>
        ${orderDetails.shippingAddress?.address}, ${orderDetails.shippingAddress?.city}<br/>
        ${orderDetails.shippingAddress?.postalCode} | Phone: ${orderDetails.shippingAddress?.phone}
      </p>
    </div>
  ` : '';

  const baseStyle = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #8B4513 0%, #D2B48C 100%); padding: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌿 Cinna Ceylon 🌿</h1>
        <p style="color: #FFF8DC; margin: 5px 0 0 0; font-size: 16px;">Premium Ceylon Cinnamon Products</p>
      </div>
      <div style="padding: 30px;">
  `;

  const footerStyle = `
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 3px solid #8B4513;">
        <p style="margin: 0; color: #666; font-size: 14px;">Thank you for choosing Cinna Ceylon!</p>
        <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">🌿 Authentic Ceylon Cinnamon | Premium Quality | Direct from Sri Lanka 🌿</p>
      </div>
    </div>
  `;

  switch (status) {
    case 'accepted':
      return {
        subject: '🚚 Your Cinna Ceylon Order is Accepted - Driver Assigned!',
        html: baseStyle + `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #28a745; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 18px;">
              ✅ Order Accepted
            </div>
          </div>
          <h2 style="color: #8B4513; margin-bottom: 15px;">Hello ${buyerName}! 👋</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your Cinna Ceylon order has been <strong>accepted by our delivery driver</strong> and is now being prepared for delivery! 🎉
          </p>
          ${orderSummary}
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #155724; margin: 0 0 10px 0;">📦 What happens next?</h3>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Your order is being prepared by our team</li>
              <li>Our driver will be on the way soon</li>
              <li>You'll receive another update when delivery starts</li>
              <li>Expected delivery within 24-48 hours</li>
            </ul>
          </div>
          <p style="color: #666; font-style: italic; margin-top: 25px;">
            We'll keep you updated on your delivery progress. Thank you for your patience! 🙏
          </p>
        ` + footerStyle
      };

    case 'in-transit':
    case 'on-delivery':
      return {
        subject: '🚛 Your Cinna Ceylon Order is On the Way - Delivery in Progress!',
        html: baseStyle + `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #ff8c00; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 18px;">
              🚛 Out for Delivery
            </div>
          </div>
          <h2 style="color: #8B4513; margin-bottom: 15px;">Hello ${buyerName}! 👋</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Exciting update! Your Cinna Ceylon order is now <strong>on the way to you</strong>! Our delivery driver has started the journey to bring your premium cinnamon products right to your door! 🚚💨
          </p>
          ${orderSummary}
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ff8c00; margin: 20px 0;">
            <h3 style="color: #b8860b; margin: 0 0 10px 0;">🚚 Delivery Progress:</h3>
            <ul style="color: #b8860b; margin: 0; padding-left: 20px;">
              <li><strong>✅ Order prepared</strong> - Your products are packed and ready</li>
              <li><strong>🚛 Out for delivery</strong> - Driver is on the way to you</li>
              <li><strong>⏰ Expected soon</strong> - Delivery within a few hours</li>
              <li><strong>📞 Stay available</strong> - Driver may contact you if needed</li>
            </ul>
          </div>
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="color: #004085; margin: 0 0 10px 0;">📞 Important Delivery Tips:</h3>
            <ul style="color: #004085; margin: 0; padding-left: 20px;">
              <li>Please keep your phone available for driver contact</li>
              <li>Ensure someone is available at the delivery address</li>
              <li>Have exact change ready if paying on delivery</li>
              <li>Check products upon delivery for quality assurance</li>
            </ul>
          </div>
          <p style="color: #666; font-style: italic; margin-top: 25px;">
            We're almost there! Thank you for choosing Cinna Ceylon! 🌿
          </p>
        ` + footerStyle
      };

    case 'delivered':
    case 'completed':
      return {
        subject: '🎉 Your Cinna Ceylon Order Has Been Delivered Successfully!',
        html: baseStyle + `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #28a745; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 18px;">
              🎉 Delivered Successfully
            </div>
          </div>
          <h2 style="color: #8B4513; margin-bottom: 15px;">Hello ${buyerName}! 👋</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Wonderful! Your Cinna Ceylon order has been <strong>successfully delivered</strong>! We hope you enjoy your premium Ceylon cinnamon products! ✨
          </p>
          ${orderSummary}
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #856404; margin: 20px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🌟 Enjoy Your Purchase!</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Store cinnamon products in cool, dry places</li>
              <li>Check expiry dates for optimal freshness</li>
              <li>Explore recipes and usage tips on our website</li>
              <li>Share your experience with us!</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <p style="color: #8B4513; font-size: 18px; margin-bottom: 15px;">
              <strong>Rate Your Experience! ⭐</strong>
            </p>
            <p style="color: #666; margin: 0;">
              We'd love to hear about your Cinna Ceylon experience. Your feedback helps us serve you better!
            </p>
          </div>
        ` + footerStyle
      };

    default:
      return {
        subject: `📦 Cinna Ceylon Order Update - Status: ${status}`,
        html: baseStyle + `
          <h2 style="color: #8B4513;">Hello ${buyerName}!</h2>
          <p>Your Cinna Ceylon order status has been updated to: <strong>${status}</strong></p>
          ${orderSummary}
          <p style="color: #666; margin-top: 20px;">Thank you for your patience!</p>
        ` + footerStyle
      };
  }
};
