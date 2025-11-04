# Ecommerce Full Stack Application

A modern full-stack ecommerce application built with React, TypeScript, Node.js, Express, and MySQL.

## Features

- **Product Management**: Browse products by category, view product details
- **Shopping Cart**: Add/remove items, update quantities
- **Order Management**: Place orders and track order status
- **Admin Authentication**: Secure admin login with JWT tokens
- **Admin Panel**: Add, edit, and delete products (admin only)
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Vite for build tooling
- Tailwind CSS for styling
- Axios for API calls
- JWT authentication

### Backend
- Node.js with Express
- MySQL database
- JWT authentication
- bcrypt for password hashing
- RESTful API architecture

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL database access

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
   - The `.env` file should already be configured with your database credentials
   - Run the database initialization: `npm run init-db`
   - Create admin user: `npm run seed-admin`

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Install dependencies (from project root):
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

## Database Configuration

The database connection is configured in `server/.env`:
- Host: srv1943.hstgr.io
- Database: u407655108_ecommerce01
- Username: u407655108_ecommerce01
- Password: Monstermash@123

## Admin Access

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

### Creating Additional Admin Users

You can create additional admin users through the API:
```bash
POST /api/auth/register
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "securepassword"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin (no auth required)
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order

## Frontend-Backend Connection

The frontend connects to the backend through:

1. **API Base URL**: Configured in `src/services/api.ts`
   - Default: `http://localhost:3000/api`
   - Can be overridden with `VITE_API_URL` environment variable

2. **Vite Proxy**: Configured in `vite.config.ts`
   - Proxies `/api` requests to `http://localhost:3000` during development

3. **Authentication**: 
   - JWT tokens stored in `localStorage`
   - Automatically added to all API requests via axios interceptors
   - Automatic logout on 401 errors

## Usage

1. **Browse Products**: View all products on the home page, filter by category
2. **Add to Cart**: Click the cart icon on any product card
3. **View Cart**: Click the cart icon in the header
4. **Checkout**: Click "Proceed to Checkout" in the cart
5. **Admin Login**: Click the login icon in the header or visit `/admin/login`
6. **Add Products**: After logging in, click the "+" icon to open the admin panel

## Development

- Frontend: `npm run dev` (runs Vite dev server)
- Backend: `cd server && npm run dev` (runs Node server with watch mode)

## Build for Production

### Frontend
```bash
npm run build
```

### Backend
The backend is ready to deploy. Make sure to:
- Set a strong `JWT_SECRET` in production environment
- Use environment variables for all sensitive data
- Enable HTTPS in production

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Admin routes are protected with authentication middleware
- CORS is enabled for development (configure for production)
