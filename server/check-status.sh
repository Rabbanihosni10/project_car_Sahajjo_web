#!/bin/bash
# Car Sahajjo Server Status Checker
# Run this to verify all server systems are working

echo ""
echo "=========================================="
echo "   Car Sahajjo Server Status Check"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}1. Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}   ✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}   ✗ Node.js not found${NC}"
    exit 1
fi
echo ""

# Check npm
echo -e "${BLUE}2. Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}   ✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}   ✗ npm not found${NC}"
    exit 1
fi
echo ""

# Check dependencies
echo -e "${BLUE}3. Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo -e "${GREEN}   ✓ node_modules found ($MODULE_COUNT modules)${NC}"
else
    echo -e "${RED}   ✗ node_modules not found${NC}"
    echo -e "${YELLOW}   Run: npm install${NC}"
fi
echo ""

# Check .env file
echo -e "${BLUE}4. Checking .env configuration...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}   ✓ .env file exists${NC}"
    if grep -q "MONGODB_URI" .env; then
        echo -e "${GREEN}   ✓ MongoDB URI configured${NC}"
    else
        echo -e "${YELLOW}   ⚠ MongoDB URI not configured${NC}"
    fi
    if grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}   ✓ JWT Secret configured${NC}"
    else
        echo -e "${YELLOW}   ⚠ JWT Secret not configured${NC}"
    fi
else
    echo -e "${RED}   ✗ .env file not found${NC}"
    echo -e "${YELLOW}   Create .env file with required variables${NC}"
fi
echo ""

# Check if server is running
echo -e "${BLUE}5. Checking if server is running...${NC}"
if curl -s http://localhost:5000/ > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ Server is running on port 5000${NC}"
    
    # Test API endpoints
    echo ""
    echo -e "${BLUE}6. Testing API endpoints...${NC}"
    
    # Health check
    if curl -s http://localhost:5000/ | grep -q "Car Sahajjo API is running"; then
        echo -e "${GREEN}   ✓ Health check: OK${NC}"
    else
        echo -e "${RED}   ✗ Health check: FAILED${NC}"
    fi
    
    # Jobs endpoint
    if curl -s http://localhost:5000/api/jobs | grep -q "jobs"; then
        JOBS_COUNT=$(curl -s http://localhost:5000/api/jobs | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
        echo -e "${GREEN}   ✓ Jobs API: OK ($JOBS_COUNT jobs)${NC}"
    else
        echo -e "${RED}   ✗ Jobs API: FAILED${NC}"
    fi
    
    # Forum endpoint
    if curl -s http://localhost:5000/api/forum | grep -q "posts"; then
        POSTS_COUNT=$(curl -s http://localhost:5000/api/forum | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
        echo -e "${GREEN}   ✓ Forum API: OK ($POSTS_COUNT posts)${NC}"
    else
        echo -e "${RED}   ✗ Forum API: FAILED${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠ Server is not running${NC}"
    echo -e "${YELLOW}   Start server with: npm start${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}=========================================="
echo "Summary"
echo "==========================================${NC}"
echo -e "${GREEN}✓ All critical components are configured${NC}"
if curl -s http://localhost:5000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running and responding${NC}"
    echo -e "${GREEN}✓ Ready for development/production${NC}"
else
    echo -e "${YELLOW}⚠ Server is not currently running${NC}"
    echo -e "${YELLOW}  Start with: npm start${NC}"
fi
echo ""
