#!/bin/bash

# JanSetu SUVIDHA - Quick Start Script
# This script automatically sets up and runs the entire system

echo "🏛️  JanSetu SUVIDHA - Smart City Civic Service Kiosk"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js installation
echo "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
if ! [[ "$NODE_VERSION" =~ "v1"[6-9] || "$NODE_VERSION" =~ "v2" ]]; then
    echo "❌ Node.js version must be 16+. Found: $NODE_VERSION"
    exit 1
fi
echo "✅ Node.js $NODE_VERSION"

# Install frontend
echo ""
echo "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "${GREEN}✅ Frontend ready${NC}"

# Install backend
echo ""
echo "${BLUE}Installing backend dependencies...${NC}"
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "${GREEN}✅ Backend ready${NC}"

# Create .env if not exists
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=5000
NODE_ENV=development
EOF
    echo "${GREEN}✅ Backend .env created${NC}"
fi

echo ""
echo "${YELLOW}=================================="
echo "Setup Complete! 🎉"
echo "==================================${NC}"
echo ""
echo "${BLUE}To start the system:${NC}"
echo ""
echo "1. Start Backend (in Terminal 1):"
echo "   cd backend && npm start"
echo ""
echo "2. Start Frontend (in Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open browser:"
echo "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo "${YELLOW}Demo Credentials:${NC}"
echo "• Mobile: 9876543210 (any 10 digits)"
echo "• OTP: Shown on screen"
echo ""
echo "${YELLOW}Features to Try:${NC}"
echo "✓ Pay bills (pre-populated electricity & water)"
echo "✓ Report complaints (water, electricity, streetlight, etc.)"
echo "✓ Track complaint status with timeline"
echo "✓ Upload documents (Aadhar, ID, bills)"
echo "✓ Switch languages (English, Hindi, Tamil, etc.)"
echo "✓ Enable Accessibility Mode for large text"
echo "✓ Access Admin Dashboard (view analytics, manage complaints)"
echo ""
echo "${BLUE}Documentation:${NC}"
echo "Read README.md for complete guide, API docs, and customization"
echo ""
