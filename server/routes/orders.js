import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

// POST create new order
router.post('/', async (req, res) => {
  try {
    const { items, total, customerName, customerEmail, customerContact } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Valid total is required' });
    }

    // Validate customer information
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!customerEmail || !customerEmail.trim()) {
      return res.status(400).json({ error: 'Customer email is required' });
    }
    if (!customerContact || !customerContact.trim()) {
      return res.status(400).json({ error: 'Customer contact is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create order with customer information
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (total, status, customerName, customerEmail, customerContact) VALUES (?, ?, ?, ?, ?)',
        [total, 'pending', customerName.trim(), customerEmail.trim(), customerContact.trim()]
      );
      
      const orderId = orderResult.insertId;
      
      // Create order items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price]
        );
      }
      
      await connection.commit();
      connection.release();
      
      // Fetch complete order
      const [orders] = await db.execute(
        `SELECT o.*, 
         JSON_ARRAYAGG(
           JSON_OBJECT(
             'id', oi.id,
             'productId', oi.productId,
             'quantity', oi.quantity,
             'price', oi.price
           )
         ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.orderId
         WHERE o.id = ?
         GROUP BY o.id`,
        [orderId]
      );
      
      res.status(201).json(orders[0]);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET all orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, 
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', oi.id,
           'productId', oi.productId,
           'quantity', oi.quantity,
           'price', oi.price,
           'product', JSON_OBJECT(
             'id', p.id,
             'name', p.name,
             'image', p.image
           )
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.orderId
       LEFT JOIN products p ON oi.productId = p.id
       GROUP BY o.id
       ORDER BY o.createdAt DESC`
    );
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await db.execute(
      `SELECT o.*, 
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', oi.id,
           'productId', oi.productId,
           'quantity', oi.quantity,
           'price', oi.price,
           'product', JSON_OBJECT(
             'id', p.id,
             'name', p.name,
             'image', p.image
           )
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.orderId
       LEFT JOIN products p ON oi.productId = p.id
       WHERE o.id = ?
       GROUP BY o.id`,
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(orders[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    res.json(orders[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;

