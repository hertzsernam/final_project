import { useState, useCallback, useEffect } from 'react';
import type { UserAccount, Transaction, Proposal, TransactionType, BalanceData, TokenHolder } from '../types';
import { web3Service } from '../services/web3Service';

export const useBlockchain = () => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceData[]>([]);
  const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([]);
  const [votedProposalIds, setVotedProposalIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load proposals and data when account changes
  useEffect(() => {
    if (account) {
      loadProposals();
      loadTransactions();
      loadTokenHolders();
    }
  }, [account]);

  const loadProposals = async () => {
    try {
      const count = await web3Service.getProposalCount();
      const proposalsList: Proposal[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const proposalData = await web3Service.getProposal(i);
          const status = await web3Service.getGovernanceContract().getProposalStatus(i);
          const hasVoted = account ? await web3Service.hasVoted(i, account.address) : false;
          
          proposalsList.push({
            id: `PIP-${String(i + 1).padStart(3, '0')}`,
            title: proposalData.title,
            description: proposalData.description,
            proposer: proposalData.proposer,
            endDate: new Date(Number(proposalData.endDate) * 1000).toLocaleDateString(),
            votesFor: Number(proposalData.votesFor),
            votesAgainst: Number(proposalData.votesAgainst),
            status: status as 'Active' | 'Passed' | 'Failed',
          });

          if (hasVoted && account) {
            setVotedProposalIds(prev => new Set(prev).add(`PIP-${String(i + 1).padStart(3, '0')}`));
          }
        } catch (err) {
          console.error(`Error loading proposal ${i}:`, err);
        }
      }
      
      setProposals(proposalsList);
    } catch (err) {
      console.error("Error loading proposals:", err);
    }
  };

  const loadTransactions = async () => {
    if (!account) return;
    
    try {
      const txData = await web3Service.getUserTransactions(account.address);
      const txList: Transaction[] = txData.map((tx: any) => ({
        id: `0x${tx.id.toString(16)}`,
        date: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        action: tx.action as Transaction['action'],
        amount: parseFloat(web3Service.weiToEther(tx.amount)),
        from: tx.from,
        to: tx.to,
        status: tx.isComplete ? 'Completed' : 'Pending',
      }));
      
      setTransactions(txList);
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  };

  const loadTokenHolders = async () => {
    try {
      const holders = await web3Service.getTopHolders();
      const holdersList: TokenHolder[] = holders.map((holder: any) => ({
        address: holder.holder,
        balance: parseFloat(web3Service.weiToEther(holder.balance)),
      }));
      
      setTokenHolders(holdersList);
    } catch (err) {
      console.error("Error loading token holders:", err);
    }
  };

  const connectWallet = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔌 Starting wallet connection...");
      
      if (!web3Service.isMetaMaskInstalled()) {
        const errorMsg = "MetaMask is not installed. Please install MetaMask to use this application.";
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log("✅ MetaMask detected");

      // Initialize web3 service
      console.log("📡 Initializing web3 service...");
      await web3Service.initialize();
      console.log("✅ Web3 service initialized");

      // Get user address and balance
      console.log("👤 Getting user address...");
      const address = await web3Service.getAddress();
      console.log("✅ Address:", address);
      
      console.log("💰 Getting balances...");
      const bankBalance = await web3Service.getBankBalance(address);
      const ethBalance = await web3Service.getBalance();
      console.log("✅ Bank balance:", bankBalance, "ETH balance:", ethBalance);

      setAccount({
        address,
        balance: parseFloat(bankBalance),
      });

      // Load initial data (don't wait for all, just start them)
      console.log("📊 Loading initial data...");
      loadProposals().catch(err => console.error("Error loading proposals:", err));
      loadTransactions().catch(err => console.error("Error loading transactions:", err));
      loadTokenHolders().catch(err => console.error("Error loading token holders:", err));

      // Set up listeners for account and chain changes
      web3Service.onAccountsChanged(async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          const newAddress = accounts[0];
          const bankBalance = await web3Service.getBankBalance(newAddress);
          setAccount({
            address: newAddress,
            balance: parseFloat(bankBalance),
          });
        }
      });

      web3Service.onChainChanged(() => {
        // Reload on chain change
        window.location.reload();
      });

      console.log("✅ Wallet connection successful!");
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("❌ Error connecting wallet:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      
      // Provide more helpful error messages
      let errorMessage = err.message || "Failed to connect wallet";
      
      if (err.code === 4001) {
        errorMessage = "Please connect your wallet in MetaMask to continue.";
      } else if (err.code === -32002) {
        errorMessage = "A connection request is already pending. Please check MetaMask.";
      } else if (err.message?.includes("not installed")) {
        errorMessage = "MetaMask is not installed. Please install MetaMask browser extension.";
      } else if (err.message?.includes("Contracts not initialized")) {
        errorMessage = "Contracts not deployed. Please deploy contracts first using 'npm run deploy:local'";
      }
      
      setError(errorMessage);
      setIsLoading(false);
      alert(`Connection Error: ${errorMessage}\n\nCheck browser console (F12) for more details.`);
      return false;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setTransactions([]);
    setBalanceHistory([]);
    setTokenHolders([]);
    setVotedProposalIds(new Set());
    setError(null);
    
    // Remove listeners
    web3Service.removeAccountsChangedListener(() => {});
    web3Service.removeChainChangedListener(() => {});
  }, []);

  const performTransaction = useCallback(async (
    type: TransactionType, 
    amount: number, 
    recipient?: string
  ): Promise<void> => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      let txResponse;
      const amountStr = amount.toString();

      if (type === 'Deposit') {
        // For deposit, user needs to send ETH, so we need to check their ETH balance
        const ethBalance = parseFloat(await web3Service.getBalance());
        if (ethBalance < amount) {
          throw new Error(`Insufficient ETH balance. You have ${ethBalance.toFixed(4)} ETH but need ${amount} ETH.`);
        }
        
        txResponse = await web3Service.deposit(amountStr);
      } else if (type === 'Withdraw') {
        const bankBalance = parseFloat(await web3Service.getBankBalance(account.address));
        if (bankBalance < amount) {
          throw new Error(`Insufficient bank balance. You have ${bankBalance.toFixed(4)} ETH in the bank.`);
        }
        
        txResponse = await web3Service.withdraw(amountStr);
      } else if (type === 'Transfer' && recipient) {
        if (!recipient || !recipient.startsWith('0x')) {
          throw new Error("Invalid recipient address. Must be a valid Ethereum address starting with 0x");
        }
        
        const bankBalance = parseFloat(await web3Service.getBankBalance(account.address));
        if (bankBalance < amount) {
          throw new Error(`Insufficient bank balance. You have ${bankBalance.toFixed(4)} ETH in the bank.`);
        }
        
        txResponse = await web3Service.transfer(recipient, amountStr);
      } else {
        throw new Error("Invalid transaction type or missing recipient");
      }

      // Wait for transaction confirmation
      const receipt = await web3Service.waitForTransaction(txResponse.hash, 1);
      
      if (receipt && receipt.status === 1) {
        // Transaction successful - reload data
        const newBankBalance = await web3Service.getBankBalance(account.address);
        setAccount(prev => prev ? { ...prev, balance: parseFloat(newBankBalance) } : null);
        
        await loadTransactions();
        await loadTokenHolders();
        
        // Add to balance history
        setBalanceHistory(prev => [
          ...prev.slice(-10), // Keep last 10
          { name: `T+${prev.length}`, balance: parseFloat(newBankBalance) }
        ]);
      } else {
        throw new Error("Transaction failed");
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error("Transaction error:", err);
      setError(err.message || "Transaction failed");
      setIsLoading(false);
      throw err; // Re-throw so UI can handle it
    }
  }, [account]);

  const voteOnProposal = useCallback(async (proposalId: string, voteType: 'For' | 'Against'): Promise<void> => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    if (votedProposalIds.has(proposalId)) {
      throw new Error("You have already voted on this proposal.");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract proposal number from ID (e.g., "PIP-001" -> 0)
      const proposalNum = parseInt(proposalId.split('-')[1]) - 1;
      const support = voteType === 'For';

      // Send transaction - MetaMask will prompt user
      const txResponse = await web3Service.vote(proposalNum, support);

      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txResponse.hash, 1);

      if (receipt && receipt.status === 1) {
        // Reload proposals to get updated vote counts
        await loadProposals();
        setVotedProposalIds(prev => new Set(prev).add(proposalId));
      } else {
        throw new Error("Vote transaction failed");
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error("Vote error:", err);
      setError(err.message || "Failed to vote");
      setIsLoading(false);
      throw err;
    }
  }, [account, votedProposalIds]);

  const createProposal = useCallback(async (title: string, description: string): Promise<void> => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send transaction - MetaMask will prompt user
      const txResponse = await web3Service.createProposal(title, description);

      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txResponse.hash, 1);

      if (receipt && receipt.status === 1) {
        // Reload proposals to include the new one
        await loadProposals();
      } else {
        throw new Error("Proposal creation failed");
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error("Create proposal error:", err);
      setError(err.message || "Failed to create proposal");
      setIsLoading(false);
      throw err;
    }
  }, [account]);

  return {
    account,
    transactions,
    proposals,
    balanceHistory,
    tokenHolders,
    connectWallet,
    disconnectWallet,
    performTransaction,
    voteOnProposal,
    createProposal,
    votedProposalIds,
    isLoading,
    error,
  };
};
