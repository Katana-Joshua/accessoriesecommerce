import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product, Category } from '../types';
import { X, Package, Tag } from 'lucide-react';
import Login from './Login';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
  onCategoryAdded?: () => void;
  initialTab?: 'product' | 'category';
}

export default function AdminPanel({ isOpen, onClose, onProductAdded, onCategoryAdded, initialTab = 'product' }: AdminPanelProps) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'product' | 'category'>(initialTab);
  
  // Update tab when initialTab prop changes (when panel opens)
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    image: '', // Used for preview only
    category: '',
    categoryId: undefined,
    rating: 0,
    reviews: 0,
    inStock: true,
    featured: false,
    description: '',
  });
  const [categoryFormData, setCategoryFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    slug: '',
    description: '',
    image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCategories();
    }
  }, [isOpen, isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await productsAPI.create(formData, productImageFile || undefined);
      setMessage({ type: 'success', text: 'Product added successfully!' });
      setFormData({
        name: '',
        price: 0,
        image: '',
        category: '',
        categoryId: undefined,
        rating: 0,
        reviews: 0,
        inStock: true,
        featured: false,
        description: '',
      });
      setProductImageFile(null);
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add product. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Auto-generate slug if not provided
      const slug = categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      await categoriesAPI.create({ ...categoryFormData, slug }, categoryImageFile || undefined);
      setMessage({ type: 'success', text: 'Category added successfully!' });
      setCategoryFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
      });
      setCategoryImageFile(null);
      fetchCategories();
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add category. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number' && name === 'price') {
      // For price field, if it's currently 0 and user starts typing, replace it
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
               : type === 'number' ? parseFloat(value) || 0 
               : value
      }));
    }
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // When user focuses on price field, if it's 0, select all text so they can replace it
    if (e.target.value === '0' || e.target.value === '0.00') {
      e.target.select();
    }
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If field was 0 and user starts typing, clear it
    if (formData.price === 0 && value !== '' && value !== '0') {
      // Remove leading zero if user starts typing a number
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          price: numValue
        }));
        return;
      }
    }
    
    // Otherwise use normal handler
    handleProductChange(e);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full m-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <div className="p-6">
              <p className="text-center text-gray-700 mb-4">Admin access required</p>
              <Login />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'product'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5" />
            Add Product
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'category'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'product' ? (
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleProductChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={handlePriceInput}
                  onFocus={handlePriceFocus}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleProductChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProductImageFile(file);
                      // Create preview URL for display
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, image: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {productImageFile && (
                  <p className="mt-2 text-sm text-gray-500">Selected: {productImageFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleProductChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleProductChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reviews
                  </label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleProductChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleProductChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">In Stock</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleProductChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (auto-generated if empty)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={categoryFormData.slug}
                  onChange={handleCategoryChange}
                  placeholder="category-slug"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleCategoryChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCategoryImageFile(file);
                      // Create preview URL for display
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCategoryFormData(prev => ({ ...prev, image: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {categoryImageFile && (
                  <p className="mt-2 text-sm text-gray-500">Selected: {categoryImageFile.name}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
