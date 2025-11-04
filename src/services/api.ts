import axios from 'axios';
import { Product, Category } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: async (params?: { featured?: boolean; category?: string; categoryId?: number }): Promise<Product[]> => {
    const response = await api.get('/products', { params });
    // Convert price and other numeric fields to proper types
    return response.data.map((product: any) => ({
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      reviews: Number(product.reviews),
    }));
  },
  
  getFeatured: async (): Promise<Product[]> => {
    const response = await api.get('/products', { params: { featured: true } });
    // Convert price and other numeric fields to proper types
    return response.data.map((product: any) => ({
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      reviews: Number(product.reviews),
    }));
  },
  
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    const product = response.data;
    return {
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      reviews: Number(product.reviews),
    };
  },
  
  create: async (product: Omit<Product, 'id'>, imageFile?: File): Promise<Product> => {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price.toString());
    formData.append('category', product.category || '');
    if (product.categoryId) formData.append('categoryId', product.categoryId.toString());
    if (product.rating) formData.append('rating', product.rating.toString());
    if (product.reviews) formData.append('reviews', product.reviews.toString());
    formData.append('inStock', product.inStock ? 'true' : 'false');
    if (product.featured !== undefined) formData.append('featured', product.featured ? 'true' : 'false');
    if (product.description) formData.append('description', product.description);
    if (imageFile) formData.append('image', imageFile);
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const created = response.data;
    return {
      ...created,
      price: Number(created.price),
      rating: Number(created.rating),
      reviews: Number(created.reviews),
    };
  },
  
  update: async (id: number, product: Partial<Product>, imageFile?: File): Promise<Product> => {
    const formData = new FormData();
    if (product.name) formData.append('name', product.name);
    if (product.price !== undefined) formData.append('price', product.price.toString());
    if (product.category) formData.append('category', product.category);
    if (product.categoryId) formData.append('categoryId', product.categoryId.toString());
    if (product.rating !== undefined) formData.append('rating', product.rating.toString());
    if (product.reviews !== undefined) formData.append('reviews', product.reviews.toString());
    if (product.inStock !== undefined) formData.append('inStock', product.inStock ? 'true' : 'false');
    if (product.featured !== undefined) formData.append('featured', product.featured ? 'true' : 'false');
    if (product.description !== undefined) formData.append('description', product.description || '');
    if (imageFile) formData.append('image', imageFile);
    
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const updated = response.data;
    return {
      ...updated,
      price: Number(updated.price),
      rating: Number(updated.rating),
      reviews: Number(updated.reviews),
    };
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Cart API
export const cartAPI = {
  validate: async (items: { productId: number; quantity: number }[]) => {
    const response = await api.post('/cart/validate', { items });
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  create: async (order: { items: { productId: number; quantity: number; price: number }[]; total: number }) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id'>, imageFile?: File): Promise<Category> => {
    const formData = new FormData();
    formData.append('name', category.name);
    formData.append('slug', category.slug);
    if (category.description) formData.append('description', category.description);
    if (imageFile) formData.append('image', imageFile);
    
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id: number, category: Partial<Category>, imageFile?: File): Promise<Category> => {
    const formData = new FormData();
    if (category.name) formData.append('name', category.name);
    if (category.slug) formData.append('slug', category.slug);
    if (category.description !== undefined) formData.append('description', category.description || '');
    if (imageFile) formData.append('image', imageFile);
    
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default api;

