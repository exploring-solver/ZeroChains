// src/hooks/useLevels.js
import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

/**
 * Hook for managing game levels
 * @returns {Object} Level data and helper functions
 */
export const useLevels = () => {
  const { contracts, isConnected } = useWeb3();
  
  const [totalLevels, setTotalLevels] = useState(0);
  const [levelContracts, setLevelContracts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch total levels from game contract
  const fetchTotalLevels = useCallback(async () => {
    if (!isConnected || !contracts.game) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const levels = await contracts.game.totalLevels();
      setTotalLevels(levels.toNumber());
    } catch (err) {
      console.error('Error fetching total levels:', err);
      setError('Failed to fetch game levels');
    } finally {
      setIsLoading(false);
    }
  }, [contracts.game, isConnected]);

  // Fetch level contract addresses
  const fetchLevelContracts = useCallback(async () => {
    if (!isConnected || !contracts.game || totalLevels === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const levelAddresses = {};
      
      // Fetch each level contract address
      for (let i = 1; i <= totalLevels; i++) {
        const address = await contracts.game.levelContracts(i);
        if (address !== ethers.constants.AddressZero) {
          levelAddresses[i] = address;
        }
      }
      
      setLevelContracts(levelAddresses);
    } catch (err) {
      console.error('Error fetching level contracts:', err);
      setError('Failed to fetch level contracts');
    } finally {
      setIsLoading(false);
    }
  }, [contracts.game, isConnected, totalLevels]);

  // Initialize data
  useEffect(() => {
    fetchTotalLevels();
  }, [fetchTotalLevels]);

  useEffect(() => {
    if (totalLevels > 0) {
      fetchLevelContracts();
    }
  }, [fetchLevelContracts, totalLevels]);

  return {
    totalLevels,
    levelContracts,
    isLoading,
    error,
    refreshLevels: fetchLevelContracts
  };
};