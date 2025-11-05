# Railway Deployment Guide

This guide explains how to deploy both the frontend and backend of this ecommerce application on Railway as a single service.

## Architecture

Since Railway runs one system at a time, we've configured the project to:
1. **Build Phase**: Build the frontend (Vite) and install server dependencies
2. **Start Phase**: Run Express server that serves both:
   - API endpoints at `/api/*`
   - Built frontend static files at `/*`

## Setup Steps

### 1. Railway Project Configuration

1. Create a new Railway project
2. Connect your GitHub repository
3. Railway will auto-detect Node.js

### 2. Build Configuration

Railway will automatically run:
- **Build Command**: `npm run build:all` (defined in root `package.json`)
  - This builds the frontend with Vite
  - Installs server dependencies
- **Start Command**: `npm start` (defined in root `package.json`)
  - This starts the Express server

### 3. Environment Variables

Set these in Railway's dashboard under your service settings:

#### Backend Environment Variables
```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
PORT=3000
JWT_SECRET=your-secret-key-for-jwt
```

**Note**: Railway automatically sets `PORT`, but you can override it if needed.

#### Frontend Environment Variables (Optional)
```
VITE_API_URL=/api
```

**Note**: In production, if `VITE_API_URL` is not set, the app will automatically use `/api` (relative path) since frontend and backend are on the same domain.

### 4. How It Works

#### Build Process
```
1. Railway runs: npm run build:all
   ├─> npm run build (builds frontend to dist/)
   └─> npm run build:server (installs server dependencies)
```

#### Runtime Process
```
1. Railway runs: npm start
   └─> cd server && node index.js
       └─> Express server starts and:
           ├─> Serves API at /api/*
           └─> Serves frontend static files from ../dist/
```

### 5. File Structure After Build

```
project-root/
├── dist/              # Built frontend (created by vite build)
│   ├── index.html
│   ├── assets/
│   └── ...
├── server/
│   ├── index.js       # Express server (serves dist/ and API)
│   ├── node_modules/
│   └── ...
└── package.json       # Root package.json with build:all and start scripts
```

## Testing Locally

To test the production build locally:

```bash
# Build everything
npm run build:all

# Start the server (will serve both frontend and API)
npm start
```

Then visit `http://localhost:3000` - you should see:
- Frontend UI at the root
- API endpoints at `/api/*`

## Troubleshooting

### Issue: Frontend not loading
- **Check**: Ensure `dist/` folder exists after build
- **Check**: Verify Express is serving static files from correct path
- **Solution**: Check server logs for path resolution errors

### Issue: API calls failing
- **Check**: Verify environment variables are set in Railway
- **Check**: Database connection credentials are correct
- **Solution**: Check server logs for connection errors

### Issue: Build fails
- **Check**: Ensure all dependencies are listed in `package.json`
- **Check**: Verify Node.js version is compatible
- **Solution**: Check Railway build logs for specific errors

### Issue: 404 on page refresh
- **This is expected**: React Router handles client-side routing
- **Solution**: Express catch-all route should serve `index.html` for non-API routes
- If it doesn't work, check that the catch-all route is after all API routes

## Advantages of This Setup

1. **Single Service**: Only one Railway service to manage
2. **Same Domain**: Frontend and backend on same domain (no CORS issues)
3. **Simple Deployment**: One build command, one start command
4. **Cost Effective**: Only pay for one service instead of two
5. **Environment Variables**: Manage all env vars in one place

## Development vs Production

### Development
- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `cd server && npm run dev` (Express on port 3000)
- Uses Vite proxy for API calls

### Production (Railway)
- Single Express server serves both frontend and API
- Frontend built statically and served from `dist/`
- API and frontend on same domain (no CORS needed)

## Custom Domain Setup

If you add a custom domain in Railway:
1. Railway will handle SSL automatically
2. No additional configuration needed
3. Both frontend and API will be available on your custom domain

