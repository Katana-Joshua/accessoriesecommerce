import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    
    // Convert BLOB to base64 if image exists
    const formattedCategories = categories.map(category => {
      const categoryData = { ...category };
      if (category.image && Buffer.isBuffer(category.image)) {
        categoryData.image = `data:image/jpeg;base64,${category.image.toString('base64')}`;
      }
      return categoryData;
    });
    
    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categories[0];
    const categoryData = { ...category };
    
    // Convert BLOB to base64 if image exists
    if (category.image && Buffer.isBuffer(category.image)) {
      categoryData.image = `data:image/jpeg;base64,${category.image.toString('base64')}`;
    }
    
    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST create new category (Admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (!finalSlug) {
      return res.status(400).json({ error: 'Could not generate a valid slug from category name' });
    }
    
    // Get image buffer if uploaded
    const imageBuffer = req.file ? req.file.buffer : null;
    
    const [result] = await db.execute(
      'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
      [name, finalSlug, description || null, imageBuffer]
    );
    
    const [newCategory] = await db.execute(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );
    
    const category = newCategory[0];
    const categoryData = { ...category };
    
    // Convert BLOB to base64 if image exists
    if (category.image && Buffer.isBuffer(category.image)) {
      categoryData.image = `data:image/jpeg;base64,${category.image.toString('base64')}`;
    }
    
    res.status(201).json(categoryData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name or slug already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT update category (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    
    // Build update query - only update image if new file is uploaded
    let updateQuery;
    let updateParams;
    
    if (req.file) {
      // New image uploaded
      const imageBuffer = req.file.buffer;
      updateQuery = 'UPDATE categories SET name = ?, slug = ?, description = ?, image = ? WHERE id = ?';
      updateParams = [name, slug, description || null, imageBuffer, id];
    } else {
      // No new image, keep existing
      updateQuery = 'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?';
      updateParams = [name, slug, description || null, id];
    }
    
    const [result] = await db.execute(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const [updatedCategory] = await db.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    
    const category = updatedCategory[0];
    const categoryData = { ...category };
    
    // Convert BLOB to base64 if image exists
    if (category.image && Buffer.isBuffer(category.image)) {
      categoryData.image = `data:image/jpeg;base64,${category.image.toString('base64')}`;
    }
    
    res.json(categoryData);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name or slug already exists' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse and validate ID - extract just the numeric part if there's any suffix
    const categoryId = parseInt(id.toString().split(':')[0], 10);
    
    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid category ID' 
      });
    }
    
    // Check if category has products
    const [products] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE categoryId = ?',
      [categoryId]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing products. Please reassign products first.' 
      });
    }
    
    const [result] = await db.execute(
      'DELETE FROM categories WHERE id = ?',
      [categoryId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;

