import jsPDF from 'jspdf';
import logo from '../assets/images/logo.png';

export const generateReceiptPDF = (orderDetails, cart) => {
  const doc = new jsPDF();

  const addHeader = () => {
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', 85, 15, 35, 35);

    doc.setFontSize(22);
    doc.setTextColor("#CC7722");
    doc.text("Cinna Ceylon", 105, 65, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text("Premium Ceylon Cinnamon Products", 105, 72, { align: "center" });
    doc.text("123 Spice Road, Colombo, Sri Lanka", 105, 77, { align: "center" });
    doc.text("Tel: +94 11 234 5678 | Email: info@cinnaceylon.com", 105, 82, { align: "center" });

    doc.setDrawColor("#CC7722");
    doc.setLineWidth(0.5);
    doc.line(20, 90, 190, 90);
  };

  addHeader();

  // Order details
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Order Details", 20, 105);

  // Use a y-position pointer to avoid overlapping lines
  let detailsY = 115;
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text(`Order ID: ${orderDetails._id}`, 20, detailsY);
  detailsY += 7;

  // Include Customer / User ID if available
  const customerId = orderDetails.user && (orderDetails.user._id || orderDetails.user);
  if (customerId) {
    doc.text(`Customer ID: ${customerId}`, 20, detailsY);
    detailsY += 7;
  }

  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, detailsY);
  detailsY += 7;
  doc.text(`Payment Method: ${orderDetails.paymentMethod}`, 20, detailsY);
  detailsY += 7;
  doc.text(`Status: ${orderDetails.status}`, 20, detailsY);

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

  // Order Summary
  doc.setFontSize(14);
  doc.setTextColor("#CC7722");
  doc.text("Order Summary", 20, 204);

  // Table headers
  doc.setFontSize(10);
  doc.setTextColor("#666666");
  doc.text("Item", 20, 214);
  doc.text("Quantity", 130, 214);
  doc.text("Price (LKR)", 170, 214);

  doc.setDrawColor("#CC7722");
  doc.line(20, 217, 190, 217);

  // Merge products and offers
  let allItems = [];

  if (cart.items) {
    allItems = [
      ...allItems,
      ...cart.items.map(i => ({
        name: i.product.name,
        qty: i.qty,
        price: i.priceAtAdd || i.product.price,
      }))
    ];
  }

  if (cart.offerItems) {
    allItems = [
      ...allItems,
      ...cart.offerItems.map(i => ({
        name: `${i.offer.name} (Bundle)`,
        qty: i.qty,
        price: i.discountedPrice || i.offer.discountedPrice,
        savings: (i.originalPrice || i.offer.products.reduce((sum, p) => sum + p.price, 0)) - (i.discountedPrice || i.offer.discountedPrice)
      }))
    ];
  }

  let yPos = 224;
  allItems.forEach(item => {
    if (yPos > 250) {
      doc.addPage();
      addHeader();
      yPos = 105;

      doc.setFontSize(10);
      doc.setTextColor("#666666");
      doc.text("Item", 20, yPos);
      doc.text("Quantity", 130, yPos);
      doc.text("Price (LKR)", 170, yPos);
      doc.setDrawColor("#CC7722");
      doc.line(20, yPos + 3, 190, yPos + 3);
      yPos += 10;
    }

    doc.setTextColor("#000000");
    doc.text(item.name, 20, yPos);
    doc.text(item.qty.toString(), 130, yPos);
    doc.text((item.qty * item.price).toLocaleString(), 170, yPos);

    if (item.savings) {
      doc.setFontSize(8);
      doc.setTextColor("green");
      doc.text(`You saved: LKR ${item.savings.toLocaleString()}`, 20, yPos + 6);
      doc.setFontSize(10);
      yPos += 6;
    }

    yPos += 10;
  });

  if (yPos > 250) {
    doc.addPage();
    addHeader();
    yPos = 105;
  }

  // Total
  doc.setDrawColor("#CC7722");
  doc.line(20, yPos + 3, 190, yPos + 3);
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  doc.text("Delivery Cost:", 130, yPos + 13);
  doc.text("Free", 170, yPos + 13);

  doc.setFontSize(12);
  doc.setTextColor("#CC7722");
  doc.text("Total:", 130, yPos + 23);
  doc.text(`LKR ${orderDetails.total.toLocaleString()}`, 170, yPos + 23);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor("#666666");
  doc.text("Thank you for choosing Cinna Ceylon - Your Premium Ceylon Cinnamon Source", 105, 270, { align: "center" });
  doc.text("www.cinnaceylon.com", 105, 275, { align: "center" });

  doc.save(`CinnaCeylon-Receipt-${orderDetails._id}.pdf`);
};
