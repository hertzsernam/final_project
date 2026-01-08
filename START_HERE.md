# 🚀 START HERE - Quick Setup Commands

If the app stops at "Connect with MetaMask", follow these steps **IN ORDER**:

## ⚡ Fast Setup (Copy-Paste These Commands)

### Terminal 1: Start Blockchain
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run node
```
**Wait for:** "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
**Keep this terminal open!**

---

### Terminal 2: Deploy Contracts
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run deploy:local
```
**Wait for:** "Deployment completed successfully!"
**Verify:** Run `cat contracts/deployment.json` - addresses should NOT be empty

---

### Terminal 3: Start App
```bash
cd "/Users/anurag/Downloads/defichain-bank-simulator (2)"
npm run dev
```
**Open:** http://localhost:3000

---

## 🔧 If App Stops at "Connect with MetaMask"

### Check 1: Are contracts deployed?
```bash
cat contracts/deployment.json
```
If addresses are `""` (empty), run:
```bash
# Make sure Terminal 1 is running first, then:
npm run deploy:local
```

### Check 2: Is Hardhat node running?
Look at Terminal 1. It should show:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```
If not, restart: `npm run node`

### Check 3: Browser Console (F12)
Press F12 → Console tab → Look for error messages:
- "Contracts not initialized" → Deploy contracts
- "MetaMask not detected" → Install MetaMask extension
- "Failed to fetch" → Hardhat node not running

### Check 4: MetaMask Configuration
1. Open MetaMask
2. Network should be "Localhost 8545"
3. If not, add network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

---

## 📋 Complete Setup Checklist

- [ ] Dependencies installed: `npm install`
- [ ] Contracts compiled: `npm run compile`
- [ ] Hardhat node running (Terminal 1)
- [ ] Contracts deployed (Terminal 2) - **addresses NOT empty**
- [ ] Frontend running (Terminal 3)
- [ ] MetaMask installed and unlocked
- [ ] MetaMask on "Localhost 8545" network
- [ ] Browser at http://localhost:3000

---

## 🆘 Still Not Working?

1. **Check all 3 terminals are running:**
   - Terminal 1: `npm run node` (Hardhat)
   - Terminal 2: `npm run deploy:local` (should have completed)
   - Terminal 3: `npm run dev` (Vite)

2. **Verify deployment.json:**
   ```bash
   cat contracts/deployment.json | grep address
   ```
   Addresses should look like: `"address": "0x1234..."` (NOT empty)

3. **Check browser console (F12):**
   - Copy any red error messages
   - Look for specific error about contracts

4. **Restart everything:**
   - Stop all terminals (Ctrl+C)
   - Start Terminal 1: `npm run node`
   - Wait 5 seconds
   - Start Terminal 2: `npm run deploy:local`
   - Wait for "Deployment completed successfully!"
   - Start Terminal 3: `npm run dev`
   - Refresh browser (F5)

---

## 📖 More Help

- **Detailed guide:** See `QUICK_START.md`
- **Testing:** See `TESTING_GUIDE.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`

---

## ✅ Success Indicators

When everything works, you should see:
- ✅ Wallet address in header
- ✅ Balance displayed (0 ETH initially)
- ✅ Dashboard visible
- ✅ No errors in browser console (F12)
- ✅ Can click "Deposit" button

If you see all of these, you're ready to use the app! 🎉

