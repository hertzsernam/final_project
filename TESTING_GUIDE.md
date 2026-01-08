# Testing Guide - MetaMask Integration

This guide helps you test all functionality of the DeFiChain Bank Simulator with real MetaMask integration.

## Prerequisites

1. **MetaMask Extension Installed**
   - Install MetaMask from https://metamask.io/
   - Create or import a wallet
   - Ensure you have some test ETH (for localhost, Hardhat provides test accounts)

2. **Contracts Deployed**
   - Deploy contracts to localhost or testnet
   - Contract addresses should be in `contracts/deployment.json`

3. **Development Environment**
   - Node.js 18+ installed
   - All dependencies installed: `npm install`

## Test Setup

### Step 1: Start Local Blockchain

Terminal 1 - Start Hardhat node:
```bash
npm run node
```

This will:
- Start a local Ethereum node on http://127.0.0.1:8545
- Display 20 test accounts with 10000 ETH each
- Provide accounts you can import into MetaMask for testing

### Step 2: Deploy Contracts

Terminal 2 - Deploy contracts:
```bash
npm run deploy:local
```

Copy the contract addresses shown (Bank and Governance).

### Step 3: Configure MetaMask for Localhost

1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Enter:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
4. Save

### Step 4: Import Test Account to MetaMask

1. From Hardhat node output, copy a private key
2. In MetaMask: Account menu → Import Account
3. Paste private key
4. You'll see 10000 ETH in this account

### Step 5: Start Frontend

Terminal 3 - Start dev server:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing Checklist

### ✅ 1. Wallet Connection

**Test:** Connect MetaMask wallet

**Steps:**
1. Click "Connect Wallet" button
2. MetaMask should open requesting connection
3. Click "Connect" in MetaMask
4. **Expected:** Wallet address displayed in header, balance shown

**Verify:**
- [ ] Wallet address is correct
- [ ] Balance displays correctly (initially 0 ETH in bank)
- [ ] No console errors

---

### ✅ 2. Deposit Transaction

**Test:** Deposit ETH into Bank contract

**Steps:**
1. Click "Deposit" button on Dashboard
2. Enter amount (e.g., 1 ETH)
3. Click "Confirm Deposit"
4. MetaMask popup should appear
5. Review transaction details:
   - To: Bank contract address
   - Amount: The ETH amount you entered
   - Gas fee estimate shown
6. Click "Confirm" in MetaMask
7. Wait for transaction confirmation

**Expected Results:**
- [ ] MetaMask popup appears
- [ ] Transaction details are correct
- [ ] Transaction is submitted
- [ ] Transaction shows as "Processing..." in UI
- [ ] After confirmation, balance updates automatically
- [ ] Transaction appears in transaction history
- [ ] No errors in console

**Verify on Blockchain:**
- Check Hardhat node terminal for transaction logs
- Balance should increase in Bank contract

---

### ✅ 3. Withdraw Transaction

**Test:** Withdraw ETH from Bank contract

**Prerequisites:** Must have ETH deposited first

**Steps:**
1. Ensure you have ETH in bank (deposit first if needed)
2. Click "Withdraw" button
3. Enter amount (less than your balance)
4. Click "Confirm Withdraw"
5. MetaMask popup appears
6. Confirm transaction

**Expected Results:**
- [ ] MetaMask popup appears
- [ ] Transaction executes successfully
- [ ] Balance decreases in UI
- [ ] ETH appears in MetaMask wallet
- [ ] Transaction appears in history

**Error Cases to Test:**
- [ ] Try withdrawing more than balance → Should show error
- [ ] Try withdrawing 0 → Should show validation error

---

### ✅ 4. Transfer Transaction

**Test:** Transfer funds to another address

**Prerequisites:** Must have ETH in bank

**Steps:**
1. Get another address (another MetaMask account or test address)
2. Click "Transfer" button
3. Enter recipient address (must be valid 0x address)
4. Enter amount
5. Click "Confirm Transfer"
6. MetaMask popup appears
7. Confirm transaction

**Expected Results:**
- [ ] Address validation works (invalid addresses rejected)
- [ ] MetaMask popup appears
- [ ] Transaction succeeds
- [ ] Balance decreases in sender account
- [ ] Balance increases in recipient account (check another account)
- [ ] Transaction appears in both accounts' history

**Error Cases to Test:**
- [ ] Invalid address format → Should show error
- [ ] Transfer to self → Contract should reject
- [ ] Insufficient balance → Should show error
- [ ] Empty recipient → Should show validation error

---

### ✅ 5. Create Proposal

**Test:** Create a governance proposal

**Steps:**
1. Navigate to Governance page
2. Click "Create Proposal"
3. Enter title (e.g., "Increase interest rates")
4. Enter description
5. Click "Create"
6. MetaMask popup appears
7. Confirm transaction

**Expected Results:**
- [ ] MetaMask popup appears
- [ ] Transaction executes
- [ ] New proposal appears in list
- [ ] Proposal has correct title and description
- [ ] Proposal status is "Active"
- [ ] End date is 14 days from now

**Verify on Blockchain:**
- Check Governance contract on Etherscan (or Hardhat logs)
- Proposal ID should increment

---

### ✅ 6. Vote on Proposal

**Test:** Vote for/against a proposal

**Prerequisites:** Must have at least one active proposal

**Steps:**
1. Find an active proposal
2. Click "Vote For" or "Vote Against"
3. MetaMask popup appears
4. Confirm transaction

**Expected Results:**
- [ ] MetaMask popup appears
- [ ] Transaction succeeds
- [ ] Vote counts update immediately
- [ ] Button becomes disabled (can't vote twice)
- [ ] Proposal shows you have voted

**Error Cases to Test:**
- [ ] Try voting twice → Should be rejected by contract
- [ ] Try voting on expired proposal → Should be rejected

---

### ✅ 7. Network Switching

**Test:** Handle network changes

**Steps:**
1. While connected, switch MetaMask to different network (e.g., Sepolia)
2. Try to perform a transaction

**Expected Results:**
- [ ] App detects network change
- [ ] Shows warning or prompts to switch back
- [ ] Or automatically switches to correct network

**Test:** Switch to correct network

**Steps:**
1. Click network in MetaMask
2. Switch to Localhost 8545
3. Perform transaction

**Expected Results:**
- [ ] Network switch works
- [ ] Transactions work normally

---

### ✅ 8. Account Switching

**Test:** Switch accounts in MetaMask

**Steps:**
1. Connect with Account 1
2. Deposit some ETH
3. Switch to Account 2 in MetaMask
4. Check UI

**Expected Results:**
- [ ] App detects account change
- [ ] Balance updates to Account 2's balance (should be 0)
- [ ] Previous Account 1's transactions not shown
- [ ] Can perform transactions as Account 2

---

### ✅ 9. Transaction History

**Test:** View transaction history

**Steps:**
1. Perform several transactions (deposit, withdraw, transfer)
2. Navigate to Transactions page

**Expected Results:**
- [ ] All transactions are listed
- [ ] Transactions show correct:
  - [ ] Date/time
  - [ ] Action type
  - [ ] Amount
  - [ ] From/To addresses
  - [ ] Status (Completed/Pending/Failed)
- [ ] Transactions are in chronological order (newest first)

---

### ✅ 10. Error Handling

**Test:** Various error scenarios

**Insufficient Balance:**
- [ ] Try to withdraw more than balance → Shows clear error
- [ ] Try to transfer more than balance → Shows clear error

**Network Errors:**
- [ ] Disconnect internet → Shows error message
- [ ] Wrong network → Shows error or prompts to switch

**Transaction Rejection:**
- [ ] Reject MetaMask popup → Transaction cancelled, no error state stuck
- [ ] Insufficient gas → MetaMask shows gas error

**Invalid Inputs:**
- [ ] Empty amount → Validation error
- [ ] Negative amount → Validation error
- [ ] Invalid address → Validation error
- [ ] Non-numeric amount → Validation error

---

### ✅ 11. Loading States

**Test:** UI during transactions

**Steps:**
1. Initiate a transaction
2. Observe UI during processing

**Expected Results:**
- [ ] Button shows "Processing..." state
- [ ] Button is disabled during processing
- [ ] Can't initiate another transaction while one is processing
- [ ] Loading spinner or indicator visible
- [ ] After completion, UI returns to normal

---

### ✅ 12. Balance Updates

**Test:** Real-time balance updates

**Steps:**
1. Note current balance
2. Perform deposit
3. Check balance immediately after

**Expected Results:**
- [ ] Balance updates automatically after transaction
- [ ] No page refresh needed
- [ ] Balance is accurate (matches blockchain state)

---

## Testing on Testnet (Sepolia)

For production-like testing:

### Setup Sepolia Testnet

1. Get Sepolia ETH from faucet:
   - https://sepoliafaucet.com/
   - https://faucet.quicknode.com/ethereum/sepolia

2. Deploy contracts:
   ```bash
   npm run deploy:sepolia
   ```

3. Verify contracts:
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

4. Update frontend with deployed addresses

5. Switch MetaMask to Sepolia network

6. Repeat all tests above

---

## Performance Testing

### Transaction Speed

- [ ] Deposits complete within reasonable time (< 30s on localhost)
- [ ] Withdrawals complete quickly
- [ ] UI remains responsive during transactions

### Multiple Transactions

- [ ] Can perform multiple transactions in sequence
- [ ] Each transaction processes correctly
- [ ] No state corruption

---

## Security Testing

### Access Control

- [ ] Can't withdraw others' funds
- [ ] Can't vote without wallet connection
- [ ] Proposals require wallet connection

### Input Validation

- [ ] All inputs validated before sending
- [ ] Invalid addresses rejected
- [ ] Amount validation works

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Edge
- [ ] Brave

---

## Mobile Testing (if applicable)

- [ ] Works with MetaMask mobile app
- [ ] Responsive design works
- [ ] Touch interactions work

---

## Troubleshooting

### Issue: "Contracts not initialized"
**Solution:** Ensure contracts are deployed and addresses are in deployment.json

### Issue: "MetaMask not detected"
**Solution:** Install MetaMask extension and refresh page

### Issue: "Insufficient funds"
**Solution:** Ensure account has ETH for gas fees

### Issue: "Transaction failed"
**Solution:** Check Hardhat logs or Etherscan for error details

### Issue: "Wrong network"
**Solution:** Switch MetaMask to correct network (localhost 8545 or Sepolia)

---

## Test Results Template

```
Date: ___________
Tester: ___________
Environment: [ ] Localhost [ ] Sepolia [ ] Mainnet

✅ Wallet Connection: [ ] Pass [ ] Fail
✅ Deposit: [ ] Pass [ ] Fail
✅ Withdraw: [ ] Pass [ ] Fail
✅ Transfer: [ ] Pass [ ] Fail
✅ Create Proposal: [ ] Pass [ ] Fail
✅ Vote: [ ] Pass [ ] Fail
✅ Network Switching: [ ] Pass [ ] Fail
✅ Account Switching: [ ] Pass [ ] Fail
✅ Transaction History: [ ] Pass [ ] Fail
✅ Error Handling: [ ] Pass [ ] Fail
✅ Loading States: [ ] Pass [ ] Fail
✅ Balance Updates: [ ] Pass [ ] Fail

Issues Found:
_________________________

Notes:
_________________________
```

---

## Automated Testing (Future)

Consider adding:
- Unit tests for web3Service
- Integration tests with Hardhat network
- E2E tests with Playwright/Cypress
- Contract tests with Hardhat test suite

---

## Sign-off

After completing all tests:
- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for production deployment

**Tested by:** _________________  
**Date:** _________________  
**Approved by:** _________________

