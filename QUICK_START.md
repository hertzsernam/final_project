# Quick Start Guide - Step by Step Setup

This guide will help you set up and run the DeFiChain Bank Simulator from scratch.

## Prerequisites Check

First, verify you have everything installed:

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher
```

If not installed, download from: https://nodejs.org/

---

## Step 1: Install Dependencies

```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm install
```

Wait for installation to complete. This may take 2-3 minutes.

---

## Step 2: Compile Smart Contracts

```bash
npm run compile
```

**Expected output:**
```
Compiled 3 Solidity files successfully
```

If you see errors, make sure you're in the project directory.

---

## Step 3: Start Local Blockchain (Terminal 1)

Open a **NEW terminal window** and run:

```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run node
```

**Keep this terminal open!** You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Accounts: [list of 20 accounts with addresses and private keys]
```

**IMPORTANT:** Copy one of the private keys shown (you'll need it for MetaMask).

Example output:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Step 4: Deploy Contracts (Terminal 2)

**IMPORTANT:** Wait until Terminal 1 shows "Started HTTP and WebSocket JSON-RPC server" before proceeding!

Open a **SECOND terminal window** and run:

```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run deploy:local
```

**Expected output:**
```
Starting deployment...
Deploying to network: localhost (Chain ID: 31337)
Deploying Governance...
Governance deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deploying Bank...
Bank deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Deploying BankMock...
BankMock deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

Deployment completed successfully!
Contract addresses saved to: contracts/deployment.json
```

**IMPORTANT:** 
- Wait for "Deployment completed successfully!" message
- Contract addresses will be saved automatically
- If you see errors, make sure Terminal 1 (Hardhat node) is still running

**Verify deployment succeeded:**
```bash
cat contracts/deployment.json
```

You should see JSON with **non-empty** contract addresses like:
```json
{
  "contracts": {
    "bank": {
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    },
    "governance": {
      "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    }
  }
}
```

**⚠️ If addresses are empty (""), the deployment failed. Check Terminal 1 (Hardhat node) is running.**

---

## Step 5: Install and Configure MetaMask

### 5.1 Install MetaMask

1. Go to https://metamask.io/download/
2. Install MetaMask browser extension
3. Create a new wallet or import existing
4. **Save your seed phrase securely!**

### 5.2 Add Localhost Network to MetaMask

1. Open MetaMask extension
2. Click the network dropdown (top center, usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name:** `Localhost 8545`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
   - **Block Explorer URL:** (leave empty)
5. Click "Save"

### 5.3 Import Test Account to MetaMask

1. In MetaMask, click the account icon (top right)
2. Click "Import Account"
3. Select "Private Key"
4. Paste the private key you copied from Step 3 (Terminal 1)
5. Click "Import"

You should now see your account with 10000 ETH balance.

**Security Note:** This is a test account with a fake private key. Never use this in production!

---

## Step 6: Start the Frontend (Terminal 3)

Open a **THIRD terminal window** and run:

```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run dev
```

**Expected output:**
```
VITE v6.4.1  ready in 579 ms
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

---

## Step 7: Open the App in Browser

1. Open your browser (Chrome, Firefox, Brave, or Edge)
2. Go to: **http://localhost:3000**
3. You should see the landing page

---

## Step 8: Connect MetaMask

1. Click "Get Started" or "Connect Wallet" button
2. MetaMask popup should appear
3. Select your account (the one with 10000 ETH)
4. Click "Connect" or "Next"
5. Click "Connect" to approve

**Expected Result:**
- Wallet address appears in the header
- Balance shows (initially 0 ETH in bank)
- Dashboard is visible

---

## Troubleshooting Connection Issues

### Issue: "Contracts not initialized" or app stops at connect

**Solution 1: Verify deployment.json has valid addresses**
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
cat contracts/deployment.json
```

**Check that addresses are NOT empty:**
- ❌ Bad: `"address": ""`
- ✅ Good: `"address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"`

**If addresses are empty, redeploy:**
1. Make sure Hardhat node is running (Terminal 1)
2. Run: `npm run deploy:local`
3. Wait for "Deployment completed successfully!"
4. Check deployment.json again

**Solution 2: Check Hardhat node is running**
In Terminal 1, you should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```
If not, restart: `npm run node`

**Solution 2: Check Hardhat node is running**
```bash
# In Terminal 1, make sure you see:
# "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
```

If not, restart it:
```bash
npm run node
```

**Solution 3: Check MetaMask is on correct network**
- Open MetaMask
- Network should show "Localhost 8545"
- If not, switch to it from the network dropdown

**Solution 4: Check browser console for errors**
- Press F12 (or Cmd+Option+I on Mac)
- Go to Console tab
- Look for red error messages
- Common errors:
  - "Failed to fetch" → Hardhat node not running
  - "Contract address not found" → Need to deploy contracts
  - "User denied" → You cancelled MetaMask prompt

**Solution 5: Restart everything in order**
```bash
# Terminal 1: Stop (Ctrl+C), then:
npm run node

# Terminal 2: 
npm run deploy:local

# Terminal 3: Stop (Ctrl+C), then:
npm run dev
```

Then refresh browser (Cmd+R or F5)

---

## Step 9: Test a Transaction

Once connected:

1. Click "Deposit" button on Dashboard
2. Enter amount: `1`
3. Click "Confirm Deposit"
4. MetaMask popup appears
5. Click "Confirm" in MetaMask
6. Wait for transaction to process (5-10 seconds)
7. Balance should update automatically

If this works, everything is set up correctly! ✅

---

## Quick Command Reference

### Start Everything (3 Terminals Required)

**Terminal 1 - Blockchain:**
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run node
```

**Terminal 2 - Deploy:**
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run deploy:local
```

**Terminal 3 - Frontend:**
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run dev
```

### Stop Everything

Press `Ctrl+C` in each terminal to stop.

Or kill all processes:
```bash
pkill -f "hardhat node"
pkill -f "vite"
```

---

## Common Issues and Solutions

### "Cannot connect to MetaMask"
- Ensure MetaMask extension is installed and unlocked
- Refresh the page
- Check browser allows MetaMask extension

### "Network not found"
- Add Localhost network to MetaMask (Step 5.2)
- Ensure Chain ID is exactly `31337`

### "Insufficient funds"
- Use the imported test account (has 10000 ETH)
- Or import another account from Hardhat node output

### "Transaction failed"
- Check Hardhat node is running
- Check you're on correct network
- Check browser console for error details

### "deployment.json not found"
```bash
npm run deploy:local
```

---

## Next Steps

Once everything is working:

1. ✅ Test deposit transaction
2. ✅ Test withdraw transaction  
3. ✅ Test transfer transaction
4. ✅ Create a governance proposal
5. ✅ Vote on a proposal

See `TESTING_GUIDE.md` for detailed testing procedures.

---

## Deploy to Testnet (Optional)

When ready to test on Sepolia testnet:

1. Get Sepolia ETH from faucet
2. Update `.env` with your private key
3. Deploy: `npm run deploy:sepolia`
4. Verify contracts on Etherscan
5. Update frontend with deployed addresses

See `DEPLOYMENT_GUIDE.md` for details.

---

## Need Help?

Check these files:
- `TESTING_GUIDE.md` - Complete testing procedures
- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `MIGRATION_SUMMARY.md` - What changed in the app

Or check browser console (F12) for specific error messages.

