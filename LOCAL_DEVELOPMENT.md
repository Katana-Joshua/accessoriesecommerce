# Local Development Guide

This guide explains how to run the project locally for development and production testing.

## Quick Start

### Development Mode (Recommended for coding)

Run both frontend and backend with **one command**:

```bash
npm run dev:all
```

This will:
- Start Vite dev server (frontend) on `http://localhost:5173`
- Start Express server (backend) on `http://localhost:3000`
- Show logs from both in the same terminal with color coding

**What you get:**
- ✅ Hot module replacement (instant updates when you change code)
- ✅ Source maps for debugging
- ✅ Fast refresh for React components
- ✅ Separate ports for frontend (5173) and backend (3000)

### Production Mode (Testing Railway setup)

To test how it will run on Railway:

```bash
# Step 1: Build everything
npm run build:all

# Step 2: Start the server (serves both frontend and API)
npm start
```

Then visit `http://localhost:3000` - you'll see:
- Frontend UI at the root
- API endpoints at `/api/*`

**What you get:**
- ✅ Production build (optimized, minified)
- ✅ Single port (3000) - same as Railway
- ✅ Express serves static files (no Vite dev server)

## Development vs Production Mode

### Development Mode (`npm run dev:all`)

```
Terminal Output:
┌─────────────────────────────────────────┐
│ [0] Frontend (Vite) on :5173            │
│ [1] Backend (Express) on :3000          │
└─────────────────────────────────────────┘

Browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Vite proxy forwards /api/* to backend
```

**Benefits:**
- Fast refresh (see changes instantly)
- Better error messages
- Source maps for debugging
- Separate processes for easier debugging

### Production Mode (`npm run build:all && npm start`)

```
Terminal Output:
┌─────────────────────────────────────────┐
│ Server is running on port 3000          │
│ Serving frontend from: ../dist          │
└─────────────────────────────────────────┘

Browser:
- Everything: http://localhost:3000
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
```

**Benefits:**
- Tests production build
- Same as Railway deployment
- Single process (easier to debug production issues)

## Available Commands

### Development
- `npm run dev` - Start only frontend (Vite dev server)
- `npm run dev:server` - Start only backend (Express)
- `npm run dev:all` - **Start both** (recommended for development)

### Production Testing
- `npm run build` - Build frontend only
- `npm run build:server` - Install server dependencies
- `npm run build:all` - Build everything
- `npm start` - Start production server (serves both frontend and API)

### Other
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run preview` - Preview production build with Vite

## Environment Setup

### Frontend Environment (`.env` in project root)

```env
VITE_API_URL=http://localhost:3000/api
```

**Note:** In development, Vite proxy handles this automatically, but you can set it explicitly.

### Backend Environment (`.env` in `server/` directory)

```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
PORT=3000
JWT_SECRET=your-secret-key
```

## How It Works

### Development Mode Flow

```
┌─────────────────┐
│  npm run dev:all │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Vite  │ │ Express │
│ :5173 │ │  :3000  │
└───┬───┘ └────┬────┘
    │          │
    │          │
┌───▼──────────▼───┐
│   Your Browser   │
│  localhost:5173  │
└──────────────────┘
```

1. Frontend runs on port 5173 (Vite)
2. Backend runs on port 3000 (Express)
3. Vite proxy forwards `/api/*` requests to Express
4. You code in the frontend, hot reload works instantly

### Production Mode Flow

```
┌─────────────────┐
│  npm start      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Express │
    │  :3000  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ API   │ │ Static  │
│ /api  │ │ Files   │
└───────┘ └─────────┘
```

1. Express serves static files from `dist/` folder
2. Express handles API routes at `/api/*`
3. Everything on one port (3000)
4. Same as Railway deployment

## Troubleshooting

### Issue: `npm run dev:all` says "concurrently not found"
**Solution:** Run `npm install` first to install dependencies

### Issue: Port 3000 already in use
**Solution:** 
- Stop the other process using port 3000
- Or change `PORT` in `server/.env`

### Issue: Port 5173 already in use
**Solution:** Vite will automatically use the next available port

### Issue: Frontend can't connect to backend
**Solution:**
- Make sure backend is running (`npm run dev:server`)
- Check `VITE_API_URL` in `.env`
- Verify Vite proxy in `vite.config.ts`

### Issue: Database connection fails
**Solution:**
- Check `server/.env` has correct database credentials
- Verify database server is accessible
- Check network/firewall settings

## Recommended Workflow

### Daily Development
```bash
# Start everything
npm run dev:all

# Make changes to code
# See updates instantly in browser

# Stop: Ctrl+C
```

### Before Deploying to Railway
```bash
# Test production build
npm run build:all
npm start

# Verify everything works on localhost:3000
# Then deploy to Railway
```

## Tips

1. **Use `dev:all` for development** - Fast, instant updates, better debugging
2. **Use `build:all && start` before deploying** - Test production build locally first
3. **Keep two terminals** - If you prefer separate logs, use:
   - Terminal 1: `npm run dev` (frontend)
   - Terminal 2: `npm run dev:server` (backend)
4. **Check logs** - Both processes show colored output in `dev:all` mode

