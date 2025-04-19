// src/hooks/useGameState.js
import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

/**
 * Hook for tracking player's game state
 * @returns {Object} Player state and refresh function
 */
export const useGameState = () => {
  const { account, contracts, isConnected } = useWeb3();
  
  const [playerLevel, setPlayerLevel] = useState(0);
  const [securityPoints, setSecurityPoints] = useState(0);
  const [totalGasUsed, setTotalGasUsed] = useState(0);
  const [isGenesisGuardian, setIsGenesisGuardian] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to refresh player state
  const refreshState = useCallback(async () => {
    if (!isConnected || !account || !contracts.game) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch player data
      const level = await contracts.game.playerLevel(account);
      const points = await contracts.game.securityPoints(account);
      const gas = await contracts.game.totalGasUsed(account);
      const guardian = await contracts.game.isGenesisGuardian(account);

      // Update state
      setPlayerLevel(level.toNumber());
      setSecurityPoints(points.toNumber());
      setTotalGasUsed(gas.toNumber());
      setIsGenesisGuardian(guardian);
    } catch (err) {
      console.error('Error fetching player state:', err);
      setError('Failed to fetch player state');
    } finally {
      setIsLoading(false);
    }
  }, [account, contracts.game, isConnected]);

  // Initial fetch
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  return {
    playerLevel,
    securityPoints,
    totalGasUsed,
    isGenesisGuardian,
    isLoading,
    error,
    refreshState
  };
};