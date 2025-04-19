// Simplified Hash Fortress Solver
// This script works with the modified Level2HashFortress contract

const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  try {
    const { contractAddresses } = await import('../frontend/src/config/addresses.js');

    console.log("🔐 BLOCKCHAIN GUARDIAN: LEVEL 2 HASH FORTRESS (SIMPLIFIED) 🔐");
    console.log("=========================================================");
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    const wallet = new ethers.Wallet(process.env.HT_PRIVATE_KEY, provider);
    const walletAddress = wallet.address;
    
    console.log(`Using wallet address: ${walletAddress}`);
    
    // Contract addresses
    const LEVEL2_CONTRACT_ADDRESS = process.env.LEVEL2_CONTRACT_ADDRESS || contractAddresses.Level2HashFortress;
    const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame;
    
    console.log(`Level2 Contract: ${LEVEL2_CONTRACT_ADDRESS}`);
    console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);
    
    // Contract ABI
    const level2Abi = [
      "function targetPrefixHash() view returns (bytes32)",
      "function solveHashPuzzle(bytes32 solution) returns (bool)"
    ];
    
    const gameAbi = [
      "function playerLevel(address player) public view returns (uint256)"
    ];
    
    // Create contract instances
    const level2Contract = new ethers.Contract(LEVEL2_CONTRACT_ADDRESS, level2Abi, wallet);
    const gameContract = new ethers.Contract(GAME_CONTRACT_ADDRESS, gameAbi, wallet);
    
    // Check current player level
    const initialLevel = await gameContract.playerLevel(walletAddress);
    console.log(`Current player level: ${initialLevel}`);
    
    // Get target prefix
    const targetPrefix = await level2Contract.targetPrefixHash();
    console.log(`Target prefix: ${targetPrefix}`);
    
    // SIMPLIFIED: Now we only need to match the first byte (much easier)
    const targetPrefixMask = BigInt('0xff00000000000000000000000000000000000000000000000000000000000000');
    const maskedTarget = BigInt(targetPrefix) & targetPrefixMask;
    console.log(`Masked target: 0x${maskedTarget.toString(16)}`);
    
    // Hash function that matches the contract's implementation
    const hashValue = (solution) => {
      return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [solution]));
    };
    
    console.log("\nMining for a solution...");
    let found = false;
    let attempts = 0;
    let solution = '';
    let solutionHash = '';
    
    // This should find a solution much faster since we only need to match 1 byte
    const startTime = Date.now();
    
    while (!found && attempts < 100000) {
      attempts++;
      
      // Generate a random bytes32 value
      solution = ethers.hexlify(ethers.randomBytes(32));
      
      // Calculate hash
      const hash = hashValue(solution);
      
      // Check if first byte matches
      const maskedHash = BigInt(hash) & targetPrefixMask;
      
      if (maskedHash === maskedTarget) {
        found = true;
        solutionHash = hash;
        const duration = (Date.now() - startTime) / 1000;
        console.log(`\nSolution found after ${attempts} attempts (${duration.toFixed(2)} seconds)!`);
        console.log(`Solution (bytes32): ${solution}`);
        console.log(`Hashed result: ${hash}`);
        break;
      }
      
      if (attempts % 1000 === 0) {
        console.log(`Tried ${attempts} solutions...`);
      }
    }
    
    if (!found) {
      console.log("Could not find a solution in the allowed attempts. Try again.");
      return;
    }
    
    // Submit solution to contract
    console.log("\nSubmitting solution to contract...");
    
    const tx = await level2Contract.solveHashPuzzle(solution, {
      gasLimit: 500000
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.hash}`);
    console.log(`Gas used: ${receipt.gasUsed}`);
    
    // Check if level completed
    const playerLevel = await gameContract.playerLevel(walletAddress);
    console.log(`\nPlayer level after submission: ${playerLevel}`);
    
    if (Number(playerLevel) >= 2) {
      console.log("\n🎮 LEVEL 2 COMPLETED SUCCESSFULLY! 🎮");
    } else {
      console.log("\n❌ Level not completed. Please check your solution.");
    }
  } catch (error) {
    console.error(`\n❌ Script failed: ${error.message}`);
    if (error.reason) console.error(`Reason: ${error.reason}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });