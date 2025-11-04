import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import { Sparkles } from 'lucide-react';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getFeatured();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
          <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
          <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
        </div>
        <p className="text-lg text-gray-600">Handpicked products just for you</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div 
            key={product.id}
            className="animate-fade-in-scale"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

