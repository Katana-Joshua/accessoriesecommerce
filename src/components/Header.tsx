import { ShoppingCart, Search, Menu, Plus, LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const cartCount = getCartCount();
  const isAdmin = isAuthenticated && user?.role === 'admin';

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

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo.png" 
                alt="GadgetArena Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <nav className="hidden lg:flex gap-6">
              <a href="#products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Products</a>
              <a href="#categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Categories</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none outline-none ml-2 w-full text-gray-700"
              />
            </div>
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
          </div>
        </div>
      </div>
    </header>
  );
}
