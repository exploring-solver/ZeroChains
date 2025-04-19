// Level1Genesis Testing Script
// This script demonstrates how to sign a message and verify it on the Level1Genesis contract

const { ethers } = require('ethers');
require('dotenv').config(); // For loading environment variables

async function main() {
  try {
    // Import addresses using dynamic import
    const { contractAddresses } = await import('../frontend/src/config/addresses.js');
    
    console.log("Starting Level1Genesis test script");
    
    // ============== CONFIGURATION ==============
    
    // Network setup - connect to the network where your contracts are deployed
    // For local development use http://localhost:8545
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Private key (NEVER hardcode this in production, use environment variables)
    // This is a sample key for testing only - replace with your own
    const PRIVATE_KEY = process.env.HT_PRIVATE_KEY || ''; // Default hardhat private key
    
    // Contract addresses - replace with your deployed contract addresses
    const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame;
    const LEVEL1_CONTRACT_ADDRESS = process.env.LEVEL1_CONTRACT_ADDRESS || contractAddresses.Level1Genesis;
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const walletAddress = wallet.address;
    
    console.log(`Using wallet address: ${walletAddress}`);
    
    // ============== CONTRACT INTERFACES ==============
    
    // Level1Genesis ABI - only the functions we need
    const level1Abi = [
      "function verifySignature(bytes32 txHash, uint8 v, bytes32 r, bytes32 s) public returns (address)",
      "function verifySignatureBytes(bytes32 messageHash, bytes signature) public returns (address)",
      "function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32)"
    ];
    
    // Game Contract ABI - only the functions we need to verify completion
    const gameAbi = [
      "function playerLevel(address player) public view returns (uint256)"
    ];
    
    // Create contract instances
    const level1Contract = new ethers.Contract(LEVEL1_CONTRACT_ADDRESS, level1Abi, wallet);
    const gameContract = new ethers.Contract(GAME_CONTRACT_ADDRESS, gameAbi, wallet);
    
    // ============== MESSAGE SIGNING ==============
    
    // Create a message to sign
    const message = "Hello Blockchain Guardian!";
    console.log(`Message to sign: "${message}"`);
    
    // Hash the message - this is what we'll submit to the contract
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    console.log(`Message hash: ${messageHash}`);
    
    // Sign the message
    const signature = await wallet.signMessage(message);
    console.log(`Signature: ${signature}`);
    
    // Verify the signature locally first
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log(`Locally recovered address: ${recoveredAddress}`);
    console.log(`Matches wallet address: ${recoveredAddress.toLowerCase() === walletAddress.toLowerCase()}`);
    
    // ============== VERIFICATION ON CONTRACT ==============
    
    // Split the signature into its components
    const sig = ethers.Signature.from(signature);
    console.log(`Signature components: v=${sig.v}, r=${sig.r}, s=${sig.s}`);
    
    // Get the Ethereum signed message hash (same as what ethers.js creates)
    const ethSignedMessageHash = await level1Contract.getEthSignedMessageHash(messageHash);
    console.log(`Ethereum signed message hash: ${ethSignedMessageHash}`);
    
    console.log("\nTrying to verify signature on contract...");
    
    // Method 1: Try with method that takes signature components
    try {
      console.log("\nMethod 1: Using verifySignature with components");
      const tx = await level1Contract.verifySignature(
        messageHash, // Original message hash
        sig.v,       // v component
        sig.r,       // r component
        sig.s,       // s component
        {
          gasLimit: 500000 // Set a reasonable gas limit
        }
      );
      
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction confirmed: ${receipt.hash}`);
      console.log(`Gas used: ${receipt.gasUsed}`);
      
      // Check if the level was completed successfully
      const playerLevel = await gameContract.playerLevel(walletAddress);
      console.log(`Player level after verification: ${playerLevel}`);
      
      if (playerLevel >= 1) {
        console.log("🎉 Level 1 completed successfully!");
      } else {
        console.log("Level completion not detected, trying alternative method...");
        throw new Error("Level not completed");
      }
    } catch (error) {
      console.error(`Method 1 failed: ${error.message}`);
      
      // Method 2: Try with normalized v value (0/1 instead of 27/28)
      try {
        console.log("\nMethod 2: Using verifySignature with normalized v value");
        const normalizedV = sig.v - 27; // Convert to 0/1 format
        console.log(`Normalized v: ${normalizedV}`);
        
        const tx = await level1Contract.verifySignature(
          messageHash,
          normalizedV,
          sig.r,
          sig.s,
          {
            gasLimit: 500000
          }
        );
        
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed: ${receipt.hash}`);
        console.log(`Gas used: ${receipt.gasUsed}`);
        
        const playerLevel = await gameContract.playerLevel(walletAddress);
        console.log(`Player level after verification: ${playerLevel}`);
        
        if (playerLevel >= 1) {
          console.log("🎉 Level 1 completed successfully!");
        } else {
          console.log("Level completion not detected, trying final method...");
          throw new Error("Level not completed");
        }
      } catch (error) {
        console.error(`Method 2 failed: ${error.message}`);
        
        // Method 3: Try with the bytes method
        try {
          console.log("\nMethod 3: Using verifySignatureBytes");
          
          const tx = await level1Contract.verifySignatureBytes(
            messageHash,
            signature,
            {
              gasLimit: 500000
            }
          );
          
          console.log(`Transaction sent: ${tx.hash}`);
          const receipt = await tx.wait();
          console.log(`Transaction confirmed: ${receipt.hash}`);
          console.log(`Gas used: ${receipt.gasUsed}`);
          
          const playerLevel = await gameContract.playerLevel(walletAddress);
          console.log(`Player level after verification: ${playerLevel}`);
          
          if (playerLevel >= 1) {
            console.log("🎉 Level 1 completed successfully!");
          } else {
            console.log("❌ All methods failed to complete the level");
          }
        } catch (error) {
          console.error(`Method 3 failed: ${error.message}`);
          console.log("❌ All methods failed to complete the level");
        }
      }
    }
  } catch (error) {
    console.error(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });