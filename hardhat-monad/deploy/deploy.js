// deploy.js - Script to deploy game contracts to Monad network
// Run with: npx hardhat run scripts/deploy.js --network monad

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Blockchain Guardian Game contracts to Monad network...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${ethers.utils.formatEther(balance)} MONAD`);

  // Deploy main game contract
  const BlockchainGuardianGame = await ethers.getContractFactory("BlockchainGuardianGame");
  const gameContract = await BlockchainGuardianGame.deploy();
  await gameContract.deployed();
  console.log(`BlockchainGuardianGame deployed to: ${gameContract.address}`);

  // Deploy Level 1: Genesis Block
  const Level1Genesis = await ethers.getContractFactory("Level1Genesis");
  const level1Contract = await Level1Genesis.deploy(gameContract.address);
  await level1Contract.deployed();
  console.log(`Level1Genesis deployed to: ${level1Contract.address}`);

  // Set Level 1 contract in the game
  let tx = await gameContract.setLevelContract(1, level1Contract.address);
  await tx.wait();
  console.log("Level 1 registered in the game contract");

  // Deploy Level 2: Hash Fortress
  // For Level 2, we need a target prefix hash
  const targetPrefixBytes = ethers.utils.arrayify("0x12345678");
  const targetPrefixHash = ethers.utils.hexZeroPad(targetPrefixBytes, 32);

  const Level2HashFortress = await ethers.getContractFactory("Level2HashFortress");
  const level2Contract = await Level2HashFortress.deploy(gameContract.address, targetPrefixHash);
  await level2Contract.deployed();
  console.log(`Level2HashFortress deployed to: ${level2Contract.address}`);

  // Set Level 2 contract in the game
  tx = await gameContract.setLevelContract(2, level2Contract.address);
  await tx.wait();
  console.log("Level 2 registered in the game contract");

  // Deploy Level 3: Merkle Maze
  // Create a sample Merkle root for the puzzle
  // In a real implementation, you would generate this more carefully
  const sampleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Merkle Root"));

  const Level3MerkleMaze = await ethers.getContractFactory("Level3MerkleMaze");
  const level3Contract = await Level3MerkleMaze.deploy(gameContract.address, sampleRoot);
  await level3Contract.deployed();
  console.log(`Level3MerkleMaze deployed to: ${level3Contract.address}`);

  // Set Level 3 contract in the game
  tx = await gameContract.setLevelContract(3, level3Contract.address);
  await tx.wait();
  console.log("Level 3 registered in the game contract");

  // Deploy Level 4: Reentrancy Labyrinth
  // Fund it with some ETH for the reentrancy puzzle
  const Level4ReentrancyLabyrinth = await ethers.getContractFactory("Level4ReentrancyLabyrinth");
  const level4Contract = await Level4ReentrancyLabyrinth.deploy(
    gameContract.address,
    { value: ethers.utils.parseEther("0.5") }
  );
  await level4Contract.deployed();
  console.log(`Level4ReentrancyLabyrinth deployed to: ${level4Contract.address}`);

  // Set Level 4 contract in the game
  tx = await gameContract.setLevelContract(4, level4Contract.address);
  await tx.wait();
  console.log("Level 4 registered in the game contract");

  // Deploy Level 5: Consensus Arena
  const Level5ConsensusArena = await ethers.getContractFactory("Level5ConsensusArena");
  const level5Contract = await Level5ConsensusArena.deploy(gameContract.address);
  await level5Contract.deployed();
  console.log(`Level5ConsensusArena deployed to: ${level5Contract.address}`);

  // Set Level 5 contract in the game
  tx = await gameContract.setLevelContract(5, level5Contract.address);
  await tx.wait();
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
  
  // Generate ABI files for frontend (simplified for example)
  console.log("\nRemember to generate ABI files for the frontend!");
  console.log("You can use the following command:");
  console.log("npx hardhat export-abi");
  
  console.log("\nUpdate the frontend config with these contract addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });