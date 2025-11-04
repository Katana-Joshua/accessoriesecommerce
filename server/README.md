# Ecommerce Backend API

This is the Node.js/Express backend for the ecommerce application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
   - Connect to your MySQL database using the provided credentials
   - Run the SQL script in `database/schema.sql` to create tables and insert sample data

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `POST /api/cart/add` - Validate adding item to cart
- `POST /api/cart/validate` - Validate cart items

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status

## Database Connection

The database connection is configured in `config/database.js` with the following credentials:
- Host: srv1943.hstgr.io
- Database: ecommerce01
- Username: ecommerce01
- Password: Monstermash@123

