#!/bin/bash

# DeFiChain Bank Simulator - Setup Script
# This script helps you set up and deploy the app

set -e  # Exit on error

echo "🚀 DeFiChain Bank Simulator - Setup Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Step 2: Compile contracts
echo "🔨 Step 2: Compiling smart contracts..."
npm run compile
echo "✅ Contracts compiled"
echo ""

# Step 3: Check if Hardhat node is running
echo "🌐 Step 3: Checking Hardhat node..."
if curl -s http://127.0.0.1:8545 > /dev/null 2>&1; then
    echo "✅ Hardhat node is already running"
    NODE_RUNNING=true
else
    echo "⚠️  Hardhat node is not running"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Open a NEW terminal and run: npm run node"
    echo "  2. Wait for it to start (you'll see 'Started HTTP and WebSocket JSON-RPC server')"
    echo "  3. Then come back and run this script again, or manually run: npm run deploy:local"
    NODE_RUNNING=false
fi
echo ""

# Step 4: Deploy contracts if node is running
if [ "$NODE_RUNNING" = true ]; then
    echo "📡 Step 4: Deploying contracts..."
    npm run deploy:local
    
    # Verify deployment
    if [ -f "contracts/deployment.json" ]; then
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📋 Contract addresses:"
        cat contracts/deployment.json | grep -A 1 "address" | grep -v "address" | grep -v "^--$" | sed 's/.*: "\(.*\)".*/\1/' | while read addr; do
            if [ ! -z "$addr" ] && [ "$addr" != '""' ]; then
                echo "  $addr"
            fi
        done
        echo ""
    else
        echo "❌ Error: deployment.json was not created"
        exit 1
    fi
else
    echo "⏭️  Step 4: Skipping deployment (node not running)"
    echo ""
    echo "📝 To deploy contracts manually:"
    echo "  1. Make sure Hardhat node is running (npm run node)"
    echo "  2. Then run: npm run deploy:local"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Start Hardhat node (if not running): npm run node"
echo "  2. Deploy contracts: npm run deploy:local"
echo "  3. Configure MetaMask (see QUICK_START.md)"
echo "  4. Start frontend: npm run dev"
echo ""
echo "📖 For detailed instructions, see: QUICK_START.md"

