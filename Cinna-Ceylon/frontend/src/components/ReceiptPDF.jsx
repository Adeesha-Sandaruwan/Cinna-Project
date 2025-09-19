import jsPDF from 'jspdf';

export const generateReceiptPDF = (orderDetails, cart) => {
  const doc = new jsPDF();
  
  // Company details
  doc.setFontSize(24);
  doc.setTextColor("#CC7722");
  doc.text("Cinna Ceylon", 105, 30, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor("#000000");
  doc.text("Premium Ceylon Cinnamon Products", 105, 40, { align: "center" });
  doc.text("123 Spice Road, Colombo, Sri Lanka", 105, 45, { align: "center" });
  doc.text("Tel: +94 11 234 5678 | Email: info@cinnaceylon.com", 105, 50, { align: "center" });
  
  // Decorative line
  doc.setDrawColor("#CC7722");
  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);
  
  // Order details
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Order Details", 20, 70);
  
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text(`Order ID: ${orderDetails._id}`, 20, 80);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 85);
  doc.text(`Payment Method: ${orderDetails.paymentMethod}`, 20, 90);
  doc.text(`Status: ${orderDetails.status}`, 20, 95);
  
  // Shipping details
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Shipping Details", 20, 110);
  
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text(`${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}`, 20, 120);
  doc.text(orderDetails.shippingAddress.address, 20, 125);
  doc.text(`${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}`, 20, 130);
  doc.text(`Phone: ${orderDetails.shippingAddress.phone}`, 20, 135);
  doc.text(`Email: ${orderDetails.shippingAddress.email}`, 20, 140);
  
  // Order items
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Order Summary", 20, 160);
  
  // Table headers
  doc.setFontSize(10);
  doc.setTextColor("#666666");
  doc.text("Item", 20, 170);
  doc.text("Quantity", 130, 170);
  doc.text("Price (LKR)", 170, 170);
  
  // Decorative line
  doc.setDrawColor("#CC7722");
  doc.line(20, 173, 190, 173);
  
  // Items
  let yPos = 180;
  doc.setTextColor("#000000");
  
  cart.items.forEach(item => {
    doc.text(item.product.name, 20, yPos);
    doc.text(item.qty.toString(), 130, yPos);
    doc.text((item.qty * item.priceAtAdd).toLocaleString(), 170, yPos);
    yPos += 7;
  });
  
  // Total
  doc.setDrawColor("#CC7722");
  doc.line(20, yPos + 3, 190, yPos + 3);
  doc.setFontSize(12);
  doc.setTextColor("#CC7722");
  doc.text("Total:", 130, yPos + 10);
  doc.text(`LKR ${orderDetails.total.toLocaleString()}`, 170, yPos + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor("#666666");
  doc.text("Thank you for choosing Cinna Ceylon - Your Premium Ceylon Cinnamon Source", 105, 270, { align: "center" });
  doc.text("www.cinnaceylon.com", 105, 275, { align: "center" });
  
  // Save PDF
  doc.save(`CinnaCeylon-Receipt-${orderDetails._id}.pdf`);
};