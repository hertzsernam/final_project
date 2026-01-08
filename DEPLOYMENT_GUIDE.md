# Deployment Guide

This guide explains how to deploy the DeFiChain Bank Simulator to a real blockchain network (Sepolia testnet or Mainnet) and verify contracts on Etherscan.

## Prerequisites

1. **MetaMask installed** - Users need MetaMask to interact with the app
2. **Node.js** (v18+) and npm installed
3. **Hardhat** configured in the project
4. **Environment variables** set up

## Step 1: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# For deploying to Sepolia testnet
SEPOLIA_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here  # Never commit this!
ETHERSCAN_API_KEY=your_etherscan_api_key

# For mainnet deployment
MAINNET_URL=https://eth.llamarpc.com
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Security Warning:** Never commit your `.env` file or private keys to version control!

## Step 2: Get Testnet ETH

For Sepolia testnet, you'll need Sepolia ETH for gas fees:

1. Visit a Sepolia faucet:
   - https://sepoliafaucet.com/
   - https://faucet.quicknode.com/ethereum/sepolia
   - Or use Alchemy's faucet

2. Send ETH to your deployment address

## Step 3: Compile Contracts

```bash
npm run compile
```

This compiles all Solidity contracts and generates ABIs.

## Step 4: Deploy Contracts

### Deploy to Localhost (for testing)

1. Start a local Hardhat node in one terminal:
```bash
npm run node
```

2. Deploy contracts in another terminal:
```bash
npm run deploy:local
```

The deployment script will:
- Deploy Governance contract
- Deploy Bank contract
- Deploy BankMock contract (only on localhost)
- Save contract addresses to `contracts/deployment.json`

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

This will:
- Deploy contracts to Sepolia testnet
- Save addresses to `contracts/deployment.json`
- Display contract addresses in the console

### Deploy to Mainnet

⚠️ **Warning:** Only deploy to mainnet after thorough testing on testnet!

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Step 5: Verify Contracts on Etherscan

After deployment, verify your contracts on Etherscan so users can view the source code:

```bash
# For Sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# For Mainnet
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

Example:
```bash
# Verify Bank contract
npx hardhat verify --network sepolia 0xYourBankAddress

# Verify Governance contract
npx hardhat verify --network sepolia 0xYourGovernanceAddress
```

## Step 6: Update Frontend Configuration

After deployment, update your frontend to use the deployed contract addresses:

### Option 1: Use deployment.json (automatic)
The app automatically loads addresses from `contracts/deployment.json` if it exists.

### Option 2: Use environment variables
Create a `.env` file in the root with:
```
VITE_BANK_ADDRESS=0xYourBankAddress
VITE_GOVERNANCE_ADDRESS=0xYourGovernanceAddress
```

Then rebuild:
```bash
npm run build
```

## Step 7: Build and Deploy Frontend

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with the production-ready app.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Deploy to Other Platforms

The `dist/` folder can be deployed to:
- Netlify
- GitHub Pages
- Any static hosting service

## Network Configuration

The app supports these networks:

- **Localhost** (Chain ID: 31337) - For development
- **Sepolia** (Chain ID: 11155111) - Ethereum testnet
- **Mainnet** (Chain ID: 1) - Ethereum mainnet

When users connect their MetaMask:
1. The app detects the current network
2. If on wrong network, user can switch networks
3. For localhost, MetaMask will prompt to add the network

## Troubleshooting

### "Contract not initialized" error
- Make sure contracts are deployed and addresses are set in `contracts/deployment.json` or environment variables

### "Insufficient funds" error
- User needs ETH in their wallet for gas fees
- For testnet, use a faucet to get test ETH

### MetaMask network errors
- Ensure MetaMask is on the correct network
- The app will prompt to switch networks if needed

### Transaction failures
- Check gas prices
- Ensure user has sufficient ETH balance
- Verify contract addresses are correct

## Security Notes

1. **Private Keys:** Never expose your private key. Use environment variables and `.gitignore`
2. **Test First:** Always test on testnet before mainnet deployment
3. **Audit Contracts:** Consider having smart contracts audited before mainnet deployment
4. **Rate Limiting:** Consider adding rate limiting for production
5. **Error Handling:** The app includes error handling, but monitor for edge cases

## Next Steps

1. Test all functionality on testnet
2. Verify contracts on Etherscan
3. Share contract addresses with users
4. Monitor transactions on Etherscan
5. Consider adding analytics to track usage

## Support

For issues or questions:
- Check the main README.md
- Review contract code in `contracts/`
- Check Hardhat documentation: https://hardhat.org/docs

