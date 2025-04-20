// scripts/deploy-reentrancy-attacker.ts
// Run with: npx hardhat run scripts/deploy-reentrancy-attacker.ts --network monad

import hre from "hardhat";
import { getAddress } from "viem";
import fs from 'fs';
import path from 'path';

// Interface for contract addresses
interface ContractAddresses {
  Level4ReentrancyLabyrinth?: string;
  BlockchainGuardianGame?: string;
  [key: string]: string | undefined;
}

// Interface for deployed addresses
interface DeployedAddresses {
  ReentrancyAttacker?: string;
  [key: string]: string | undefined;
}

async function main() {
  try {
    console.log("🚀 DEPLOYING REENTRANCY ATTACKER CONTRACT 🚀");
    console.log("============================================");

    // Import contract addresses if available
    let contractAddresses: ContractAddresses = {};
    
    // First try to load from deployment-addresses.json
    const deploymentPath = path.join(__dirname, '../deployment-addresses.json');
    if (fs.existsSync(deploymentPath)) {
      try {
        const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
        contractAddresses = JSON.parse(deploymentData);
        console.log("Loaded addresses from deployment-addresses.json");
      } catch (error) {
        console.warn("Could not parse deployment-addresses.json, will try frontend config.");
      }
    }
    
    // If addresses not found, try frontend config
    if (!contractAddresses.Level4ReentrancyLabyrinth) {
      try {
        // @ts-ignore
        const addressesModule = await import('../frontend/src/config/addresses.js');
        contractAddresses = addressesModule.contractAddresses || {};
        console.log("Loaded addresses from frontend config");
      } catch (error) {
        console.warn("Could not import contract addresses from frontend config.");
      }
    }

    // Get deployer wallet
    const [deployer] = await hre.viem.getWalletClients();
    const deployerAddress = deployer.account.address;
    console.log(`Deploying contract with account: ${getAddress(deployerAddress)}`);

    // Check deployer balance
    const publicClient = await hre.viem.getPublicClient();
    const balance = await publicClient.getBalance({
      address: getAddress(deployerAddress)
    });
    console.log(`Account balance: ${balance / BigInt(10**18)} MONAD`);

    // Get the target contract address
    const LEVEL4_CONTRACT_ADDRESS = process.env.LEVEL4_CONTRACT_ADDRESS || contractAddresses.Level4ReentrancyLabyrinth;
    
    if (!LEVEL4_CONTRACT_ADDRESS) {
      throw new Error("Level4 contract address not found. Please set LEVEL4_CONTRACT_ADDRESS env variable or ensure it's in deployment-addresses.json");
    }
    
    console.log(`Target contract (Level4): ${LEVEL4_CONTRACT_ADDRESS}`);
    
    // Compile contracts if needed
    console.log("\nCompiling contracts...");
    await hre.run('compile');
    
    // Deploy the ReentrancyAttacker contract
    console.log("Deploying ReentrancyAttacker...");
    const attackerContract = await hre.viem.deployContract("ReentrancyAttacker", [
      LEVEL4_CONTRACT_ADDRESS
    ]);
    
    console.log(`\n✅ ReentrancyAttacker deployed at: ${attackerContract.address}`);
    
    // Save the deployed address for later use
    const addressesFilePath = path.join(__dirname, '../deployed-addresses.json');
    let addressesData: DeployedAddresses = {};
    
    if (fs.existsSync(addressesFilePath)) {
      try {
        const fileData = fs.readFileSync(addressesFilePath, 'utf8');
        addressesData = JSON.parse(fileData);
      } catch (error) {
        console.warn("Could not parse existing addresses file. Creating new one.");
      }
    }
    
    addressesData.ReentrancyAttacker = attackerContract.address;
    fs.writeFileSync(addressesFilePath, JSON.stringify(addressesData, null, 2));
    console.log(`Contract address saved to ${addressesFilePath}`);
    
    // Output summary and next steps
    console.log("\nDeployment summary:");
    console.log(`- Deployer: ${getAddress(deployerAddress)}`);
    console.log(`- Target contract: ${LEVEL4_CONTRACT_ADDRESS}`);
    console.log(`- ReentrancyAttacker: ${attackerContract.address}`);
    console.log(`- Network: ${hre.network.name}`);
    
    console.log("\nNext steps:");
    console.log("1. Run the Level4 solver script to execute the attack");
    console.log("2. Verify your contract using:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${attackerContract.address} "${LEVEL4_CONTRACT_ADDRESS}"`);
    
    return { ReentrancyAttacker: attackerContract.address };
  } catch (error: any) {
    console.error(`\n❌ Deployment failed: ${error.message}`);
    if (error.reason) console.error(`Reason: ${error.reason}`);
    if (error.code) console.error(`Error code: ${error.code}`);
    process.exit(1);
  }
}

// Execute the main function
main()
  .then((deploymentAddresses) => {
    console.log("Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });