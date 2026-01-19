import { useState } from 'react';
import { ShoppingCart, Search, Menu, Plus, LogOut, LogIn, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onCartClick: () => void;
  onAdminClick?: () => void;
}

export default function Header({ onCartClick, onAdminClick }: HeaderProps) {
  const { getCartCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCartCount();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo.png" 
                alt="GadgetArena Logo" 
                className="h-16 w-auto"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              to="/" 
              className={`font-medium transition-colors relative group ${
                isActive('/') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
              }`}
            >
              Home
              <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/products" 
              className={`font-medium transition-colors relative group ${
                isActive('/products') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
              }`}
            >
              Products
              <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                isActive('/products') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/categories" 
              className={`font-medium transition-colors relative group ${
                isActive('/categories') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
              }`}
            >
              Categories
              <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                isActive('/categories') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors relative group ${
                isActive('/contact') ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
              }`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none outline-none ml-2 w-full text-gray-700"
              />
            </div>
            <button 
              onClick={handleSearchIconClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>
            {onAdminClick && isAdmin && (
              <button
                onClick={handleAdminClick}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                title="Add Product"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">{user?.username || 'User'}</span>
                {user?.role === 'admin' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hidden sm:inline">Admin</span>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                title="Login"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/') ? 'bg-orange-50 text-orange-500' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/products') ? 'bg-orange-50 text-orange-500' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/categories') ? 'bg-orange-50 text-orange-500' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/contact') ? 'bg-orange-50 text-orange-500' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact
            </Link>
            {isAuthenticated && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-4 py-2 text-sm text-gray-600">
                  {user?.username || 'User'}
                  {user?.role === 'admin' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Admin</span>
                  )}
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleAdminClick();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Mobile Search Popup */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div 
            className="bg-white w-full p-4 shadow-lg mt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close search"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
