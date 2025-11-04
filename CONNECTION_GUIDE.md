# Backend-Frontend Connection Guide

## Overview

The frontend (React + Vite) connects to the backend (Node.js + Express) through REST API calls using Axios.

## Connection Architecture

```
Frontend (React) → Axios → API Service → Backend (Express) → MySQL Database
```

## Environment Variables

### Frontend (.env file in project root)

Create a `.env` file in the root directory (same level as `package.json`):

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Note: Vite requires VITE_ prefix for environment variables
# These variables are accessible via import.meta.env.VITE_API_URL
```

### Backend (.env file in server/ directory)

The `.env` file in `server/` directory should contain:

```env
# Database Configuration
DB_HOST=srv1943.hstgr.io
DB_USER=u407655108_ecommerce01
DB_PASSWORD=Monstermash@123
DB_NAME=u407655108_ecommerce01

# Server Configuration
PORT=3000

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-change-in-production
```

## Frontend Configuration

### API Base URL Setup

**File:** `src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

This means:
- If `VITE_API_URL` is set in `.env`, it uses that
- Otherwise, defaults to `http://localhost:3000/api`

### Vite Proxy Configuration

**File:** `vite.config.ts`

The proxy is configured for development to avoid CORS issues:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

This means:
- During development, when frontend calls `/api/*`, Vite proxies to `http://localhost:3000`
- No CORS issues in development
- In production, use the full URL or configure proper CORS

## API Connection Flow

### 1. Frontend Makes Request

```typescript
// Example: Fetch products
const products = await productsAPI.getAll();
```

### 2. Axios Interceptor Adds Token

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Request Sent to Backend

```
GET http://localhost:3000/api/products
Headers: {
  Authorization: Bearer <token>,
  Content-Type: application/json
}
```

### 4. Backend Processes Request

```javascript
// server/routes/products.js
router.get('/', async (req, res) => {
  // Query database
  const [products] = await db.execute('SELECT ...');
  res.json(products);
});
```

### 5. Response Returned to Frontend

```typescript
// Frontend receives JSON response
const products = response.data;
```

## Complete API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin)
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
  - Query params: `?featured=true`, `?category=audio`, `?categoryId=1`
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order

### Cart
- `POST /api/cart/validate` - Validate cart items

## Frontend API Service Usage

### Example: Fetch Products

```typescript
import { productsAPI } from '../services/api';

// Get all products
const products = await productsAPI.getAll();

// Get featured products
const featured = await productsAPI.getFeatured();

// Get products by category
const audioProducts = await productsAPI.getAll({ category: 'audio' });
```

### Example: Create Product (Admin)

```typescript
import { productsAPI } from '../services/api';

const newProduct = {
  name: 'New Product',
  price: 99.99,
  image: 'https://example.com/image.jpg',
  categoryId: 1,
  inStock: true,
  featured: false,
};

// Token is automatically added by interceptor
const created = await productsAPI.create(newProduct);
```

### Example: Login

```typescript
import { authAPI } from '../services/api';

const response = await authAPI.login('admin', 'admin123');
// Token is stored in localStorage automatically
```

## Environment Setup

### Development Setup

1. **Frontend .env** (project root):
```env
VITE_API_URL=http://localhost:3000/api
```

2. **Backend .env** (server/ directory):
```env
DB_HOST=srv1943.hstgr.io
DB_USER=u407655108_ecommerce01
DB_PASSWORD=Monstermash@123
DB_NAME=u407655108_ecommerce01
PORT=3000
JWT_SECRET=your-secret-key
```

3. **Start Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:3000
```

4. **Start Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
# Vite proxy forwards /api to backend
```

### Production Setup

1. **Frontend .env.production:**
```env
VITE_API_URL=https://your-api-domain.com/api
```

2. **Backend Environment Variables:**
Set on your hosting platform (Heroku, Vercel, etc.)

3. **Build Frontend:**
```bash
npm run build
# Creates dist/ folder with production build
```

4. **CORS Configuration:**
Make sure backend allows requests from your frontend domain:

```javascript
// server/index.js
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check backend CORS configuration
2. Verify API URL is correct
3. Ensure backend is running

### Connection Refused

If connection is refused:
1. Verify backend is running on correct port (3000)
2. Check `VITE_API_URL` matches backend URL
3. Check firewall settings

### Authentication Errors

If getting 401 errors:
1. Check if token exists in localStorage
2. Verify token hasn't expired
3. Check JWT_SECRET matches between frontend/backend

### Environment Variables Not Loading

1. Restart Vite dev server after adding `.env`
2. Ensure variable names start with `VITE_`
3. Check file is in correct location (project root for frontend)

## Testing the Connection

### Test Backend Health

```bash
curl http://localhost:3000/api/health
```

### Test from Frontend

```typescript
// In browser console
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log);
```

## Network Flow Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │────────▶│  Axios API   │────────▶│  Express    │
│  Frontend   │  HTTP   │  Service     │  HTTP   │  Backend    │
│             │         │              │         │             │
│ localhost   │         │ Interceptors │         │ localhost   │
│ :5173       │         │ (add token)  │         │ :3000       │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         ▼
                                                   ┌─────────────┐
                                                   │   MySQL     │
                                                   │  Database   │
                                                   │             │
                                                   │ srv1943...  │
                                                   └─────────────┘
```

## Quick Reference

### Frontend API Calls
- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`
- Token: Automatically added from `localStorage.getItem('authToken')`
- Headers: `Authorization: Bearer <token>`

### Backend Endpoints
- Base: `http://localhost:3000/api`
- Auth: `/api/auth/*`
- Products: `/api/products/*`
- Categories: `/api/categories/*`
- Orders: `/api/orders/*`

