import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import { Product, Category } from '../types';

export default function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | number>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'All') {
        if (typeof selectedCategory === 'number') {
          params.categoryId = selectedCategory;
        } else {
          params.category = selectedCategory;
        }
      }
      const data = await productsAPI.getAll(params);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">All Products</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.slug
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
    </>
  );
}
