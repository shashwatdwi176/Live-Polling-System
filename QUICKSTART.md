# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 12+

## Option 1: Automated Setup (if PostgreSQL passwordless auth works)

```bash
chmod +x setup.sh
./setup.sh
```

## Option 2: Manual Setup

### Step 1: Database Setup

```bash
# Create database
createdb live_polling

# Apply schema (choose one method):

# Method A: Using psql
psql live_polling < backend/migrations/001_initial_schema.sql

# Method B: If psql asks for password, create manually:
psql postgres
CREATE DATABASE live_polling;
\c live_polling
-- Then paste contents of backend/migrations/001_initial_schema.sql
```

### Step 2: Backend

```bash
cd backend

# Install dependencies
npm install

# Verify database connection string in .env
# Default: DATABASE_URL=postgresql://localhost/live_polling
# If using password: postgresql://username:password@localhost:5432/live_polling

# Start server
npm run dev
```

Backend runs on http://localhost:3000

### Step 3: Frontend

```bash
cd frontend

# Install dependencies  
npm install

# Start server
npm run dev
```

Frontend runs on http://localhost:5173

## Testing the System

### Basic Flow Test

1. **Open http://localhost:5173**
2. Click "Teacher" button
3. Create a poll:
   - Question: "What's your favorite programming language?"
   - Options: "JavaScript", "Python", "Go"
   - Duration: 30 seconds
4. Click "Create Poll" then "Start Poll"
5. **Open a new tab/window** to http://localhost:5173
6. Click "Student" button
7. Enter a name (e.g., "Alice")
8. Vote on an option
9. See live results update on both screens

### Refresh Recovery Test

1. While poll is active (timer running), **refresh the teacher tab**
   - ✅ Poll should still be active
   - ✅ Timer should show correct remaining time (not reset to full duration)

2. Join as a student, vote, then **refresh the student tab**
   - ✅ Should see results (not voting UI)
   - ✅ Cannot vote again

### Late Join Test

1. Start a 60-second poll as teacher
2. Wait 30 seconds
3. Open new student tab and join
   - ✅ Timer should show ~30 seconds (not 60)

### Duplicate Vote Test  

1. Vote as a student
2. Open browser DevTools → Console
3. Try to submit another vote manually:
   ```javascript
   // This will be rejected by backend
   socket.emit('vote:submit', {
     pollId: '...',
     studentId: '...',
     optionId: '...'
   });
   ```
   - ✅ Backend should reject with "already voted" error

## Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `postgres -V`
- Ubuntu/Debian: `sudo systemctl status postgresql`
- macOS: `brew services list`
- Verify DATABASE_URL in `backend/.env`

### "Port 3000 already in use"
- Change PORT in `backend/.env`
- Update VITE_API_URL in `frontend/.env` to match

### "Socket connection failed"
- Ensure backend is running first
- Check browser console for CORS errors
- Verify CORS_ORIGIN in `backend/.env` matches frontend URL

## Deployment

See README.md for detailed deployment instructions for:
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify

## Architecture Overview

```
┌─────────────┐         WebSocket/HTTP        ┌──────────────┐
│   Browser   │ ◄──────────────────────────► │   Express    │
│  React App  │                               │   + Socket   │
└─────────────┘                               └──────┬───────┘
                                                     │
                                              ┌──────▼───────┐
                                              │  PostgreSQL  │
                                              │   Database   │
                                              └──────────────┘
```

**Key Principles:**
- Server is single source of truth
- Database stores all persistent state
- Frontend recovers state from backend on refresh
- Timers calculated from server timestamps

## Next Steps

1. ✅ Test basic poll flow
2. ✅ Test refresh recovery
3. ✅ Test late join
4. ✅ Review code in `backend/src/` and `frontend/src/`
5. ✅ Read README.md for architecture details
6. 📦 Deploy to production
