// src/contexts/GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';

// Create context
const GameContext = createContext(null);

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { account, contracts, isConnected } = useWeb3();
  
  // Player state
  const [playerLevel, setPlayerLevel] = useState(0);
  const [securityPoints, setSecurityPoints] = useState(0);
  const [totalGasUsed, setTotalGasUsed] = useState(0);
  const [isGenesisGuardian, setIsGenesisGuardian] = useState(false);
  const [playerNFTs, setPlayerNFTs] = useState([]);
  
  // Game state
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalLevels, setTotalLevels] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force a refresh of game data
  const refreshGameData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch player progress from the contract
  useEffect(() => {
    const fetchPlayerProgress = async () => {
      if (!isConnected || !account || !contracts.game) return;

      setIsLoading(true);
      try {
        // Fetch player data
        const level = await contracts.game.playerLevel(account);
        const points = await contracts.game.securityPoints(account);
        const gas = await contracts.game.totalGasUsed(account);
        const guardian = await contracts.game.isGenesisGuardian(account);
        const totalLevelsCount = await contracts.game.totalLevels();
        
        // Update state with Number() conversion for BigInt values
        setPlayerLevel(Number(level));
        setSecurityPoints(Number(points));
        setTotalGasUsed(Number(gas));
        setIsGenesisGuardian(guardian);
        setTotalLevels(Number(totalLevelsCount));
      } catch (error) {
        console.error("Error fetching player progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerProgress();
  }, [account, contracts.game, isConnected, refreshTrigger]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isConnected || !contracts.game) return;

      setIsLoading(true);
      try {
        // Get top 10 players
        const topPlayers = await contracts.game.getTopPlayers(10);
        // console.log(topPlayers._Result); // This shows an array of player objects
        // Format the data
        const formattedLeaderboard = topPlayers.map((player) => ({
          wallet: player.wallet,
          levelsCompleted: Number(player.levelsCompleted),
          securityPoints: Number(player.securityPoints),
          totalGasUsed: Number(player.totalGasUsed),
          lastUpdate: new Date(Number(player.lastUpdate) * 1000)
        }));

        setLeaderboard(formattedLeaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contracts.game, isConnected, refreshTrigger]);

  // Fetch player NFTs
  useEffect(() => {
    const fetchPlayerNFTs = async () => {
      if (!isConnected || !account || !contracts.game) return;

      setIsLoading(true);
      try {
        // Get balance of NFTs
        const balance = await contracts.game.balanceOf(account);
        const nfts = [];
        console.log(balance); // This shows 0n
        
        // Convert BigInt to number using Number()
        const balanceNumber = Number(balance);
        
        // Fetch each NFT
        for (let i = 0; i < balanceNumber; i++) {
          const tokenId = await contracts.game.tokenOfOwnerByIndex(account, i);
          nfts.push({
            tokenId: Number(tokenId), // Convert tokenId BigInt to number
            level: Math.min(Number(tokenId), totalLevels)
          });
        }

        setPlayerNFTs(nfts);
      } catch (error) {
        console.error("Error fetching player NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerNFTs();
  }, [account, contracts.game, isConnected, totalLevels, refreshTrigger]);

  // Context value
  const value = {
    // Player data
    playerLevel,
    securityPoints,
    totalGasUsed,
    isGenesisGuardian,
    playerNFTs,
    
    // Game data
    leaderboard,
    totalLevels,
    
    // State
    isLoading,
    
    // Actions
    refreshGameData
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;