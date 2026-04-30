import { Parser } from 'json2csv';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import path from 'path';

/**
 * @desc    Export products to CSV
 * @route   GET /api/admin/export/products
 * @access  Admin
 */
export const exportProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('category', 'name').lean();
    
    const fields = ['_id', 'name', 'sku', 'price', 'stock', 'isActive', 'category.name'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(products);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Export orders to CSV
 * @route   GET /api/admin/export/orders
 * @access  Admin
 */
export const exportOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').lean();
    
    const mappedOrders = orders.map(o => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      userName: o.user?.name,
      userEmail: o.user?.email,
      totalPrice: o.totalPrice,
      status: o.status,
      isPaid: o.isPaid,
      createdAt: o.createdAt
    }));

    const fields = ['_id', 'orderNumber', 'userName', 'userEmail', 'totalPrice', 'status', 'isPaid', 'createdAt'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(mappedOrders);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Export users to CSV
 * @route   GET /api/admin/export/users
 * @access  Admin
 */
export const exportUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    
    const fields = ['_id', 'name', 'email', 'role', 'isActive', 'createdAt'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(users);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Generate Invoice PDF
 * @route   POST /api/admin/orders/:id/invoice
 * @access  Admin
 */
export const generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('CodeCommerce Invoice', 50, 57)
      .fontSize(10)
      .text(`Order Number: ${order.orderNumber}`, 200, 65, { align: 'right' })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 200, 80, { align: 'right' })
      .moveDown();

    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    
    doc
      .fontSize(12)
      .text('Bill To:', 50, 130)
      .fontSize(10)
      .text(order.shippingAddress?.street || 'N/A', 50, 145)
      .text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}`, 50, 160)
      .text(order.shippingAddress?.country || 'N/A', 50, 175)
      .moveDown();

    
    let invoiceTableTop = 220;
    
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, invoiceTableTop);
    doc.text('Unit Price', 280, invoiceTableTop, { width: 90, align: 'right' });
    doc.text('Quantity', 370, invoiceTableTop, { width: 90, align: 'right' });
    doc.text('Line Total', 400, invoiceTableTop, { align: 'right' });
    doc.moveTo(50, invoiceTableTop + 15).lineTo(550, invoiceTableTop + 15).stroke();

    doc.font('Helvetica');
    let position = invoiceTableTop + 30;

    order.orderItems.forEach((item) => {
      doc.text(item.name, 50, position);
      doc.text(`$${item.price.toFixed(2)}`, 280, position, { width: 90, align: 'right' });
      doc.text(item.quantity, 370, position, { width: 90, align: 'right' });
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 400, position, { align: 'right' });
      position += 20;
    });

    doc.moveTo(50, position + 10).lineTo(550, position + 10).stroke();

    
    const subtotalPosition = position + 30;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 380, subtotalPosition);
    doc.text(`$${order.itemsPrice.toFixed(2)}`, 400, subtotalPosition, { align: 'right' });

    const taxPosition = subtotalPosition + 20;
    doc.text('Tax:', 380, taxPosition);
    doc.text(`$${order.taxPrice.toFixed(2)}`, 400, taxPosition, { align: 'right' });

    const shippingPosition = taxPosition + 20;
    doc.text('Shipping:', 380, shippingPosition);
    doc.text(`$${order.shippingPrice.toFixed(2)}`, 400, shippingPosition, { align: 'right' });

    const totalPosition = shippingPosition + 20;
    doc.fontSize(14).text('Total:', 380, totalPosition);
    doc.text(`$${order.totalPrice.toFixed(2)}`, 400, totalPosition, { align: 'right' });

    doc.end();
  } catch (err) {
    next(err);
  }
};
