#!/bin/bash

echo "🚀 Starting Gold Carnival Development Environment"
echo "================================================"

# Check if MySQL is running
echo "📊 Checking MySQL connection..."
if ! mysql -u admin -pAdmin@123 -e "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ MySQL is not running or credentials are incorrect"
    echo "Please start MySQL and ensure the database 'new-eureka' exists"
    exit 1
fi

# Check if Redis is running
echo "🔴 Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running"
    echo "Please start Redis server"
    exit 1
fi

echo "✅ Database connections verified"

# Create .env file from example if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp backend/env.example backend/.env
    echo "✅ .env file created"
fi

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install
    cd ..
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install
    cd ..
fi

echo ""
echo "🎯 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "🎯 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:8080"
echo "🔗 Backend API: http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 