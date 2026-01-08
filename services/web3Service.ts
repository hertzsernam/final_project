/**
 * Web3 Service for interacting with smart contracts
 * Provides real blockchain integration with MetaMask
 */

import { ethers } from "ethers";
import BankABI from "../artifacts/contracts/Bank.sol/Bank.json";
import GovernanceABI from "../artifacts/contracts/Governance.sol/Governance.json";

// Try to import deployment info, but it might not exist yet
// Using dynamic import since we're in ESM module
let deploymentInfo: any = null;
async function loadDeploymentInfo() {
  try {
    const module = await import("../contracts/deployment.json");
    return module.default || module;
  } catch (e) {
    // deployment.json doesn't exist yet, will use defaults
    return null;
  }
}

export interface ContractAddresses {
  bank: string;
  governance: string;
  bankMock?: string;
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      selectedAddress?: string;
    };
  }
}

export class Web3Service {
  private static instance: Web3Service;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contractAddresses: ContractAddresses | null = null;
  private bankContract: ethers.Contract | null = null;
  private governanceContract: ethers.Contract | null = null;

  private constructor() {}

  static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  }

  /**
   * Initialize provider and signer from MetaMask
   */
  async initialize(): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
    }

    // Create provider from window.ethereum
    this.provider = new ethers.BrowserProvider(window.ethereum!);
    
    // Request account access
    await this.provider.send("eth_requestAccounts", []);
    
    // Get signer
    this.signer = await this.provider.getSigner();

    // Load contract addresses
    await this.loadContractAddresses();

    // Initialize contracts
    await this.initializeContracts();
  }

  /**
   * Load contract addresses from deployment.json or environment
   */
  async loadContractAddresses(): Promise<void> {
    try {
      console.log("📋 Loading contract addresses...");
      
      // Try to load deployment info
      if (!deploymentInfo) {
        console.log("  Attempting to load deployment.json...");
        deploymentInfo = await loadDeploymentInfo();
      }
      
      // Try to load from deployment.json first
      if (deploymentInfo && deploymentInfo.contracts) {
        console.log("  ✅ Found deployment.json with contracts");
        this.contractAddresses = {
          bank: deploymentInfo.contracts.bank.address,
          governance: deploymentInfo.contracts.governance.address,
          ...(deploymentInfo.contracts.bankMock && {
            bankMock: deploymentInfo.contracts.bankMock.address,
          }),
        };
        console.log("  Bank address:", this.contractAddresses.bank);
        console.log("  Governance address:", this.contractAddresses.governance);
      } else {
        console.log("  ⚠️  deployment.json not found or empty, using defaults");
        // Fallback to environment variables or default localhost addresses
        const bankAddr = (import.meta as any).env?.VITE_BANK_ADDRESS;
        const govAddr = (import.meta as any).env?.VITE_GOVERNANCE_ADDRESS;
        this.contractAddresses = {
          bank: bankAddr || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          governance: govAddr || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        };
        console.log("  Using default addresses:");
        console.log("  Bank:", this.contractAddresses.bank);
        console.log("  Governance:", this.contractAddresses.governance);
        console.log("  ℹ️  To use custom addresses, deploy contracts first: npm run deploy:local");
      }
    } catch (error) {
      console.error("❌ Error loading contract addresses:", error);
      // Use default localhost addresses
      this.contractAddresses = {
        bank: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        governance: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      };
      console.log("  Using fallback default addresses");
    }
  }

  /**
   * Initialize contract instances
   */
  async initializeContracts(): Promise<void> {
    if (!this.signer) {
      throw new Error("Signer not initialized. Please connect your wallet first.");
    }
    
    if (!this.contractAddresses) {
      throw new Error("Contract addresses not loaded. Please deploy contracts first: npm run deploy:local");
    }

    console.log("🔗 Initializing contract instances...");
    
    try {
      this.bankContract = new ethers.Contract(
        this.contractAddresses.bank,
        BankABI.abi,
        this.signer
      );
      console.log("  ✅ Bank contract initialized at:", this.contractAddresses.bank);

      this.governanceContract = new ethers.Contract(
        this.contractAddresses.governance,
        GovernanceABI.abi,
        this.signer
      );
      console.log("  ✅ Governance contract initialized at:", this.contractAddresses.governance);
    } catch (error) {
      console.error("❌ Error initializing contracts:", error);
      throw new Error(`Failed to initialize contracts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current account address
   */
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected. Please connect your MetaMask wallet.");
    }
    return await this.signer.getAddress();
  }

  /**
   * Get account balance (ETH)
   */
  async getBalance(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error("Provider not initialized");
    }
    const address = await this.signer.getAddress();
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get Bank contract balance for user
   */
  async getBankBalance(address?: string): Promise<string> {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }
    const userAddress = address || await this.getAddress();
    const balance = await this.bankContract.balances(userAddress);
    return ethers.formatEther(balance);
  }

  /**
   * Deposit ETH into Bank contract
   * This will prompt MetaMask for user confirmation
   */
  async deposit(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }

    const value = ethers.parseEther(amount);
    
    // Estimate gas first
    const gasEstimate = await this.bankContract.deposit.estimateGas({ value });
    
    // Send transaction - MetaMask will prompt user
    const tx = await this.bankContract.deposit({ value, gasLimit: gasEstimate * 120n / 100n });
    
    return tx;
  }

  /**
   * Withdraw funds from Bank contract
   */
  async withdraw(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }

    const value = ethers.parseEther(amount);
    
    // Estimate gas
    const gasEstimate = await this.bankContract.withdraw.estimateGas(value);
    
    // Send transaction - MetaMask will prompt user
    const tx = await this.bankContract.withdraw(value, { gasLimit: gasEstimate * 120n / 100n });
    
    return tx;
  }

  /**
   * Transfer funds to another address
   */
  async transfer(to: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }

    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    const value = ethers.parseEther(amount);
    
    // Estimate gas
    const gasEstimate = await this.bankContract.transfer.estimateGas(to, value);
    
    // Send transaction - MetaMask will prompt user
    const tx = await this.bankContract.transfer(to, value, { gasLimit: gasEstimate * 120n / 100n });
    
    return tx;
  }

  /**
   * Get user transactions from Bank contract
   */
  async getUserTransactions(address?: string): Promise<any[]> {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }
    const userAddress = address || await this.getAddress();
    return await this.bankContract.getUserTransactions(userAddress);
  }

  /**
   * Get top token holders
   */
  async getTopHolders(): Promise<any[]> {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }
    return await this.bankContract.getTopHolders();
  }

  /**
   * Create a governance proposal
   */
  async createProposal(title: string, description: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.governanceContract) {
      throw new Error("Governance contract not initialized");
    }

    // Estimate gas
    const gasEstimate = await this.governanceContract.createProposal.estimateGas(title, description);
    
    // Send transaction - MetaMask will prompt user
    const tx = await this.governanceContract.createProposal(title, description, {
      gasLimit: gasEstimate * 120n / 100n,
    });
    
    return tx;
  }

  /**
   * Vote on a proposal
   */
  async vote(proposalId: number, support: boolean): Promise<ethers.ContractTransactionResponse> {
    if (!this.governanceContract) {
      throw new Error("Governance contract not initialized");
    }

    // Estimate gas
    const gasEstimate = await this.governanceContract.vote.estimateGas(proposalId, support);
    
    // Send transaction - MetaMask will prompt user
    const tx = await this.governanceContract.vote(proposalId, support, {
      gasLimit: gasEstimate * 120n / 100n,
    });
    
    return tx;
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: number): Promise<any> {
    if (!this.governanceContract) {
      throw new Error("Governance contract not initialized");
    }
    return await this.governanceContract.getProposal(proposalId);
  }

  /**
   * Get all proposals count
   */
  async getProposalCount(): Promise<number> {
    if (!this.governanceContract) {
      throw new Error("Governance contract not initialized");
    }
    const count = await this.governanceContract.proposalCount();
    return Number(count);
  }

  /**
   * Check if user has voted on a proposal
   */
  async hasVoted(proposalId: number, address?: string): Promise<boolean> {
    if (!this.governanceContract) {
      throw new Error("Governance contract not initialized");
    }
    const userAddress = address || await this.getAddress();
    return await this.governanceContract.hasVoted(proposalId, userAddress);
  }

  /**
   * Switch or add network
   */
  async switchNetwork(chainId: string): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    const chainIdHex = `0x${Number(chainId).toString(16)}`;

    try {
      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        const networkConfig = this.getNetworkConfig(chainId);
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [networkConfig],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Get network configuration for adding to MetaMask
   */
  private getNetworkConfig(chainId: string): any {
    const chainIdNum = Number(chainId);
    
    // Default to localhost for development
    if (chainIdNum === 31337 || chainIdNum === 1337) {
      return {
        chainId: `0x${chainIdNum.toString(16)}`,
        chainName: "Localhost 8545",
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["http://127.0.0.1:8545"],
        blockExplorerUrls: [],
      };
    }
    
    // Sepolia testnet
    if (chainIdNum === 11155111) {
      return {
        chainId: `0x${chainIdNum.toString(16)}`,
        chainName: "Sepolia",
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://rpc.sepolia.org"],
        blockExplorerUrls: ["https://sepolia.etherscan.io"],
      };
    }

    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  /**
   * Get current network chain ID
   */
  async getChainId(): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }
    const network = await this.provider.getNetwork();
    return network.chainId.toString();
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get contract addresses
   */
  getContractAddresses(): ContractAddresses {
    if (!this.contractAddresses) {
      throw new Error("Contracts not initialized");
    }
    return this.contractAddresses;
  }

  /**
   * Get contract instances
   */
  getBankContract(): ethers.Contract {
    if (!this.bankContract) {
      throw new Error("Bank contract not initialized");
    }
    return this.bankContract;
  }

  getGovernanceContract(): ethers.Contract {
    if (!this.governanceContract) {
      throw new Error("Governance contract not initialized");
    }
    return this.governanceContract;
  }

  /**
   * Convert wei to ether
   */
  weiToEther(wei: bigint | string): string {
    return ethers.formatEther(wei);
  }

  /**
   * Convert ether to wei
   */
  etherToWei(ether: string | number): bigint {
    return ethers.parseEther(ether.toString());
  }

  /**
   * Listen for account changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", callback);
    }
  }

  /**
   * Remove account change listener
   */
  removeAccountsChangedListener(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", callback);
    }
  }

  /**
   * Listen for chain changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", callback);
    }
  }

  /**
   * Remove chain change listener
   */
  removeChainChangedListener(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.removeListener("chainChanged", callback);
    }
  }
}

export const web3Service = Web3Service.getInstance();
