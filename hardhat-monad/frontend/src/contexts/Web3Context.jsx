// src/contexts/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddresses } from '../config/addresses';
import { abis } from '../abis';

// Create context
const Web3Context = createContext(null);

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contracts, setContracts] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      
      // Get chain ID
      web3Provider.getNetwork().then(network => {
        setChainId(network.chainId);
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setSigner(null);
          setIsConnected(false);
        } else {
          setAccount(accounts[0]);
        }
      });
    } else {
      setError("Please install MetaMask to use this dApp");
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // Initialize contracts when provider and account are available
  useEffect(() => {
    if (provider && account) {
      const initializeContracts = async () => {
        try {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
  
          const gameContract = new ethers.Contract(
            contractAddresses.BlockchainGuardianGame,
            abis.BlockchainGuardianGame,
            newSigner
          );
  
          // Initialize level contracts
          const initLevelContracts = async () => {
            try {
              const totalLevels = await gameContract.totalLevels();
              const levelContracts = {};
  
              for (let i = 1; i <= totalLevels; i++) {
                const levelContractAddress = await gameContract.levelContracts(i);
                
                // Skip if contract address is not set (0x0)
                if (levelContractAddress === "0x0000000000000000000000000000000000000000") {
                  continue;
                }
  
                // Determine contract name by level
                let contractName;
                switch(i) {
                  case 1: contractName = "Level1Genesis"; break;
                  case 2: contractName = "Level2HashFortress"; break;
                  case 3: contractName = "Level3MerkleMaze"; break;
                  case 4: contractName = "Level4ReentrancyLabyrinth"; break;
                  case 5: contractName = "Level5ConsensusArena"; break;
                  default: contractName = `Level${i}`; break;
                }
  
                // Create contract instance if ABI exists
                if (abis[contractName]) {
                  levelContracts[i] = new ethers.Contract(
                    levelContractAddress,
                    abis[contractName],
                    newSigner
                  );
                }
              }
  
              setContracts({
                game: gameContract,
                levels: levelContracts
              });
            } catch (error) {
              console.error("Error initializing level contracts:", error);
              setError("Failed to initialize game contracts");
            }
          };
  
          await initLevelContracts();
        } catch (error) {
          console.error("Error initializing contracts:", error);
          setError("Failed to initialize contracts");
        }
      };
  
      initializeContracts();
    }
  }, [provider, account]);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask to use this dApp");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
    setContracts({});
  };

  // Check if chain ID is supported
  const isChainSupported = (id) => {
    // Define your supported chain IDs here
    const supportedChains = [1, 5, 11155111, 1337]; // Mainnet, Goerli, Sepolia, Local
    return supportedChains.includes(Number(id));
  };

  // Switch chain function
  const switchChain = async (targetChainId) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      console.error("Error switching chain:", error);
      setError("Failed to switch network");
    }
  };

  // Context value
  const value = {
    account,
    provider,
    signer,
    chainId,
    contracts,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    isChainSupported,
    switchChain
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;