import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';

const Level1Genesis = () => {
  const { account, contracts } = useWeb3();
  const [gameAddress, setGameAddress] = useState('');
  const [level1Address, setLevel1Address] = useState('');
  const [playerLevel, setPlayerLevel] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Get contract addresses when component mounts
    if (contracts && contracts.game) {
      setGameAddress(contracts.game.target);
    }
    if (contracts && contracts.levels && contracts.levels[1]) {
      setLevel1Address(contracts.levels[1].target);
    }
    
    // Check player level
    const checkPlayerLevel = async () => {
      if (contracts && contracts.game && account) {
        try {
          const level = await contracts.game.playerLevel(account);
          setPlayerLevel(Number(level));
        } catch (error) {
          console.error("Failed to check player level:", error);
        }
      }
    };
    
    checkPlayerLevel();
    
    // Set interval to check player level periodically
    const intervalId = setInterval(checkPlayerLevel, 5000);
    
    return () => clearInterval(intervalId);
  }, [contracts, account]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-lg text-white">
      <div className="mb-6 border-b border-slate-600 pb-4">
        <h1 className="text-3xl font-bold text-green-400">LEVEL 1: GENESIS - HACKER CHALLENGE</h1>
        <p className="mt-2 text-slate-300">
          The GUI verification system is malfunctioning. To prove your blockchain mastery, 
          you must interact with the contracts directly through code.
        </p>
      </div>

      {playerLevel >= 1 ? (
        <div className="bg-green-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-green-300">LEVEL COMPLETE!</h2>
          <p>You've successfully hacked the verification system. Proceed to Level 2.</p>
        </div>
      ) : (
        <div className="bg-slate-700 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-yellow-300">MISSION ACTIVE</h2>
          <p>Current objective: Bypass the GUI and verify your signature directly with the contract.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="font-bold text-blue-300 mb-2">CONTRACT ADDRESSES</h3>
          <div className="mb-2">
            <label className="block text-sm text-slate-400">Game Contract:</label>
            <code className="block bg-slate-900 p-2 rounded text-green-400 overflow-x-auto">{gameAddress || 'Loading...'}</code>
          </div>
          <div>
            <label className="block text-sm text-slate-400">Level 1 Contract:</label>
            <code className="block bg-slate-900 p-2 rounded text-green-400 overflow-x-auto">{level1Address || 'Loading...'}</code>
          </div>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="font-bold text-blue-300 mb-2">REQUIRED CONTRACT FUNCTIONS</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li><code className="bg-slate-800 px-1 rounded">verifySignature(bytes32 txHash, uint8 v, bytes32 r, bytes32 s)</code></li>
            <li><code className="bg-slate-800 px-1 rounded">getEthSignedMessageHash(bytes32 _messageHash)</code></li>
            <li><code className="bg-slate-800 px-1 rounded">playerLevel(address player)</code> - On Game Contract</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-700 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-blue-300 mb-2">MISSION INSTRUCTIONS</h3>
        <ol className="list-decimal pl-5 space-y-2 text-slate-300">
          <li>Create a Node.js script to interact with the blockchain</li>
          <li>Connect to the network and create a wallet instance</li>
          <li>Create a message and sign it with your private key</li>
          <li>Extract the signature components (v, r, s)</li>
          <li>Call <code className="bg-slate-800 px-1 rounded">verifySignature()</code> on the Level 1 contract</li>
          <li>Verify completion by checking your player level</li>
        </ol>
      </div>

      <div className="flex justify-center mb-6">
        <button 
          onClick={() => setShowHint(!showHint)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {showHint ? "Hide Code Hint" : "Show Code Hint"}
        </button>
      </div>

      {showHint && (
        <div className="bg-slate-900 p-4 rounded-lg mb-6 overflow-x-auto">
          <h3 className="font-bold text-yellow-300 mb-2">CODE HINT</h3>
          <pre className="text-green-400 text-sm">
{`// Code snippet - create a file with this structure
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Connect to the network
  const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
  
  // Your wallet private key (use environment variables!)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Contract addresses (replace with the actual addresses shown above)
  const GAME_ADDRESS = '${gameAddress || '(copy from above)'}';
  const LEVEL1_ADDRESS = '${level1Address || '(copy from above)'}';
  
  // Contract ABIs (minimum required functions)
  const level1Abi = [
    "function verifySignature(bytes32 txHash, uint8 v, bytes32 r, bytes32 s) public returns (address)",
    "function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32)"
  ];
  
  const gameAbi = [
    "function playerLevel(address player) public view returns (uint256)"
  ];
  
  // Create contract instances
  const level1Contract = new ethers.Contract(LEVEL1_ADDRESS, level1Abi, wallet);
  const gameContract = new ethers.Contract(GAME_ADDRESS, gameAbi, wallet);
  
  // Create and sign a message
  const message = "Your message here";
  // ... (continue with signing and verification)
}`}
          </pre>
        </div>
      )}

      <div className="bg-red-900 p-4 rounded-lg mb-4">
        <h3 className="font-bold text-red-300 mb-2">⚠️ SECURITY WARNING</h3>
        <p className="text-slate-300">
          Never hardcode your private key. Always use environment variables (.env file) 
          and ensure your private key is kept secure.
        </p>
      </div>

      <div className="bg-slate-700 p-4 rounded-lg">
        <h3 className="font-bold text-blue-300 mb-2">BLOCKCHAIN GUARDIAN NOTES</h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-300">
          <li>In Ethereum, message signatures include a prefix to prevent signing arbitrary transactions</li>
          <li>The signature components v, r, s are crucial for recovering the signer's address</li>
          <li>The v value might need normalization (subtract 27) depending on the contract implementation</li>
          <li>If one approach fails, try alternatives: raw components, normalized v, or full signature bytes</li>
        </ul>
      </div>
    </div>
  );
};

export default Level1Genesis;