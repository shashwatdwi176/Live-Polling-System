# Live Polling System


## 🎯 Key Features

- **Server-Authoritative Design**: All critical state (timers, votes, results) computed on backend
- **Refresh Resilient**: Works correctly after browser refresh for both teacher and student
- **Late Join Support**: Students joining late see correct remaining time
- **Duplicate Vote Prevention**: Database-level constraint ensures one vote per student per poll
- **Real-Time Updates**: Live vote counts broadcast to all participants using Socket.io
- **Production-Ready**: Full error handling, graceful degradation, TypeScript throughout

## 🏗️ Architecture

### Backend
- **Node.js + Express + TypeScript**: REST API and server logic
- **Socket.io**: Real-time bidirectional communication
- **PostgreSQL**: ACID-compliant database with unique constraints
- **Layered Architecture**: Controller → Service → Repository pattern

### Frontend
- **React 19 + TypeScript**: Type-safe UI components
- **Custom Hooks**: `useSocket`, `usePollTimer`, `usePollState`, `useStudentSession`
- **Vite**: Fast development and optimized production builds

## 🔄 Refresh Recovery Flow

### Teacher Refresh
1. Component mounts
2. Calls `poll:sync` socket event
3. Server returns current poll state with `serverTime`
4. `usePollTimer` calculates remaining time from `startedAt + duration - serverTime`
5. UI resumes exactly where it left off

### Student Refresh
1. Component mounts with `studentId` from localStorage
2. Calls `poll:sync` with `studentId`
3. Server checks if student has voted
4. Returns poll state + `hasVoted` flag + results (if voted)
5. UI shows voting interface or results accordingly

## 🚀 Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd live-polling-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb live_polling

# Configure environment (edit .env if needed)
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

##  Testing Scenarios

### Refresh Resilience
- [x] Teacher: refresh mid-poll → timer continues correctly
- [x] Student: refresh before voting → can still vote
- [x] Student: refresh after voting → sees results, cannot vote again

### Late Join
- [x] Student joins 30s into 60s poll → sees 30s remaining, not 60s

### Duplicate Vote Prevention
- [x] Student votes → vote button disabled
- [x] Student refreshes → results shown, voting UI hidden
- [x] Spam vote requests via DevTools → backend rejects

### Concurrent Users
- [x] Multiple students vote simultaneously → all votes recorded
- [x] Real-time results update for all connected clients

## 📝 License

MIT
# Live-Polling-System
