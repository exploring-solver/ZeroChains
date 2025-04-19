// deploy.ts - TypeScript script to deploy game contracts to Monad network
// Run with: npx hardhat run scripts/deploy.ts --network monad

import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Deploying Blockchain Guardian Game contracts to Monad network...");

  // Get deployer wallet
  const [deployer] = await hre.viem.getWalletClients();
  const deployerAddress = deployer.account.address;
  console.log(`Deploying contracts with the account: ${getAddress(deployerAddress)}`);

  // Check deployer balance
  const publicClient = await hre.viem.getPublicClient();
  const balance = await publicClient.getBalance({
    address: getAddress(deployerAddress)
  });
  console.log(`Account balance: ${balance / BigInt(10**18)} MONAD`);

  // Deploy main game contract
  console.log("Deploying BlockchainGuardianGame...");
  const gameContract = await hre.viem.deployContract("BlockchainGuardianGame", []);
  console.log(`BlockchainGuardianGame deployed to: ${gameContract.address}`);

  // Deploy Level 1: Genesis Block
  console.log("Deploying Level1Genesis...");
  const level1Contract = await hre.viem.deployContract("Level1Genesis", [gameContract.address]);
  console.log(`Level1Genesis deployed to: ${level1Contract.address}`);

  // Set Level 1 contract in the game
  console.log("Registering Level 1 in the game contract...");
  const setLevel1Tx = await gameContract.write.setLevelContract([1n, level1Contract.address]);
  await publicClient.waitForTransactionReceipt({ hash: setLevel1Tx });
  console.log("Level 1 registered in the game contract");

  // Deploy Level 2: Hash Fortress
  // For Level 2, we need a target prefix hash
  console.log("Deploying Level2HashFortress...");
  // Create a target prefix hash - in a real implementation you might want to generate this differently
  const targetPrefixHash = "0x1234567800000000000000000000000000000000000000000000000000000000";

  const level2Contract = await hre.viem.deployContract("Level2HashFortress", [
    gameContract.address,
    targetPrefixHash
  ]);
  console.log(`Level2HashFortress deployed to: ${level2Contract.address}`);

  // Set Level 2 contract in the game
  console.log("Registering Level 2 in the game contract...");
  const setLevel2Tx = await gameContract.write.setLevelContract([2n, level2Contract.address]);
  await publicClient.waitForTransactionReceipt({ hash: setLevel2Tx });
  console.log("Level 2 registered in the game contract");

  // Deploy Level 3: Merkle Maze
  console.log("Deploying Level3MerkleMaze...");
  // Create a sample Merkle root for the puzzle
  // In a real implementation, you would generate this more carefully
  const sampleRoot = "0x7465737400000000000000000000000000000000000000000000000000000000"; // Example root hash

  const level3Contract = await hre.viem.deployContract("Level3MerkleMaze", [
    gameContract.address,
    sampleRoot
  ]);
  console.log(`Level3MerkleMaze deployed to: ${level3Contract.address}`);

  // Set Level 3 contract in the game
  console.log("Registering Level 3 in the game contract...");
  const setLevel3Tx = await gameContract.write.setLevelContract([3n, level3Contract.address]);
  await publicClient.waitForTransactionReceipt({ hash: setLevel3Tx });
  console.log("Level 3 registered in the game contract");

  // Deploy Level 4: Reentrancy Labyrinth
  console.log("Deploying Level4ReentrancyLabyrinth...");
  // Fund it with some ETH for the reentrancy puzzle
  const level4Contract = await hre.viem.deployContract(
    "Level4ReentrancyLabyrinth",
    [gameContract.address],
    { value: parseEther("0.5") }
  );
  console.log(`Level4ReentrancyLabyrinth deployed to: ${level4Contract.address}`);

  // Set Level 4 contract in the game
  console.log("Registering Level 4 in the game contract...");
  const setLevel4Tx = await gameContract.write.setLevelContract([4n, level4Contract.address]);
  await publicClient.waitForTransactionReceipt({ hash: setLevel4Tx });
  console.log("Level 4 registered in the game contract");

  // Deploy Level 5: Consensus Arena
  console.log("Deploying Level5ConsensusArena...");
  const level5Contract = await hre.viem.deployContract("Level5ConsensusArena", [gameContract.address]);
  console.log(`Level5ConsensusArena deployed to: ${level5Contract.address}`);

  // Set Level 5 contract in the game
  console.log("Registering Level 5 in the game contract...");
  const setLevel5Tx = await gameContract.write.setLevelContract([5n, level5Contract.address]);
  await publicClient.waitForTransactionReceipt({ hash: setLevel5Tx });
  console.log("Level 5 registered in the game contract");

  console.log("All contracts deployed and registered successfully!");
  
  // Display summary of deployed contracts
  console.log("\nDeployment Summary:");
  console.log("====================");
  console.log(`BlockchainGuardianGame: ${gameContract.address}`);
  console.log(`Level1Genesis: ${level1Contract.address}`);
  console.log(`Level2HashFortress: ${level2Contract.address}`);
  console.log(`Level3MerkleMaze: ${level3Contract.address}`);
  console.log(`Level4ReentrancyLabyrinth: ${level4Contract.address}`);
  console.log(`Level5ConsensusArena: ${level5Contract.address}`);
  
  // Save contract addresses to a JSON file for post-deployment processing
  const deploymentAddresses = {
    BlockchainGuardianGame: gameContract.address,
    Level1Genesis: level1Contract.address,
    Level2HashFortress: level2Contract.address,
    Level3MerkleMaze: level3Contract.address,
    Level4ReentrancyLabyrinth: level4Contract.address,
    Level5ConsensusArena: level5Contract.address
  };

  const deploymentPath = path.join(__dirname, '../deployment-addresses.json');
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentAddresses, null, 2)
  );
  console.log(`\nDeployment addresses saved to: ${deploymentPath}`);
  
  console.log("\nRun the post-deployment script to update frontend configuration:");
  console.log("npx hardhat run scripts/post-deploy.ts");
  
  return deploymentAddresses;
}

// Execute the deployment
main()
  .then((deploymentAddresses) => {
    console.log("Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });