import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, categoriesAPI, ordersAPI } from '../services/api';
import { Product, Category } from '../types';
import { Package, Tag, ShoppingCart, Plus, Edit, Trash2, LogOut, BarChart3 } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { formatPrice } from '../utils/currency';

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelTab, setAdminPanelTab] = useState<'product' | 'category'>('product');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }

    // Only redirect if we're sure the user is not an admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    // User is admin, fetch data
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, ordersData] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        ordersAPI.getAll().catch(() => []), // Orders might not exist yet
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData || []);

      // Calculate stats
      const revenue = ordersData?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
      setStats({
        totalProducts: productsData.length,
        totalCategories: categoriesData.length,
        totalOrders: ordersData?.length || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = () => {
    fetchData(); // Refresh data after adding product
  };

  const handleCategoryAdded = () => {
    fetchData(); // Refresh data after adding category
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      // Ensure ID is a valid number
      const categoryId = typeof id === 'number' ? id : parseInt(id.toString().split(':')[0], 10);
      if (isNaN(categoryId)) {
        alert('Invalid category ID');
        return;
      }
      
      await categoriesAPI.delete(categoryId);
      setCategories(categories.filter(c => {
        const cId = typeof c.id === 'number' ? c.id : parseInt(c.id.toString().split(':')[0], 10);
        return cId !== categoryId;
      }));
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete category';
      alert(errorMessage);
    }
  };

  // Show loading while auth is being checked or data is being fetched
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not admin after loading, this will be handled by the redirect in useEffect
  // But we add a safety check here too
  if (!user || user.role !== 'admin') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-lg">GA</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Welcome, {user?.username}</span>
              <button
                onClick={() => navigate('/')}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 sm:px-0"
              >
                <span className="hidden sm:inline">View Store</span>
                <span className="sm:hidden">Store</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'categories', label: 'Categories', icon: Tag },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Products</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Categories</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 break-words">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h2>
                <button
                  onClick={() => {
                    setAdminPanelTab('product');
                    setIsAdminPanelOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Product
                </button>
              </div>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                          {product.featured && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex-shrink-0">Featured</span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.categoryName || product.category || 'N/A'}</p>
                        <div className="flex items-center justify-between mt-2">
                          {product.inStock ? (
                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">In Stock</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={() => setIsAdminPanelOpen(true)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.featured && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Featured</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(product.price)}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoryName || product.category || 'N/A'}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          {product.inStock ? (
                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">In Stock</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setIsAdminPanelOpen(true)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Categories</h2>
                <button
                  onClick={() => {
                    setAdminPanelTab('category');
                    setIsAdminPanelOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsAdminPanelOpen(true)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Slug: {category.slug}</p>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                            <p className="font-semibold text-gray-900 text-base sm:text-lg">Order #{order.id}</p>
                            <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          {/* Customer Information */}
                          {order.customerName && (
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Customer Details</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div>
                                  <p className="text-gray-500">Name</p>
                                  <p className="font-medium text-gray-900 break-words">{order.customerName}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Email</p>
                                  <p className="font-medium text-gray-900 break-all">{order.customerEmail}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Contact</p>
                                  <p className="font-medium text-gray-900 break-words">{order.customerContact}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm bg-white rounded p-2 gap-1">
                                    <span className="text-gray-700 break-words">
                                      {item.product?.name || `Product #${item.productId}`} x {item.quantity}
                                    </span>
                                    <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="text-left sm:text-right sm:ml-6 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">Total</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Panel for Add/Edit */}
            <AdminPanel
              isOpen={isAdminPanelOpen}
              onClose={() => setIsAdminPanelOpen(false)}
              onProductAdded={handleProductAdded}
              onCategoryAdded={handleCategoryAdded}
              initialTab={adminPanelTab}
            />
    </div>
  );
}

