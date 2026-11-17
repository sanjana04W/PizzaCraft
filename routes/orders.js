const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading orders:', err);
    return [];
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing orders:', err);
    return false;
  }
}

/**
 * @route   GET /api/orders
 * @desc    Get orders (optional ?email= filter)
 */
router.get('/', (req, res) => {
  try {
    let orders = readOrders();
    const { email } = req.query;

    if (email) {
      orders = orders.filter(o => o.userEmail && o.userEmail.toLowerCase() === email.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Place a new pizza order
 */
router.post('/', (req, res) => {
  try {
    const { items, subtotal, tax, deliveryFee, discount, total, userEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    const orders = readOrders();
    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      items,
      subtotal: Number(subtotal) || 0,
      tax: Number(tax) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      status: 'Baking',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      userEmail: userEmail || 'guest@pizzacraft.com',
      estimatedMinutes: 25,
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    writeOrders(orders);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Chef has begun hand-stretching the sourdough.',
      order: newOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process order.' });
  }
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Advance status of an order
 */
router.patch('/:id/status', (req, res) => {
  try {
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const current = orders[orderIndex].status;
    let nextStatus = current;
    let nextMinutes = 0;

    if (current === 'Baking') {
      nextStatus = 'Out for Delivery';
      nextMinutes = 12;
    } else if (current === 'Out for Delivery') {
      nextStatus = 'Delivered';
      nextMinutes = 0;
    }

    orders[orderIndex].status = nextStatus;
    orders[orderIndex].estimatedMinutes = nextMinutes;
    writeOrders(orders);

    return res.status(200).json({
      success: true,
      message: `Order status advanced to "${nextStatus}".`,
      order: orders[orderIndex]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
