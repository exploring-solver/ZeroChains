// src/hooks/useContract.js
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

/**
 * Hook for interacting with a contract
 * @param {string} address Contract address
 * @param {Object} abi Contract ABI
 * @returns {Object} Contract instance and loading state
 */
export const useContract = (address, abi) => {
  const { provider, signer, isConnected } = useWeb3();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConnected || !address || !abi) {
      setContract(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create contract instance with signer if available, or read-only with provider
      const contractInstance = new ethers.Contract(
        address,
        abi,
        signer || provider
      );
      
      setContract(contractInstance);
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError('Failed to initialize contract');
    } finally {
      setIsLoading(false);
    }
  }, [address, abi, provider, signer, isConnected]);

  return { contract, isLoading, error };
};

