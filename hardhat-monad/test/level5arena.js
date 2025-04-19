// scripts/solve-level5.js
const { ethers } = require("hardhat");

async function main() {
  const { contractAddresses } = await import('../frontend/src/config/addresses.js');
  
  console.log("🌟 BLOCKCHAIN GUARDIAN: LEVEL 5 CONSENSUS ARENA 🌟");
  console.log("===================================================");
  
  // Get the signer account
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get the Level5 contract address
  const LEVEL5_CONTRACT_ADDRESS = process.env.LEVEL5_CONTRACT_ADDRESS || contractAddresses.Level5ConsensusArena;
  const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || contractAddresses.BlockchainGuardianGame;
  
  console.log(`Level5 Contract: ${LEVEL5_CONTRACT_ADDRESS}`);
  console.log(`Game Contract: ${GAME_CONTRACT_ADDRESS}`);
  
  // Get current player level
  const gameContract = await ethers.getContractAt(
    ["function playerLevel(address player) view returns (uint256)"],
    GAME_CONTRACT_ADDRESS
  );
  
  const initialLevel = await gameContract.playerLevel(deployer.address);
  console.log(`Current player level: ${initialLevel}`);
  
  if (Number(initialLevel) >= 5) {
    console.log("You've already completed Level 5!");
    return;
  }
  
  // Create the Level5 contract interface
  const level5Contract = await ethers.getContractAt([
    "function currentBlockId() view returns (uint256)",
    "function stake(address) view returns (uint256)",
    "function totalStake() view returns (uint256)",
    "function hasVoted(address,uint256) view returns (bool)",
    "function stakeTokens() external payable",
    "function submitVote(bool) external",
    "function unstake(uint256) external"
  ], LEVEL5_CONTRACT_ADDRESS);
  
  // Deploy helper contracts for additional voting power
  console.log("\nDeploying voting helper contracts...");
  const VotingHelper = await ethers.getContractFactory("VotingHelper");
  
  const helper1 = await VotingHelper.deploy(LEVEL5_CONTRACT_ADDRESS);
  await helper1.deployTransaction.wait();
  console.log(`Helper 1 deployed to: ${helper1.address}`);
  
  const helper2 = await VotingHelper.deploy(LEVEL5_CONTRACT_ADDRESS);
  await helper2.deployTransaction.wait();
  console.log(`Helper 2 deployed to: ${helper2.address}`);
  
  // Check the consensus threshold and determine needed stake
  const totalStake = await level5Contract.totalStake();
  console.log(`\nCurrent total stake: ${ethers.utils.formatEther(totalStake)} ETH`);
  
  // Stake tokens to gain voting power
  const stakeAmount = ethers.utils.parseEther("1.0"); // Stake 1 ETH
  console.log(`\nStaking ${ethers.utils.formatEther(stakeAmount)} ETH from main account...`);
  const stakeTx = await level5Contract.stakeTokens({ value: stakeAmount });
  await stakeTx.wait();
  
  // Have helper contracts stake tokens too
  const helperStakeAmount = ethers.utils.parseEther("0.5"); // 0.5 ETH each
  console.log(`Staking ${ethers.utils.formatEther(helperStakeAmount)} ETH from each helper...`);
  
  const helper1StakeTx = await helper1.stakeAndVote(true, { value: helperStakeAmount });
  await helper1StakeTx.wait();
  
  const helper2StakeTx = await helper2.stakeAndVote(true, { value: helperStakeAmount });
  await helper2StakeTx.wait();
  
  // Check updated total stake
  const updatedTotalStake = await level5Contract.totalStake();
  console.log(`Updated total stake: ${ethers.utils.formatEther(updatedTotalStake)} ETH`);
  
  // Vote on current block and upcoming blocks until completion
  console.log("\nStarting the voting process for 3 consecutive blocks...");
  
  // Track current block
  let startBlockId = await level5Contract.currentBlockId();
  console.log(`Starting with block ID: ${startBlockId}`);
  
  // We need to vote on 3 consecutive finalized blocks to complete the level
  const targetBlockId = startBlockId + 3;
  
  // Vote on all blocks until we reach the target
  while ((await level5Contract.currentBlockId()) < targetBlockId) {
    const currentBlockId = await level5Contract.currentBlockId();
    console.log(`\nProcessing block ID: ${currentBlockId}`);
    
    // Check if we've already voted
    const hasVoted = await level5Contract.hasVoted(deployer.address, currentBlockId);
    if (!hasVoted) {
      console.log(`Voting on block ${currentBlockId}...`);
      const voteTx = await level5Contract.submitVote(true);
      await voteTx.wait();
      console.log(`Vote submitted from main account`);
    } else {
      console.log(`Already voted on block ${currentBlockId}`);
    }
    
    // Check if helper1 has voted
    const helper1HasVoted = await level5Contract.hasVoted(helper1.address, currentBlockId);
    if (!helper1HasVoted) {
      console.log(`Helper 1 voting on block ${currentBlockId}...`);
      const helper1VoteTx = await helper1.submitVote(true);
      await helper1VoteTx.wait();
    }
    
    // Check if helper2 has voted
    const helper2HasVoted = await level5Contract.hasVoted(helper2.address, currentBlockId);
    if (!helper2HasVoted) {
      console.log(`Helper 2 voting on block ${currentBlockId}...`);
      const helper2VoteTx = await helper2.submitVote(true);
      await helper2VoteTx.wait();
    }
    
    // Check if the block has been finalized by comparing current block ID
    const newBlockId = await level5Contract.currentBlockId();
    if (newBlockId > currentBlockId) {
      console.log(`Block ${currentBlockId} has been finalized!`);
    } else {
      console.log(`Waiting for more votes to finalize block ${currentBlockId}...`);
      
      // If we reach this point, we might need additional voters
      // In a real scenario, you'd need to coordinate with other players
      // For testing, we might deploy more helpers if needed
    }
    
    // Wait a bit before checking again (if the block hasn't been finalized)
    if (newBlockId === currentBlockId) {
      console.log("Waiting for block finalization...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
  }
  
  // Check if level completed
  const finalLevel = await gameContract.playerLevel(deployer.address);
  console.log(`\nFinal player level: ${finalLevel}`);
  
  if (Number(finalLevel) > Number(initialLevel)) {
    console.log("\n🎮 LEVEL 5 COMPLETED SUCCESSFULLY! 🎮");
  } else {
    console.log("\n❌ Level not completed. Make sure you've participated in at least 3 consecutive successful consensus rounds.");
  }
  
  // Unstake our tokens
  console.log("\nUnstaking tokens...");
  const ourStake = await level5Contract.stake(deployer.address);
  if (ourStake.gt(0)) {
    const unstakeTx = await level5Contract.unstake(ourStake);
    await unstakeTx.wait();
    console.log(`Unstaked ${ethers.utils.formatEther(ourStake)} ETH`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });