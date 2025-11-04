# Environment Variables Setup Guide

## Frontend Environment Variables (Vite)

### File Location
Create `.env` file in the **project root** (same level as `package.json`)

### Format
```env
VITE_API_URL=http://localhost:3000/api
```

### Important Notes:
1. **Vite requires `VITE_` prefix** - Only variables starting with `VITE_` are exposed to client code
2. **Access in code**: `import.meta.env.VITE_API_URL`
3. **Restart required**: After adding/changing `.env`, restart Vite dev server

### Example `.env` file:
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# For production, use:
# VITE_API_URL=https://your-api-domain.com/api
```

## Backend Environment Variables

### File Location
Create `.env` file in the **`server/` directory**

### Format
```env
DB_HOST=srv1943.hstgr.io
DB_USER=u407655108_ecommerce01
DB_PASSWORD=Monstermash@123
DB_NAME=u407655108_ecommerce01
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

### Access in code
```javascript
process.env.DB_HOST
process.env.PORT
process.env.JWT_SECRET
```

## Connection Flow

### Development Setup

1. **Backend runs on**: `http://localhost:3000`
2. **Frontend runs on**: `http://localhost:5173` (Vite default)
3. **Vite Proxy**: Automatically forwards `/api/*` to backend

### How It Works

```
Frontend Request: /api/products
         ↓
Vite Proxy (vite.config.ts)
         ↓
Backend: http://localhost:3000/api/products
         ↓
Express Router
         ↓
MySQL Database
```

### Code Example

**Frontend (`src/services/api.ts`):**
```typescript
// Uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // ...
});
```

**Backend (`server/index.js`):**
```javascript
// Uses environment variable or defaults to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## Quick Setup Commands

### Create Frontend .env
```bash
# In project root
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

### Create Backend .env
```bash
# In server directory
cd server
echo "DB_HOST=srv1943.hstgr.io
DB_USER=u407655108_ecommerce01
DB_PASSWORD=Monstermash@123
DB_NAME=u407655108_ecommerce01
PORT=3000
JWT_SECRET=your-secret-key" > .env
```

## Testing the Connection

### Test Backend
```bash
curl http://localhost:3000/api/health
```

### Test from Frontend
Open browser console and run:
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log);
```

## Production Setup

### Frontend .env.production
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Backend Environment Variables
Set on your hosting platform:
- Heroku: `heroku config:set DB_HOST=...`
- Vercel: Environment variables in dashboard
- Railway: Environment variables in settings

## Troubleshooting

### Issue: Environment variables not loading
**Solution**: 
- Restart dev server
- Check variable has `VITE_` prefix
- Verify file is in correct location

### Issue: CORS errors
**Solution**:
- Check backend CORS is enabled
- Verify API URL matches backend URL
- Check Vite proxy configuration

### Issue: Connection refused
**Solution**:
- Verify backend is running
- Check PORT matches in .env
- Verify firewall settings

