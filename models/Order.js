/**
 * PizzaCraft - Order Mongoose Model
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: 'Medium' },
    crust: { type: String, default: 'Classic' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'],
      default: 'Order Placed'
    },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    estimatedDelivery: { type: String, default: '30-45 mins' },
    specialInstructions: { type: String, default: '' }
  },
  { timestamps: true }
);

orderSchema.virtual('id').get(function () {
  return this._id.toString();
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
