import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

// POST add item to cart (session-based, for now we'll just validate products exist)
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }
    
    // Verify product exists
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND inStock = true',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found or out of stock' });
    }
    
    res.json({ 
      message: 'Product added to cart',
      product: products[0],
      quantity 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// GET validate cart items
router.post('/validate', async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    const validatedItems = [];
    for (const item of items) {
      const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [item.productId]
      );
      
      if (products.length > 0) {
        validatedItems.push({
          ...products[0],
          quantity: item.quantity
        });
      }
    }
    
    res.json(validatedItems);
  } catch (error) {
    console.error('Error validating cart:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

export default router;

