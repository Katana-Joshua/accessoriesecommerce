import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const { featured, category, categoryId } = req.query;
    let query = 'SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM products p LEFT JOIN categories c ON p.categoryId = c.id';
    const conditions = [];
    const params = [];

    if (featured === 'true') {
      conditions.push('p.featured = ?');
      params.push(1);
    }

    if (categoryId) {
      conditions.push('p.categoryId = ?');
      params.push(categoryId);
    } else if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.createdAt DESC';

    const [products] = await db.execute(query, params);
    
    // Convert boolean values and encode images to base64
    const formattedProducts = products.map(product => {
      const productData = {
        ...product,
        featured: Boolean(product.featured),
        inStock: Boolean(product.inStock),
      };
      
      // Convert BLOB to base64 if image exists
      if (product.image && Buffer.isBuffer(product.image)) {
        productData.image = `data:image/jpeg;base64,${product.image.toString('base64')}`;
      }
      
      return productData;
    });
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute(
      'SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = products[0];
    const productData = {
      ...product,
      featured: Boolean(product.featured),
      inStock: Boolean(product.inStock),
    };
    
    // Convert BLOB to base64 if image exists
    if (product.image && Buffer.isBuffer(product.image)) {
      productData.image = `data:image/jpeg;base64,${product.image.toString('base64')}`;
    }
    
    res.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product (Admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // Parse form data - multer puts form fields in req.body
    const name = req.body.name;
    const price = parseFloat(req.body.price);
    const category = req.body.category;
    const categoryId = req.body.categoryId ? parseInt(req.body.categoryId) : undefined;
    const rating = req.body.rating ? parseFloat(req.body.rating) : 0;
    const reviews = req.body.reviews ? parseInt(req.body.reviews) : 0;
    const inStock = req.body.inStock === 'true' || req.body.inStock === true;
    const featured = req.body.featured === 'true' || req.body.featured === true;
    const description = req.body.description || null;
    
    if (!name || !price || isNaN(price)) {
      return res.status(400).json({ error: 'Missing required fields: name and price are required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Get image buffer from uploaded file
    const imageBuffer = req.file.buffer;
    
    // Use categoryId if provided, otherwise use category string
    let finalCategoryId = categoryId;
    let finalCategoryName = category || null;
    
    if (finalCategoryId) {
      // If we have categoryId, fetch the category name
      const [categories] = await db.execute(
        'SELECT name FROM categories WHERE id = ? LIMIT 1',
        [finalCategoryId]
      );
      if (categories.length > 0) {
        finalCategoryName = categories[0].name;
      }
    } else if (category) {
      // Try to find category by slug or name
      const [categories] = await db.execute(
        'SELECT id, name FROM categories WHERE slug = ? OR name = ? LIMIT 1',
        [category, category]
      );
      if (categories.length > 0) {
        finalCategoryId = categories[0].id;
        finalCategoryName = categories[0].name;
      }
    }
    
    // Ensure we have at least a category name (required by schema)
    if (!finalCategoryName) {
      return res.status(400).json({ error: 'Category is required. Please select a category or provide a category name.' });
    }
    
    // Convert boolean values to MySQL-compatible format
    const inStockValue = inStock !== undefined ? (inStock ? 1 : 0) : 1;
    const featuredValue = featured !== undefined ? (featured ? 1 : 0) : 0;
    
    console.log('Inserting product with values:', {
      name,
      price,
      imageBufferSize: imageBuffer ? imageBuffer.length : 0,
      category: finalCategoryName,
      finalCategoryId,
      rating,
      reviews,
      inStockValue,
      featuredValue
    });
    
    const [result] = await db.execute(
      `INSERT INTO products (name, price, image, category, categoryId, rating, reviews, inStock, featured, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        price, 
        imageBuffer, 
        finalCategoryName, 
        finalCategoryId || null, 
        rating || 0, 
        reviews || 0, 
        inStockValue,
        featuredValue,
        description || null
      ]
    );
    
    const [newProduct] = await db.execute(
      'SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?',
      [result.insertId]
    );
    
    const product = newProduct[0];
    const productData = {
      ...product,
      featured: Boolean(product.featured),
      inStock: Boolean(product.inStock),
    };
    
    // Convert BLOB to base64 if image exists
    if (product.image && Buffer.isBuffer(product.image)) {
      productData.image = `data:image/jpeg;base64,${product.image.toString('base64')}`;
    }
    
    res.status(201).json(productData);
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create product',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    // Parse form data - multer puts form fields in req.body as strings
    const name = req.body.name;
    const price = req.body.price ? parseFloat(req.body.price) : undefined;
    const category = req.body.category;
    const categoryId = req.body.categoryId ? parseInt(req.body.categoryId) : undefined;
    const rating = req.body.rating !== undefined ? parseFloat(req.body.rating) : undefined;
    const reviews = req.body.reviews !== undefined ? parseInt(req.body.reviews) : undefined;
    const inStock = req.body.inStock !== undefined ? (req.body.inStock === 'true' || req.body.inStock === true) : undefined;
    const featured = req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : undefined;
    const description = req.body.description !== undefined ? req.body.description : undefined;
    
    // Use categoryId if provided, otherwise use category string
    let finalCategoryId = categoryId;
    let finalCategoryName = category || undefined;
    
    if (finalCategoryId) {
      // If we have categoryId, fetch the category name
      const [categories] = await db.execute(
        'SELECT name FROM categories WHERE id = ? LIMIT 1',
        [finalCategoryId]
      );
      if (categories.length > 0) {
        finalCategoryName = categories[0].name;
      }
    } else if (category) {
      // Try to find category by slug or name
      const [categories] = await db.execute(
        'SELECT id, name FROM categories WHERE slug = ? OR name = ? LIMIT 1',
        [category, category]
      );
      if (categories.length > 0) {
        finalCategoryId = categories[0].id;
        finalCategoryName = categories[0].name;
      }
    }
    
    // Build update query - only update image if new file is uploaded
    let updateQuery;
    let updateParams;
    
    if (req.file) {
      // New image uploaded
      const imageBuffer = req.file.buffer;
      updateQuery = `UPDATE products 
       SET name = ?, price = ?, image = ?, category = ?, categoryId = ?, rating = ?, reviews = ?, inStock = ?, featured = ?, description = ?
       WHERE id = ?`;
      updateParams = [name, price, imageBuffer, finalCategoryName || null, finalCategoryId || null, rating || 0, reviews || 0, inStock !== undefined ? (inStock ? 1 : 0) : 1, featured !== undefined ? (featured ? 1 : 0) : 0, description || null, id];
    } else {
      // No new image, keep existing
      updateQuery = `UPDATE products 
       SET name = ?, price = ?, category = ?, categoryId = ?, rating = ?, reviews = ?, inStock = ?, featured = ?, description = ?
       WHERE id = ?`;
      updateParams = [name, price, finalCategoryName || null, finalCategoryId || null, rating || 0, reviews || 0, inStock !== undefined ? (inStock ? 1 : 0) : 1, featured !== undefined ? (featured ? 1 : 0) : 0, description || null, id];
    }
    
    const [result] = await db.execute(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const [updatedProduct] = await db.execute(
      'SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE p.id = ?',
      [id]
    );
    
    const product = updatedProduct[0];
    const productData = {
      ...product,
      featured: Boolean(product.featured),
      inStock: Boolean(product.inStock),
    };
    
    // Convert BLOB to base64 if image exists
    if (product.image && Buffer.isBuffer(product.image)) {
      productData.image = `data:image/jpeg;base64,${product.image.toString('base64')}`;
    }
    
    res.json(productData);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

