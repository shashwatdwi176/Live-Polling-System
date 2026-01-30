#!/bin/bash

echo "🚀 Live Polling System - Setup Script"
echo "======================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql"
    echo "   macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found ($(node --version))"

# Create database
echo ""
echo "📊 Setting up database..."
createdb live_polling 2>/dev/null || echo "Database 'live_polling' already exists"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend
npm install

echo " "
echo "🔄 Running database migrations..."
npm run migrate

echo ""
echo "✅ Backend setup complete!"

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd ../frontend
npm install

echo ""
echo "✅ Frontend setup complete!"

echo ""
echo "======================================"
echo "🎉 Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start backend (in terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start frontend (in terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Happy polling! 🗳️"
