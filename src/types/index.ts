export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
