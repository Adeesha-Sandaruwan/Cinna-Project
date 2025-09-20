// Email functionality - nodemailer not installed (temporarily disabled)
// import nodemailer from 'nodemailer';

// Temporary stub for email functionality
export const sendDeliveryStatusEmail = async (to, buyerName, status) => {
  console.log('📧 Email would be sent:');
  console.log('   To:', to);
  console.log('   Buyer:', buyerName);
  console.log('   Status:', status);
  console.log('⚠️ Note: Nodemailer not installed - email functionality disabled');
  return Promise.resolve();
};
