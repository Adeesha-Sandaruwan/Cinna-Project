import jsPDF from 'jspdf';
import logo from '../assets/images/logo.png';

export const generateReceiptPDF = (orderDetails, cart) => {
  const doc = new jsPDF();
  
  const addHeader = () => {
    // Add logo
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', 85, 15, 35, 35);
    
    // Company details
    doc.setFontSize(22);
    doc.setTextColor("#CC7722");
    doc.text("Cinna Ceylon", 105, 65, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text("Premium Ceylon Cinnamon Products", 105, 72, { align: "center" });
    doc.text("123 Spice Road, Colombo, Sri Lanka", 105, 77, { align: "center" });
    doc.text("Tel: +94 11 234 5678 | Email: info@cinnaceylon.com", 105, 82, { align: "center" });
    
    // Decorative line
    doc.setDrawColor("#CC7722");
    doc.setLineWidth(0.5);
    doc.line(20, 90, 190, 90);
  };

  // Add first page header
  addHeader();
  
  // Order details
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Order Details", 20, 105);
  
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text(`Order ID: ${orderDetails._id}`, 20, 115);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 122);
  doc.text(`Payment Method: ${orderDetails.paymentMethod}`, 20, 129);
  doc.text(`Status: ${orderDetails.status}`, 20, 136);
  
  // Shipping details
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Shipping Details", 20, 151);
  
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text(`${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}`, 20, 161);
  doc.text(orderDetails.shippingAddress.address, 20, 168);
  doc.text(`${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}`, 20, 175);
  doc.text(`Phone: ${orderDetails.shippingAddress.phone}`, 20, 182);
  doc.text(`Email: ${orderDetails.shippingAddress.email}`, 20, 189);
  
  // Order items
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Order Summary", 20, 204);
  
  // Table headers
  doc.setFontSize(10);
  doc.setTextColor("#666666");
  doc.text("Item", 20, 214);
  doc.text("Quantity", 130, 214);
  doc.text("Price (LKR)", 170, 214);
  
  // Decorative line
  doc.setDrawColor("#CC7722");
  doc.line(20, 217, 190, 217);
  
  // Items
  let yPos = 224;
  doc.setTextColor("#000000");
  
  cart.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      addHeader();
      yPos = 105; // Reset Y position after header
      
      // Add table headers on new page
      doc.setFontSize(10);
      doc.setTextColor("#666666");
      doc.text("Item", 20, yPos);
      doc.text("Quantity", 130, yPos);
      doc.text("Price (LKR)", 170, yPos);
      
      // Decorative line
      doc.setDrawColor("#CC7722");
      doc.line(20, yPos + 3, 190, yPos + 3);
      yPos += 10;
    }

    doc.setTextColor("#000000");
    doc.text(item.product.name, 20, yPos);
    doc.text(item.qty.toString(), 130, yPos);
    doc.text((item.qty * item.priceAtAdd).toLocaleString(), 170, yPos);
    yPos += 10;
  });
  
  // Add total on the current or new page
  if (yPos > 250) {
    doc.addPage();
    addHeader();
    yPos = 105;
  }
  
  // Total section
  doc.setDrawColor("#CC7722");
  doc.line(20, yPos + 3, 190, yPos + 3);
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text("Delivery Cost:", 130, yPos + 13);
  doc.text("Free", 170, yPos + 13);
  
  // Final Total
  doc.setFontSize(12);
  doc.setTextColor("#CC7722");
  doc.text("Total:", 130, yPos + 23);
  doc.text(`LKR ${orderDetails.total.toLocaleString()}`, 170, yPos + 23);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor("#666666");
  doc.text("Thank you for choosing Cinna Ceylon - Your Premium Ceylon Cinnamon Source", 105, 270, { align: "center" });
  doc.text("www.cinnaceylon.com", 105, 275, { align: "center" });
  
  // Save PDF
  doc.save(`CinnaCeylon-Receipt-${orderDetails._id}.pdf`);
};