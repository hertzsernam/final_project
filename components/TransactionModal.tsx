import React, { useState } from 'react';
import type { TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: TransactionType;
  onConfirm: (type: TransactionType, amount: number, recipient?: string) => void;
  currentBalance: number;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transactionType, onConfirm, currentBalance }) => {
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if ((transactionType === 'Withdraw' || transactionType === 'Transfer') && numAmount > currentBalance) {
      setError('Insufficient balance.');
      return;
    }
    if (transactionType === 'Transfer') {
      if (!recipient.trim()) {
        setError('Please enter a recipient address.');
        return;
      }
      if (!recipient.startsWith('0x') || recipient.length !== 42) {
        setError('Please enter a valid Ethereum address (0x followed by 40 hex characters).');
        return;
      }
    }
    
    setError('');
    setIsProcessing(true);
    
    try {
      await onConfirm(transactionType, numAmount, recipient);
      onClose();
      setAmount('');
      setRecipient('');
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 m-4 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">{transactionType} Funds</h2>

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
          <div className="relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">ETH</span>
             <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 pl-7 pr-4 focus:ring-blue-500 focus:border-blue-500"
             />
          </div>
        </div>
        
        {transactionType === 'Transfer' && (
          <div className="mb-4">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-400 mb-2">Recipient Address</label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {isProcessing ? 'Processing...' : `Confirm ${transactionType}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;