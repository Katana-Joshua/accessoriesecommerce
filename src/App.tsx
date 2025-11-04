import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ProductDetail from './components/ProductDetail';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProductAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
        onAdminClick={() => setIsAdminOpen(true)}
      />
      <Hero />
      <FeaturedProducts />
      <ProductGrid key={refreshKey} />
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
